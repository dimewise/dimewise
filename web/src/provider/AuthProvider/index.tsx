import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0, Auth0Provider } from '@auth0/auth0-react';
import { setDimewiseToken } from '../../api/custom-fetch';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextProps {
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const { getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);
      } catch (error) {
        // Handle error if unable to fetch access token
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (accessToken !== null) {
      setDimewiseToken(accessToken);
    }
  }, [accessToken])

  console.log(accessToken);

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <AuthContext.Provider value={{ accessToken }}>
        {children}
      </AuthContext.Provider >
    </Auth0Provider>
  );
};

export default AuthProvider;

