import { Button, Card, CardContent, Grid2 as Grid, List, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Routes } from "../../Routes";
import { useApiV1ExpenseGetExpensesQuery } from "../../services/api/v1";
import { TransactionListItem } from "../TransactionListItem";

export const RecentTransactionsWidget = () => {
  const { t } = useTranslation();
  // TODO: limit number of transactions?
  const { data: transactions } = useApiV1ExpenseGetExpensesQuery({});

  return (
    <Grid size={12}>
      <Card
        variant="outlined"
        sx={{ height: "100%", flexGrow: 1 }}
      >
        <CardContent>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography
              component="h2"
              variant="subtitle2"
              gutterBottom
            >
              {t("overview.widget.recent-transactions.title")}
            </Typography>
            <Button
              component={Link}
              variant="contained"
              size="small"
              to={Routes.Transactions}
            >
              {t("overview.widget.recent-transactions.view-more")}
            </Button>
          </Stack>
        </CardContent>
        <List>
          {transactions?.map((t) => (
            <TransactionListItem
              key={t.id}
              transaction={t}
            />
          ))}
        </List>
      </Card>
    </Grid>
  );
};
