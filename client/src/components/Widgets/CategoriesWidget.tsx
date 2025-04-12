import Add from "@mui/icons-material/Add";
import { Button, Card, CardContent, Grid2 as Grid, LinearProgress, Stack, Typography, alpha } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrencyValueToLocale, parseCurrencyEnum } from "../../lib/util/currency";
import type { CreateUpdateCategory } from "../../pages/Categories";
import {
  type CategoryFull,
  useApiV1CategoriesGetCategoriesQuery,
  useApiV1UsersMeDetailGetMeDetailQuery,
} from "../../services/api/v1";
import type { Currencies } from "../../types/currency";
import { CategoryFormPopup } from "../Categories/CategoryFormPopup";
import { CategoryTransactionsPopup } from "../Dashboard/CategoryTransactionsPopup";

export const CategoriesWidget = () => {
  const { t } = useTranslation();
  const locale = navigator.language;
  const now = DateTime.now();

  const [createCategory, setCreateCategory] = useState<CreateUpdateCategory | null>(null);
  const [viewCategory, setViewCategory] = useState<CategoryFull | null>(null);

  const {
    data: categories,
    isLoading: categoriesIsLoading,
    refetch: refetchGetCategories,
  } = useApiV1CategoriesGetCategoriesQuery({
    fromDate: now.startOf("month").toUTC().toISO(),
    toDate: now.endOf("month").toUTC().toISO(),
  });
  const { data: meDetail, isLoading: meDetailIsLoading } = useApiV1UsersMeDetailGetMeDetailQuery();

  if (!categories || categoriesIsLoading || !meDetail || meDetailIsLoading) {
    return <></>;
  }

  const currency = parseCurrencyEnum(meDetail.default_currency, locale);
  const handleOpenCreateCategory = (open: boolean) => () => {
    setCreateCategory(open ? { id: "", name: "", budget: 0 } : null);
  };

  const handleSubmitCreateCategory = () => {
    setCreateCategory(null);
    refetchGetCategories();
  };

  const handleCloseViewCategory = () => {
    setViewCategory(null);
  };

  const handleSetViewCategory = (category: CategoryFull) => () => {
    setViewCategory(category);
  };

  return (
    <>
      <Grid size={12}>
        <Card
          variant="outlined"
          sx={{ height: "100%", flexGrow: 1 }}
        >
          <CardContent>
            <Typography
              component="h2"
              variant="subtitle2"
              gutterBottom
            >
              {t("overview.widget.category.title")}
            </Typography>
            <Grid
              container
              spacing={2}
              columns={12}
            >
              {categories?.map((c) => (
                <CategoryWidgetItem
                  key={c.id}
                  category={c}
                  currency={currency}
                  locale={locale}
                  handleClick={handleSetViewCategory(c)}
                />
              ))}
              <CreateCategoryPlaceholder handleClick={handleOpenCreateCategory(true)} />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <CategoryFormPopup
        category={createCategory}
        open={createCategory !== null}
        handleClose={handleOpenCreateCategory(false)}
        handleSubmit={handleSubmitCreateCategory}
      />
      <CategoryTransactionsPopup
        category={viewCategory}
        open={viewCategory !== null}
        handleClose={handleCloseViewCategory}
      />
    </>
  );
};

const CategoryWidgetItem = ({
  category,
  currency,
  locale,
  handleClick,
}: { category: CategoryFull; currency: Currencies; locale: string; handleClick: () => void }) => {
  const progress = (category.spent / category.budget) * 100;
  const severity = progress > 65 ? "error" : progress > 30 ? "warning" : "primary";
  const remainder = category.budget - category.spent;

  const spentStr = formatCurrencyValueToLocale(category.spent, currency, locale);
  const budgetStr = `/ ${formatCurrencyValueToLocale(category.budget, currency, locale)} (${formatCurrencyValueToLocale(remainder, currency, locale)} left)`;

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
      <Card>
        <CardContent
          sx={(theme) => ({
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: alpha(theme.palette.grey[700], 0.2),
              cursor: "pointer",
            },
          })}
          onClick={handleClick}
        >
          <Typography
            variant="caption"
            component="p"
          >
            {category.name}
          </Typography>
          <Stack
            direction="column"
            sx={{ alignItems: "start", flexWrap: "wrap", mb: 2 }}
          >
            <Typography
              noWrap
              variant="h6"
              component="p"
            >
              {spentStr}
            </Typography>
            <Typography
              noWrap
              variant="caption"
              component="p"
            >
              {budgetStr}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            color={severity}
            value={progress}
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[700],
            })}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};

const CreateCategoryPlaceholder = ({ handleClick }: { handleClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
      <Button
        sx={(theme) => ({
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: 1,
          borderColor: alpha(theme.palette.grey[700], 0.6),
          borderStyle: "dashed",
          backgroundColor: alpha(theme.palette.grey[700], 0.1),
          color: alpha(theme.palette.grey[400], 0.4),
          "&:hover": {
            backgroundColor: alpha(theme.palette.grey[700], 0.2),
            color: theme.palette.grey[400],
          },
        })}
        onClick={handleClick}
      >
        <Add fontSize="small" />
        <Typography
          gutterBottom
          variant="subtitle2"
          component="div"
          align="center"
          sx={{
            m: 0,
          }}
        >
          {t("overview.widget.category.add-category")}
        </Typography>
      </Button>
    </Grid>
  );
};
