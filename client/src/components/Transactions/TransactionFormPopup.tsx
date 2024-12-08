import { useTranslation } from "react-i18next";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { TransactionForm } from "./TransactionForm";

interface Props {
  open: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
}

export const TransactionFormPopup = ({ open, handleSubmit, handleClose }: Props) => {
  const { t } = useTranslation();
  const formTitle = t("transactions.form.title.create_transaction");
  return (
    <>
      <MobileDrawer
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <TransactionForm
          handleSubmit={handleSubmit}
          handleClose={handleClose}
        />
      </MobileDrawer>
      <DesktopDialog
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <TransactionForm
          handleSubmit={handleSubmit}
          handleClose={handleClose}
        />
      </DesktopDialog>
    </>
  );
};
