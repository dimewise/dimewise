import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../auth/AuthProvider";
import { User } from "../../../data/User";

export const Dashboard = (): ReactElement => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const handleCreateUser = () => {
		if (!user) return;
		const x = User.create(user.id, user.email ?? "", "Halvor", "USD");
		console.log("create", x);
	};
	return (
		<div className="flex-col">
			<div>{t("welcome")}</div>
			<button type="button" onClick={handleCreateUser}>
				Click me pls
			</button>
		</div>
	);
};
