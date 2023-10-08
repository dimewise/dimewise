import { Auth0Provider } from "@auth0/auth0-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}
const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
}: AuthWrapperProps) => {
  const domain: string = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId: string = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience: string = import.meta.env.VITE_AUTH0_AUDIENCE;
  const redirectUri: string = window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience: audience,
        redirect_uri: redirectUri,
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthWrapper;
