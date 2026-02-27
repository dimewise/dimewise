import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const LoginPage = () => {
	const { isSignedIn, isLoaded } = useAuth();

	if (isLoaded && isSignedIn) {
		return <Navigate to={RoutesEnum.dashboard} replace />;
	}

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
			<SignIn
				routing="path"
				path={RoutesEnum.login}
				signUpUrl={RoutesEnum.register}
				forceRedirectUrl={RoutesEnum.dashboard}
			/>
		</div>
	);
};
