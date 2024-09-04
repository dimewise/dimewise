import { MainGrid } from "../components/Dashboard/MainGrid";
import {
	useGetCategoriesApiV1CategoriesGetQuery,
	useGetRecentExpensesApiV1ExpensesRecentGetQuery,
} from "../services/api/v1";

export const Overview = () => {
	const { data: categories } = useGetCategoriesApiV1CategoriesGetQuery();
	const { data: expenses } = useGetRecentExpensesApiV1ExpensesRecentGetQuery();

	return (
		<>
			<MainGrid />
		</>
	);
};
