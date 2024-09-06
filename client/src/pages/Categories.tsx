import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography, alpha } from "@mui/material";
import { useState } from "react";
import { useGetCategoriesApiV1CategoriesGetQuery } from "../services/api/v1";
import { Category } from "../components/Categories/Category";
import { useTranslation } from "react-i18next";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";

export const Categories = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: categories, refetch } = useGetCategoriesApiV1CategoriesGetQuery()
  const total = categories?.reduce((acc, { budget }) => acc + budget, 0)

  const handleOnClickCreate = () => {
    setOpen(true);
  };

  const handleSubmit = () => {
    setOpen(false);
    refetch();
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
      <Stack sx={{ overflowY: "auto", pb: 3 }}>
        {categories?.map(c => <Category key={c.id} category={c} handleSubmit={handleSubmit} />)}
      </Stack>
      <CategoryFormPopup
        open={open}
        setOpen={setOpen}
        handleClose={handleSubmit}
      />
    </Box >
  );
};
