import { SignIn } from "@clerk/clerk-react";
import { Flex } from "antd";
import { RoutesEnum } from "@/routes/Routes";

export const LoginPage = () => {
	return (
		<Flex
			justify="center"
			align="center"
			style={{ minHeight: "calc(100vh - 64px)", padding: "24px 0" }}
		>
			<SignIn
				routing="path"
				path={RoutesEnum.login}
				signUpUrl={RoutesEnum.register}
				forceRedirectUrl={RoutesEnum.dashboard}
			/>
		</Flex>
	);
};
