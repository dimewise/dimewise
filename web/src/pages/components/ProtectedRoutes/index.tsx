import { Navigate, Outlet } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";
import { setDimewiseToken } from "../../../api/custom-fetch";
import AppLayout from "../../../common/AppLayout";

export const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  if (isAuthenticated) {
    const fetchAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setDimewiseToken(token)
        // console.log("token here", token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  } else {
    setDimewiseToken("")
  }
  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : <Navigate to="/" replace />;
}

