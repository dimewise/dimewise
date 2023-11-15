import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setDimewiseToken } from '../../api/custom-fetch';
import { useNavigate } from 'react-router-dom';

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
      // Check if the current route is a protected route
      if (!['/'].includes(window.location.pathname)) {
        try {
          const token = await getAccessTokenSilently();
          setAccessToken(token);
        } catch (error) {
          // Handle error if unable to fetch access token
          console.error('Error fetching access token:', error);
        }
      }
    };

    fetchAccessToken();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (accessToken !== null) {
      setDimewiseToken(accessToken);
    }
  }, [accessToken])

  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider >
  );
};

export default AuthProvider;

