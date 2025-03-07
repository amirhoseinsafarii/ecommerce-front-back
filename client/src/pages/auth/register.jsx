import CommonForm from "@/components/common/form";
import { toast } from "sonner";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

// Use the same reCAPTCHA site key as login
const RECAPTCHA_SITE_KEY = "6LenHecqAAAAAJLuHKOcl3759E40Epg9lg-xjvjD";

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isVerified, setIsVerified] = useState(false);
  const recaptchaRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

    dispatch(registerUser(formDataWithToken)).then((data) => {
      if (data?.payload?.success) {
        toast(data?.payload?.message);
        // Reset reCAPTCHA after successful registration
        recaptchaRef.current.reset();
        setIsVerified(false);
        navigate("/auth/login");
      } else {
        toast(data?.payload?.message);
      }
    });
  }

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="flex justify-center mt-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          theme="light"
        />
      </div>
    </div>
  );
}

export default AuthRegister;
