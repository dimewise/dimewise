import { useAuth0 } from "@auth0/auth0-react";
import AppButton from "../../components/AppButton";
import { Navigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  console.log("dashboard", isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />;
  }
  return (
    <div>
      <p>User&apos;s name: {user?.name}</p>
      <p>User&apos;s email: {user?.email}</p>
      <AppButton
        label="Logout"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      />
    </div>
  );
};

export default Dashboard;
