import { SignUp } from "@clerk/clerk-react";
import { RoutesEnum } from "@/routes/Routes";

export const RegisterPage = () => {
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
