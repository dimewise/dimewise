import { useTranslation } from "react-i18next";
import type { Expense } from "../services/api/v1";

interface Props {
  recentTransactions: Expense[];
}

export const RecentTransactionsTable = ({ recentTransactions }: Props) => {
  const { t } = useTranslation();
  const currency = "JPY";
  return (
    <table className="table mt-0">
      <thead>
        <tr>
          <th className="w-full">{t("overview.transactions.table.title")}</th>
          <th className="w-fit">{t("overview.transactions.table.price")}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {recentTransactions?.map((x) => (
          <tr key={x.uuid}>
            <td>{x.title} we also add categories chip here</td>
            <td className="text-nowrap w-fit truncate">{`${currency} ${x.amount}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
