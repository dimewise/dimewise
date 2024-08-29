import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Routes } from "../Routes";
import { CategoryWidget } from "../components/CategoryWidget";
import { RecentTransactionsTable } from "../components/RecentTransactionsTable";
import { useGetCategoriesApiV1CategoriesGetQuery, useGetRecentExpensesApiV1ExpensesRecentGetQuery } from "../services/api/v1";

export const Overview = () => {
  const { t } = useTranslation();
  const { data: categories } = useGetCategoriesApiV1CategoriesGetQuery();
  const { data: expenses } = useGetRecentExpensesApiV1ExpensesRecentGetQuery();

  return (
    <>
      <h1 className="sticky top-0 bg-white z-10 py-2">{t("nav.private.overview")}</h1>
      <div className="overflow-y-auto flex-1 flex flex-col gap-5">
        <h2 className="mt-0">{t("overview.categories")}</h2>
        <div className="flex flex-wrap items-center lg:grid lg:grid-cols-4 gap-8">
          {categories?.map((c) => (
            <CategoryWidget
              key={c.uuid}
              category={c}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-10">
          <h2 className="mt-0">{t("overview.recent_transactions")}</h2>
          <Link
            type="button"
            className="btn btn-sm btn-outline btn-secondary"
            to={Routes.History}
          >
            {t("overview.view_more")}
          </Link>
        </div>
        <RecentTransactionsTable recentTransactions={expenses ?? []} />
      </div>
    </>
  );
};
