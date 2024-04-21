import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Paths } from "../routes/routes";
import { useAuth } from "./AuthProvider";

const ProtectedPage = ({ children }: PropsWithChildren) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to={Paths.Login} replace />;
	}

	return children;
};

export default ProtectedPage;
