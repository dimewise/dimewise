import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import { IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrencyValueToLocale, parseCurrencyEnum } from "../../lib/util/currency";
import {
  type CategoryFull,
  useApiV1CategoriesCategoryIdDeleteCategoryMutation,
  useApiV1UsersMeDetailGetMeDetailQuery,
} from "../../services/api/v1";

interface Props {
  category: CategoryFull;
  handleSubmit: () => void;
  handleSetCategory: () => void;
}

export const CategoryListItem = ({ category, handleSubmit, handleSetCategory }: Props) => {
  const { t } = useTranslation();
  const locale = navigator.language;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [deleteCategory] = useApiV1CategoriesCategoryIdDeleteCategoryMutation();
  const { data: meDetail, isLoading: meDetailIsLoading } = useApiV1UsersMeDetailGetMeDetailQuery();

  if (!meDetail || meDetailIsLoading) {
    return <></>;
  }

  const currency = parseCurrencyEnum(meDetail.default_currency, locale);
  const budgetStr = formatCurrencyValueToLocale(category.budget, currency, locale);

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
  };

  const handleDelete = () => {
    deleteCategory({ categoryId: category.id });
    handleClose();
    handleSubmit();
  };

  return (
    <>
      <ListItem
        disablePadding
        key={category.id}
        sx={{ mb: 2 }}
      >
        <Stack
          direction="row"
          sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}
        >
          <ListItemText primary={category.name} />
          <Stack
            direction="row"
            gap={1.5}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography>{budgetStr}</Typography>
            <IconButton onClick={handleClick}>
              <MoreVertRounded />
            </IconButton>
          </Stack>
        </Stack>
      </ListItem>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditOutlined fontSize="small" />
          </ListItemIcon>
          {t("common.button.edit")}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteOutlined fontSize="small" />
          </ListItemIcon>
          {t("common.button.delete")}
        </MenuItem>
      </Menu>
    </>
  );
};
