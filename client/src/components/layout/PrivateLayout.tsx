import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes } from "../../app/Routes";
import { isAuthenticatedSelector } from "../../store/auth/selector";

export const PrivateLayout = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(isAuthenticatedSelector);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={Routes.Login}
        state={{ from: location }}
        replace
      />
    );
  }
  return (
    <div className="bg-green-500">
      <Outlet />
    </div>
  );
};
