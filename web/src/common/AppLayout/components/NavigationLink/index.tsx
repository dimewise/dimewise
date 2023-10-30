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
    <Link to={to} className={`text-sm transition-colors hover:text-primary ${isActive ? "font-bold" : "text-muted-foreground font-medium"}`}>
      {children}
    </Link>
  );
};

export default NavigationLink;
