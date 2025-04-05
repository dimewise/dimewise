import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { formatCurrencyValueToLocale, parseCurrencyEnum } from "../lib/util/currency";
import { type Expense, useApiV1UsersMeDetailGetMeDetailQuery } from "../services/api/v1";
import { TransactionDetails } from "./Transactions/TransactionDetails";

interface Props {
  transaction: Expense;
  disallowOpen?: boolean;
}

export const TransactionListItem = ({ transaction, disallowOpen = false }: Props) => {
  const [open, setOpen] = useState(false);
  const locale = navigator.language;
  const date = DateTime.fromISO(transaction.date).toFormat("MMM d, yyyy");
  const { data: meDetail, isLoading: meDetailIsLoading } = useApiV1UsersMeDetailGetMeDetailQuery();

  if (!meDetail || meDetailIsLoading) {
    return <></>;
  }

  const currency = parseCurrencyEnum(meDetail.default_currency, locale);
  const formattedAmount = `- ${formatCurrencyValueToLocale(transaction.amount, currency, locale)}`;

  const handleOpen = (open: boolean) => () => {
    if (disallowOpen) return;
    setOpen(open);
  };

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={handleOpen(true)}>
          <ListItemText
            primary={transaction.title}
            secondary={date}
          />
          <Typography>{formattedAmount}</Typography>
        </ListItemButton>
      </ListItem>
      <TransactionDetails
        open={open}
        handleClose={handleOpen(false)}
        transaction={transaction}
      />
    </>
  );
};
