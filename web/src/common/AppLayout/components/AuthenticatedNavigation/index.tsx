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
const AuthenticatedNavigation: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <div className="hidden lg:block">
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
      </div>
      <div className="block lg:hidden">
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
                to="/dashboard"
                onOpenChange={setOpen}
              >
                Dashboard
              </NavigationLink>
              <NavigationLink
                to="/history"
                onOpenChange={setOpen}
              >
                History
              </NavigationLink>
              <NavigationLink
                to="/wishlist"
                onOpenChange={setOpen}
              >
                Wishlist
              </NavigationLink>
              <NavigationLink
                to="/settings"
                onOpenChange={setOpen}
              >
                Settings
              </NavigationLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export default AuthenticatedNavigation;
