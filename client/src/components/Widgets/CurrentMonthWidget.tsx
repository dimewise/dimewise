import { Card, CardContent, Grid2 as Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
import { formatCurrencyValueToLocale, parseCurrencyEnum } from "../../lib/util/currency";
import { useApiV1CategoryGetCategoriesQuery, useApiV1UserMeDetailGetMeDetailQuery } from "../../services/api/v1";

export const CurrentMonthWidget = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const locale = navigator.language;

  const now = DateTime.now();
  const { data: categories, isLoading: categoriesIsLoading } = useApiV1CategoryGetCategoriesQuery({
    fromDate: now.startOf("month").toUTC().toISO(),
    toDate: now.endOf("month").toUTC().toISO(),
  });
  const { data: meDetail, isLoading: meDetailIsLoading } = useApiV1UserMeDetailGetMeDetailQuery();

  if (!categories || categoriesIsLoading || !meDetail || meDetailIsLoading) {
    return <></>;
  }

  const currency = parseCurrencyEnum(meDetail.default_currency, locale);
  const totalSpent = categories?.reduce((sum, category) => sum + category.spent, 0) ?? 0;
  const totalBudget = categories?.reduce((sum, category) => sum + category.budget, 0) ?? 0;

  // construct bar series information
  const remainder = totalBudget - totalSpent;
  const categoryBarSeries = categories?.map((c) => ({ label: c.name, data: [c.spent], stack: "total" })) ?? [];
  const remainderBarSeries = {
    label: "Remainder",
    data: [remainder],
    stack: "total",
    color: "grey",
  };
  const barSeries = remainderBarSeries.data[0] < 0 ? categoryBarSeries : [...categoryBarSeries, remainderBarSeries];

  // construct pie series information
  const categoryPieSeries =
    categories?.map((c) => ({
      value: c.spent,
      label: c.name,
    })) ?? [];
  const remainderPieSeries = {
    label: "Remainder",
    value: remainder,
  };
  const pieSeries = remainder < 0 ? categoryPieSeries : [...categoryPieSeries, remainderPieSeries];

  // construct spent and budget value with currency
  const spentStr = formatCurrencyValueToLocale(totalSpent, currency, locale);
  const budgetStr = formatCurrencyValueToLocale(totalBudget, currency, locale);

  return (
    <Grid size={{ xs: 12, sm: 12, lg: 3 }}>
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
            {t("overview.widget.summary.title")}
          </Typography>
          <Stack
            direction="row"
            sx={{ alignItems: "end", mb: 2 }}
            gap={1}
          >
            <Typography
              component="span"
              variant="h4"
            >
              {spentStr}
            </Typography>
            <Typography
              component="span"
              variant="caption"
            >
              /&nbsp;{budgetStr}
            </Typography>
          </Stack>
          <BarChart
            sx={{ display: { sm: "block", lg: "none" } }}
            height={isMobile ? 80 : 0}
            yAxis={[{ data: ["Budget Breakdown"], scaleType: "band" }]}
            leftAxis={null}
            bottomAxis={null}
            slotProps={{ legend: { hidden: true } }}
            margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
            layout="horizontal"
            series={barSeries.map((series) => ({
              ...series,
              valueFormatter: (v) => (v === null ? "" : formatCurrencyValueToLocale(v, currency, locale)),
            }))}
          />
          <PieChart
            sx={{ display: { sm: "none", lg: "block" } }}
            height={isMobile ? 0 : 250}
            margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
            series={[
              {
                data: pieSeries,
                innerRadius: 40,
                cornerRadius: 5,
                paddingAngle: 3,
                valueFormatter: (v) => formatCurrencyValueToLocale(v.value, currency, locale),
              },
            ]}
            slotProps={{ legend: { hidden: true } }}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};
