import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CreateUpdateCategory } from "../../pages/Categories";
import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { CategoryForm } from "./CategoryForm";

interface Props {
  category: CreateUpdateCategory | null;
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

export const CategoryFormPopup = ({ category, open, handleClose, handleSubmit }: Props) => {
  const { t } = useTranslation();
  const [formTitle, setFormTitle] = useState("");
  useEffect(() => {
    // Has to be done this way so that title doesnt change when modal is closed (due to animation)
    if (category === null) return;
    setFormTitle(category?.id ? t("categories.form.title.edit_category") : t("categories.form.title.create_category"));
  }, [category, t]);

  return (
    <>
      <MobileDrawer
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <CategoryForm
          handleSubmit={handleSubmit}
          category={category}
        />
      </MobileDrawer>
      <DesktopDialog
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <CategoryForm
          handleSubmit={handleSubmit}
          category={category}
        />
      </DesktopDialog>
    </>
  );
};
