import { useTranslation } from "react-i18next";
import { Box, Button, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { useDeleteCategoryApiV1CategoryCategoryIdDeleteMutation, type CategoryFull } from "../../services/api/v1";
import { useState, type PropsWithChildren } from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";

interface Props {
  category: CategoryFull
  handleSubmit: () => void;
  handleSetCategory: () => void;
}

export const Category = ({ children, category, handleSubmit, handleSetCategory }: PropsWithChildren<Props>) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [deleteCategory] = useDeleteCategoryApiV1CategoryCategoryIdDeleteMutation();
  // const [open, setOpen] = useState<boolean>(false);

  // const handleClick = () => {
  //   setOpen((prev) => !prev)
  // }

  const open = Boolean(anchor);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };

  const handleEdit = () => {
    handleSetCategory();
    handleClose();
  }

  const handleDelete = () => {
    deleteCategory({ categoryId: category.id });
    handleClose();
    handleSubmit();
  }

  return (
    <Stack>
      <Stack alignItems='center' width='300px' padding="8px 16px" key={category.id} direction='row'>
        <Box width='150px'>{category.name}</Box>
        <Box>{category.budget}</Box>
        {/* <IconButton onClick={handleClick}> */}
        {/*   {open ? <ExpandLess /> : <ExpandMore />} */}
        {/* </IconButton> */}
        <IconButton sx={{ marginLeft: 'auto' }} onClick={handleClick}>
          <MoreVertRounded />
        </IconButton>
        <Menu anchorEl={anchor} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}>{t('common.button.edit')}</MenuItem>
          <MenuItem onClick={handleDelete}>{t('common.button.delete')}</MenuItem>
        </Menu>
      </Stack>
      {/* {open && children} */}
    </Stack>
  );
};
