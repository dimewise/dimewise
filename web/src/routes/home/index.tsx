import { useAuth0 } from "@auth0/auth0-react";
import { AppButton } from "../../components/AppButton";
import { LoginPage } from "../login";

export function HomePage() {
  const { user, isAuthenticated, logout } = useAuth0();

  console.log(isAuthenticated);
  return (
    <>
      {isAuthenticated ? (
        <div>
          <p>User&apos;s name: {user?.name}</p>
          <p>User&apos;s email: {user?.email}</p>
          <AppButton
            label="Logout"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          />{" "}
        </div>
      ) : (
        <LoginPage />
      )}
    </>
  );
}
