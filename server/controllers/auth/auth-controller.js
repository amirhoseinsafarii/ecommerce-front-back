const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { verifyRecaptcha } = require("../../utils/recaptcha");
const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const Mailgun = require("mailgun-js"); // Changed to uppercase Mailgun
const { Resend } = require("resend");
//register
const registerUser = async (req, res) => {
  const { userName, email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA first
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.json({
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA first
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.json({
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    console.log(req.user.id);
    next();
  } catch (error) {
    console.log("fsfvldsnvllnvkndk");
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

// configure mailgun
const resend = new Resend("re_CYBQEBPM_6GAb9UTnUKvZgibKa2PfTsLz");

const sendRecoveryLink = async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log(email, phone);
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email/phone",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    // Save token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    if (email) {
      // Send email
      const emailData = {
        from: "onboarding@resend.dev",
        to: email,
        subject: "Password Reset Request",
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
        `,
      };

      console.log(emailData);
      await resend.emails.send(emailData);
      console.log("Email sent successfully");
    } else if (phone) {
      // Here you would integrate with an SMS service
      // For example, using Twilio or another SMS provider
      // For now, we'll just console.log
      console.log(`SMS would be sent to ${phone} with reset URL: ${resetUrl}`);
    }

    res.status(200).json({
      success: true,
      message: "Recovery link sent successfully",
    });
  } catch (error) {
    console.error("Password recovery error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending recovery link",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  sendRecoveryLink,
  resetPassword,
};
