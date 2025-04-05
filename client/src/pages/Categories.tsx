import AddIcon from "@mui/icons-material/Add";
import { Button, Divider, List, Stack, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";
import { CategoryListItem } from "../components/Categories/CategoryListItem";
import { Toast } from "../components/Toast";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";
import { formatCurrencyValueToLocale, parseCurrencyEnum } from "../lib/util/currency";
import {
  type CategoryCreate,
  type CategoryFull,
  useApiV1CategoriesGetCategoriesQuery,
  useApiV1UsersMeDetailGetMeDetailQuery,
} from "../services/api/v1";

export type CreateUpdateCategory = CategoryCreate & { id: string };

export const Categories = () => {
  const { t } = useTranslation();
  const now = DateTime.now();
  const locale = navigator.language;
  const [category, setCategory] = useState<CreateUpdateCategory | null>(null);

  const {
    data: categories,
    isLoading: categoriesIsLoading,
    refetch,
  } = useApiV1CategoriesGetCategoriesQuery({
    fromDate: now.startOf("month").toUTC().toISO(),
    toDate: now.endOf("month").toUTC().toISO(),
  });
  const { data: meDetail, isLoading: meDetailIsLoading } = useApiV1UsersMeDetailGetMeDetailQuery();

  if (!categories || categoriesIsLoading || !meDetail || meDetailIsLoading) {
    return <></>;
  }

  const total = categories?.reduce((acc, { budget }) => acc + budget, 0);
  const currency = parseCurrencyEnum(meDetail.default_currency, locale);
  const formattedTotal = formatCurrencyValueToLocale(total, currency, locale);

  const handleOnClickCreate = () => {
    setCategory({ id: "", name: "", budget: 0 });
  };

  const handleSubmit = () => {
    setCategory(null);
    refetch(); // TODO: This not working?
  };

  const handleClose = () => {
    setCategory(null);
  };

  const handleSetCategory = (category: CategoryFull) => () => {
    setCategory(category);
  };

  return (
    <>
      <PageNavbar
        title={t("nav.private.categories")}
        secondaryAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOnClickCreate}
            sx={{
              textTransform: "none",
            }}
          >
            {t("common.button.create")}
          </Button>
        }
        secondaryTitle={
          <>
            <Divider />
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="h6">{t("categories.total-budget")} </Typography>
              <Typography variant="h6">{formattedTotal}</Typography>
            </Stack>
            <Divider />
          </>
        }
      />
      <List>
        {categories?.map((c) => (
          <CategoryListItem
            key={c.id}
            category={c}
            handleSubmit={handleSubmit}
            handleSetCategory={handleSetCategory(c)}
          />
        ))}
      </List>
      <CategoryFormPopup
        category={category}
        open={category !== null}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
      />
      <Toast />
    </>
  );
};
