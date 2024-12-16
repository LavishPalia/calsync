import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../axios/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const GoogleLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = localStorage.getItem("user-info");
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.email) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
    }
  }, []);

  const googleResponse = async (authResult: any) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult["code"]);

        console.log(result);

        const token = result.data.token;

        const { email, name, avatar } = result.data.user;

        const userInfo = {
          email,
          name,
          avatar,
          token,
        };

        localStorage.setItem("user-info", JSON.stringify(userInfo));
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(`Error while requesting google code: , ${error}`);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: googleResponse,
    onError: googleResponse,
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly",
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-gray-800 to-gray-900">
      <h1 className="text-4xl text-transparent transition-all delay-100 bg-transparent hover:scale-105 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Sign In CalSync
      </h1>
      <button
        onClick={googleLogin}
        className="px-4 py-2 text-xl font-medium text-black bg-gray-300 rounded-lg"
      >
        Login with Google
      </button>
    </div>
  );
};

export default GoogleLogin;
