import { useTranslation } from "react-i18next";
import type { Transactions } from "../hooks/useFaker";

interface Props {
	recentTransactions: Transactions[];
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
				{recentTransactions.map((x) => (
					<tr key={x.id}>
						<td>{x.title} we also add categories chip here</td>
						<td className="text-nowrap w-fit truncate">{`${currency} ${x.price}`}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
