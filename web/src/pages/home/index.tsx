import { useAuth0 } from "@auth0/auth0-react";
import LoginPage from "../login";
import { Navigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  console.log(isAuthenticated);

  if (isAuthenticated) {
    console.log(isAuthenticated);
    return <Navigate to="/dashboard" replace={true} />;
  }
  return <LoginPage />;
};

export default HomePage;
