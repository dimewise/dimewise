import { DesktopDialog } from "../DesktopDialog";
import { MobileDrawer } from "../MobileDrawer";
import { CategoryTransactions } from "./CategoryTransactions";
import type { CategoryFull } from "../../services/api/v1";
import { useEffect, useState } from "react";

interface Props {
  category: CategoryFull | null;
  open: boolean;
  handleClose: () => void;
}

export const CategoryTransactionsPopup = ({ category, open, handleClose }: Props) => {
  const [formTitle, setFormTitle] = useState("");
  useEffect(() => {
    // Has to be done this way so that title doesnt change when modal is closed (due to animation)
    if (category === null) return;
    setFormTitle(category.name)
  }, [category]);

  return (
    <>
      <MobileDrawer
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <CategoryTransactions
          handleClose={handleClose}
          category={category}
        />
      </MobileDrawer>
      <DesktopDialog
        title={formTitle}
        open={open}
        handleClose={handleClose}
      >
        <CategoryTransactions
          handleClose={handleClose}
          category={category}
        />
      </DesktopDialog>
    </>
  );
};
