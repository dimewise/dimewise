import { NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import React from "react";
import { Link, Path, useMatch, useResolvedPath } from "react-router-dom";

interface NavigationLinkProps {
  to: string | Partial<Path>;
  children: React.ReactNode;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  to,
  children,
}) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <Link to={to} className={isActive ? "active" : ""}>
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        {children}
      </NavigationMenuLink>
    </Link>
  );
};

export default NavigationLink;
