import AddIcon from "@mui/icons-material/Add";
import { Box, Button, List } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toast } from "../components/Toast";
import { TransactionListItem } from "../components/TransactionListItem";
import { MonthNavigator } from "../components/Transactions/MonthNavigator";
import { TransactionFormPopup } from "../components/Transactions/TransactionFormPopup";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";
import { useApiV1ExpenseGetExpensesQuery } from "../services/api/v1";

export const Transactions = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(DateTime.now());
  const { data: transactions } = useApiV1ExpenseGetExpensesQuery({
    fromDate: selectedMonth.startOf("month").toUTC().toISO(),
    toDate: selectedMonth.endOf("month").toUTC().toISO(),
  });

  const handleSubmitCreateTransaction = () => {
    setOpen(false);
  };

  const handleOpen = (open: boolean) => () => {
    setOpen(open);
  };

  return (
    <>
      <PageNavbar
        title={t("nav.private.transactions")}
        secondaryAction={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpen(true)}
            sx={{
              textTransform: "none",
            }}
          >
            {t("common.button.create")}
          </Button>
        }
        secondaryTitle={
          <MonthNavigator
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        }
      />
      <Box sx={{ overflowY: "auto", pb: 3 }}>
        <List>
          {transactions?.map((t) => (
            <TransactionListItem
              key={t.id}
              transaction={t}
            />
          ))}
        </List>
      </Box>
      <TransactionFormPopup
        open={open}
        handleClose={handleOpen(false)}
        handleSubmit={handleSubmitCreateTransaction}
      />
      <Toast />
    </>
  );
};
