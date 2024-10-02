import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography, alpha } from "@mui/material";
import { useState } from "react";
import { useApiV1CategoryGetCategoriesQuery, type CategoryFull, type CategoryCreate } from "../services/api/v1";
import { Category } from "../components/Categories/Category";
import { useTranslation } from "react-i18next";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";

export type CreateUpdateCategory = CategoryCreate & { id: string }

export const Categories = () => {
  const { t } = useTranslation();
  const { data: categories, refetch } = useApiV1CategoryGetCategoriesQuery()
  const total = categories?.reduce((acc, { budget }) => acc + budget, 0)
  const [category, setCategory] = useState<CreateUpdateCategory | null>(null)

  const handleOnClickCreate = () => {
    setCategory({ id: "", name: "", budget: 0 });
  };

  const handleSubmit = () => {
    setCategory(null);
    refetch();
  }

  const handleOpen = (open: boolean) => {
    setCategory(open ? { id: "", name: "", budget: 0 } : null);
  }

  const handleSetCategory = (category: CategoryFull) => () => {
    setCategory(category)
  }

  return (
    <Box sx={{ px: 3, width: "100%", maxWidth: { sm: "100%", md: "1700px" }, overflowY: "auto" }}>
      <Stack
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          backgroundColor: alpha(theme.palette.background.default, 1),
          pb: 2,
          zIndex: 1,
        })}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            component="h2"
            variant="h6"
          >
            {t("nav.private.categories")}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOnClickCreate}
          >
            {t("common.button.create")}
          </Button>
        </Stack>
        <Stack direction='row' gap='8px' margin='16px' marginBottom={0}>
          <Box>{t('categories.total')}</Box>
          <Box>{total}</Box>
        </Stack>
      </Stack>
      <Stack sx={{ overflohandleSetCategory: "auto", pb: 3 }}>
        {categories?.map(c => <Category key={c.id} category={c} handleSubmit={handleSubmit} handleSetCategory={handleSetCategory(c)} />)}
      </Stack>
      <CategoryFormPopup
        category={category}
        open={category !== null}
        setOpen={handleOpen}
        handleClose={handleSubmit}
      />
    </Box >
  );
};
