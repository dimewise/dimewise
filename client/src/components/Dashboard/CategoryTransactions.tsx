import { useEffect, useState } from "react";
import { useApiV1ExpenseGetExpensesQuery, type CategoryFull } from "../../services/api/v1"
import { List } from "@mui/material";
import { TransactionListItem } from "../TransactionListItem";
import { skipToken } from "@reduxjs/toolkit/query";

interface Props {
  category: CategoryFull | null;
  handleClose: () => void;
}

export const CategoryTransactions = ({ category }: Props) => {
  const [currentCategory, setCurrentCategory] = useState<CategoryFull>()
  const { data: transactions } = useApiV1ExpenseGetExpensesQuery(currentCategory ? { categoryIds: [currentCategory.id] } : skipToken)

  useEffect(() => {
    if (category === null) return;
    setCurrentCategory(category)
  }, [category])

  return (
    <div>
      <List>
        {transactions?.map((t) => (
          <TransactionListItem
            key={t.id}
            transaction={t}
            disallowOpen
          />
        ))}
      </List>
    </div>
  )
}
