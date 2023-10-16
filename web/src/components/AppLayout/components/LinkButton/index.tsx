import React from "react";
import { Link, Path, useMatch, useResolvedPath } from "react-router-dom";

interface LinkButtonProps {
  to: string | Partial<Path>;
  children: React.ReactNode;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  to,
  children,
}: LinkButtonProps) => {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <Link to={to} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
};

export default LinkButton;
