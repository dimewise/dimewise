import { useAuth0 } from "@auth0/auth0-react";
import AppButton from "../../components/AppButton";
import { Navigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  console.log("login", isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center font-go ">
      <h1 className="text-6xl pb-4">Dimewise</h1>
      <p className="pb-12">Take control of your budget</p>
      <AppButton label="Login" onClick={() => loginWithRedirect()} />
    </div>
  );
};

export default LoginPage;
