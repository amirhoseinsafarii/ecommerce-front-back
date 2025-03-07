import CommonForm from "@/components/common/form";
import { toast } from "sonner";
import { loginFormControls } from "@/config";
import { loginUser, sendRecoveryLink } from "@/store/auth-slice";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = {
  email: "",
  password: "",
};

// Replace with your actual reCAPTCHA site key
const RECAPTCHA_SITE_KEY = "6LenHecqAAAAAJLuHKOcl3759E40Epg9lg-xjvjD";

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isVerified, setIsVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const recaptchaRef = useRef(null);
  const dispatch = useDispatch();

  const handleRecaptchaChange = (value) => {
    setIsVerified(!!value);
  };

  function onSubmit(event) {
    event.preventDefault();

    if (!isVerified) {
      toast("Please complete the reCAPTCHA verification");
      return;
    }

    // Get the reCAPTCHA token
    const recaptchaToken = recaptchaRef.current.getValue();

    // Add the token to the form data
    const formDataWithToken = {
      ...formData,
      recaptchaToken,
    };

    dispatch(loginUser(formDataWithToken)).then((data) => {
      if (data?.payload?.success) {
        toast(data?.payload?.message);
        // Reset reCAPTCHA after successful login
        recaptchaRef.current.reset();
        setIsVerified(false);
      } else {
        toast(data?.payload?.message, "destructive");
      }
    });
  }

  const handleForgotPassword = () => {
    if (!recoveryEmail && !recoveryPhone) {
      toast("Please enter either email or phone number");
      return;
    }

    dispatch(
      sendRecoveryLink({ email: recoveryEmail, phone: recoveryPhone })
    ).then((data) => {
      if (data?.payload?.success) {
        toast("Recovery link sent successfully!");
        setShowForgotPassword(false);
        setRecoveryEmail("");
        setRecoveryPhone("");
      } else {
        toast(data?.payload?.message, "destructive");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don&apos;t have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="text-center">
        <Button
          onClick={() => setShowForgotPassword(true)}
          className="text-primary hover:underline hover:bg-transparent text-sm bg-transparent"
        >
          Forgot Password?
        </Button>
      </div>
      <div className="flex justify-center mt-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          theme="light"
        />
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleForgotPassword}>
              Send Recovery Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuthLogin;
