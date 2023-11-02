import {
  NavigationMenu, NavigationMenuItem, NavigationMenuList
} from "@/components/ui/navigation-menu";
import NavigationLink from "../NavigationLink";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RiMenu4Fill } from "react-icons/ri";
import { IconContext } from "react-icons";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";

const UnauthenticatedNavigation: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const { loginWithRedirect } = useAuth0();
  return (
    <>
      <div className="hidden lg:flex w-full items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList className="gap-5">
            <NavigationMenuItem>
              <NavigationLink to="/">
                Home
              </NavigationLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationLink to="/about">
                About
              </NavigationLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationLink to="/features">
                Features
              </NavigationLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationLink to="/support">
                Support/Help
              </NavigationLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button onClick={() => loginWithRedirect()}>Login</Button>
      </div>
      <div className="block lg:hidden w-full flex flex-row items-center justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 "
            >
              <IconContext.Provider value={{ className: "h-5 w-5" }}>
                <RiMenu4Fill />
                <span className="text-lg font-bold ml-2">Dimewise</span>
              </IconContext.Provider>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 text-lg">
            <div className="flex flex-row items-center mb-5">
              <IconContext.Provider value={{ className: "h-5 w-5" }}>
                <RiMenu4Fill />
                <span className="font-bold ml-2">Dimewise</span>
              </IconContext.Provider>
            </div>
            <div className="flex flex-col gap-5">
              <NavigationLink
                to="/"
                onOpenChange={setOpen}
              >
                Home
              </NavigationLink>
              <NavigationLink
                to="/about"
                onOpenChange={setOpen}
              >
                About
              </NavigationLink>
              <NavigationLink
                to="/features"
                onOpenChange={setOpen}
              >
                Features
              </NavigationLink>
              <NavigationLink
                to="/support"
                onOpenChange={setOpen}
              >
                Support/Help
              </NavigationLink>
            </div>
          </SheetContent>
        </Sheet>
        <Button onClick={() => loginWithRedirect()}>Login</Button>
      </div>
    </>
  )
}

export default UnauthenticatedNavigation;
