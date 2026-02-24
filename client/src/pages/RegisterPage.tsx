import { SignUp } from "@clerk/clerk-react";
import { Flex } from "antd";
import { RoutesEnum } from "@/routes/Routes";

export const RegisterPage = () => {
	return (
		<Flex
			justify="center"
			align="center"
			style={{ minHeight: "calc(100vh - 64px)", padding: "24px 0" }}
		>
			<SignUp
				routing="path"
				path={RoutesEnum.register}
				signInUrl={RoutesEnum.login}
				forceRedirectUrl={RoutesEnum.dashboard}
			/>
		</Flex>
	);
};
