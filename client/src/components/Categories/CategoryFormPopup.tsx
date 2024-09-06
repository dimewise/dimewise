import { useTranslation } from "react-i18next";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { CategoryForm } from "./CategoryForm";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleClose: () => void;
}

export const CategoryFormPopup = ({ open, setOpen, handleClose }: Props) => {
  const { t } = useTranslation();
  const formTitle = t("transactions.form.title.create_transaction");

  return (
    <>
      <MobileDrawer
        title={formTitle}
        open={open}
        setOpen={setOpen}
      >
        <CategoryForm handleClose={handleClose} />
      </MobileDrawer>
      <DesktopDialog
        title={formTitle}
        open={open}
        setOpen={setOpen}
      >
        <CategoryForm handleClose={handleClose} />
      </DesktopDialog>
    </>
  );
};
