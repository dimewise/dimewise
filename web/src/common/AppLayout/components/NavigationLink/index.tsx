import React from "react";
import { Link, Path, useMatch, useResolvedPath } from "react-router-dom";

interface NavigationLinkProps {
  to: string | Partial<Path>;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  to,
  children,
  onOpenChange,
}) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <Link
      onClick={() => onOpenChange?.(false)}
      to={to}
      className={`text-lg lg:text-sm transition-colors hover:text-primary ${isActive ? "font-bold" : "text-muted-foreground font-medium"}`}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;
