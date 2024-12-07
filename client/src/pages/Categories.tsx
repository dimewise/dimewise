import AddIcon from "@mui/icons-material/Add";
import { Button, Divider, List, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";
import { CategoryListItem } from "../components/Categories/CategoryListItem";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";
import { type CategoryCreate, type CategoryFull, useApiV1CategoryGetCategoriesQuery } from "../services/api/v1";

export type CreateUpdateCategory = CategoryCreate & { id: string };

export const Categories = () => {
	const { t } = useTranslation();
	const { data: categories, refetch } = useApiV1CategoryGetCategoriesQuery();
	const total = categories?.reduce((acc, { budget }) => acc + budget, 0);
	const [category, setCategory] = useState<CreateUpdateCategory | null>(null);

	const currency = "JPY";

	const handleOnClickCreate = () => {
		setCategory({ id: "", name: "", budget: 0 });
	};

	const handleSubmit = () => {
		setCategory(null);
		refetch(); // TODO: This not working?
	};

	const handleClose = () => {
		setCategory(null);
	};

	const handleSetCategory = (category: CategoryFull) => () => {
		setCategory(category);
	};

	return (
		<>
			<PageNavbar
				title={t("nav.private.categories")}
				secondaryAction={
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={handleOnClickCreate}
					>
						{t("common.button.create")}
					</Button>
				}
				secondaryTitle={
					<>
						<Divider />
						<Stack
							direction="row"
							sx={{ alignItems: "center", justifyContent: "space-between" }}
						>
							<Typography variant="h6">{t("categories.total-budget")} </Typography>
							<Typography variant="h6">{`${currency} ${total}`}</Typography>
						</Stack>
						<Divider />
					</>
				}
			/>
			<List>
				{categories?.map((c) => (
					<CategoryListItem
						key={c.id}
						category={c}
						handleSubmit={handleSubmit}
						handleSetCategory={handleSetCategory(c)}
					/>
				))}
			</List>
			<CategoryFormPopup
				category={category}
				open={category !== null}
				handleClose={handleClose}
				handleSubmit={handleSubmit}
			/>
		</>
	);
};
