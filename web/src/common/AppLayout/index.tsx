import { useAuth0 } from "@auth0/auth0-react";
import QuickAccess from "./components/QuickAccess";
import AuthenticatedNavigation from "./components/AuthenticatedNavigation";
import UnauthenticatedNavigation from "./components/UnauthenticatedNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }: AppLayoutProps) => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row h-16 w-full max-w-full justify-between items-center px-5 border-b shrink-0">
        {isAuthenticated ?
          <AuthenticatedNavigation />
          :
          <UnauthenticatedNavigation />
        }
      </div>
      <div className="w-full flex-1 px-5 py-3">{children}</div>
      {isAuthenticated &&
        <>
          <div className="h-20 w-full shrink-0">&nbsp;</div>
          <QuickAccess />
        </>
      }
    </div>
  );
};

export default AppLayout;
