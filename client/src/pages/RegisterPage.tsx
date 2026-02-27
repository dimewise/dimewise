import { SignUp, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const RegisterPage = () => {
	const { isSignedIn, isLoaded } = useAuth();

	if (isLoaded && isSignedIn) {
		return <Navigate to={RoutesEnum.dashboard} replace />;
	}

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
			<SignUp
				routing="path"
				path={RoutesEnum.register}
				signInUrl={RoutesEnum.login}
				forceRedirectUrl={RoutesEnum.dashboard}
			/>
		</div>
	);
};
