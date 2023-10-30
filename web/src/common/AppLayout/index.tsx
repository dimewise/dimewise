import { useAuth0 } from "@auth0/auth0-react";
import {
  NavigationMenu, NavigationMenuItem, NavigationMenuList
} from "@/components/ui/navigation-menu";
import NavigationLink from "./components/NavigationLink";
import { Button } from "@/components/ui/button";
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }: AppLayoutProps) => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row h-16 w-full max-w-full justify-between items-center px-5 border-b shrink-0">
        {isAuthenticated ?
          <>
            <NavigationMenu>
              <NavigationMenuList className="space-x-5">
                <NavigationMenuItem>
                  <NavigationLink to="/dashboard">
                    Dashboard
                  </NavigationLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationLink to="/history">
                    History
                  </NavigationLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationLink to="/wishlist">
                    Wishlist
                  </NavigationLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationLink to="/settings">
                    Settings
                  </NavigationLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </>
          :
          <>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationLink to="/">
                    About
                  </NavigationLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationLink to="/">
                    Features
                  </NavigationLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationLink to="/">
                    Support/Help
                  </NavigationLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button onClick={() => loginWithRedirect()}>Login</Button>
          </>
        }
      </div>
      <div className="w-full flex-1 px-5 py-3">{children}</div>
    </div>
  );
};

export default AppLayout;
