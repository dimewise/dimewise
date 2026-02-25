import { SignIn } from "@clerk/clerk-react";
import { RoutesEnum } from "@/routes/Routes";

export const LoginPage = () => {
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
