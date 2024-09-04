import { useTranslation } from "react-i18next";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { TransactionForm } from "./TransactionForm";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const TransactionFormPopup = ({ open, setOpen }: Props) => {
	const { t } = useTranslation();
	const formTitle = t("transactions.form.title.create_transaction");
	return (
		<>
			<MobileDrawer
				title={formTitle}
				open={open}
				setOpen={setOpen}
			>
				<TransactionForm />
			</MobileDrawer>
			<DesktopDialog
				title={formTitle}
				open={open}
				setOpen={setOpen}
			>
				<TransactionForm />
			</DesktopDialog>
		</>
	);
};
