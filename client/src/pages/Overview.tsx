import { MainGrid } from "../components/Dashboard/MainGrid";
import { useApiV1CategoryGetCategoriesQuery } from "../services/api/v1";

export const Overview = () => {
  const { data: categories } = useApiV1CategoryGetCategoriesQuery()
  // const { data: expenses } = useGetRecentExpensesApiV1ExpensesRecentGetQuery();

  return (
    <>
      <MainGrid />
    </>
  );
};
