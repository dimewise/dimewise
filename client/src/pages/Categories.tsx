import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "../components/Categories/Category";
import { CategoryFormPopup } from "../components/Categories/CategoryFormPopup";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";
import { type CategoryCreate, type CategoryFull, useApiV1CategoryGetCategoriesQuery } from "../services/api/v1";

export type CreateUpdateCategory = CategoryCreate & { id: string };

export const Categories = () => {
	const { t } = useTranslation();
	const { data: categories, refetch } = useApiV1CategoryGetCategoriesQuery();
	const total = categories?.reduce((acc, { budget }) => acc + budget, 0);
	const [category, setCategory] = useState<CreateUpdateCategory | null>(null);

	const handleOnClickCreate = () => {
		setCategory({ id: "", name: "", budget: 0 });
	};

	const handleSubmit = () => {
		setCategory(null);
		refetch();
	};

	const handleOpen = (open: boolean) => {
		setCategory(open ? { id: "", name: "", budget: 0 } : null);
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
					<Stack
						direction="row"
						gap="8px"
						margin="16px"
						marginBottom={0}
					>
						<Box>{t("categories.total")}</Box>
						<Box>{total}</Box>
					</Stack>
				}
			/>
			<Stack sx={{ overflohandleSetCategory: "auto", pb: 3 }}>
				{categories?.map((c) => (
					<Category
						key={c.id}
						category={c}
						handleSubmit={handleSubmit}
						handleSetCategory={handleSetCategory(c)}
					/>
				))}
			</Stack>
			<CategoryFormPopup
				category={category}
				open={category !== null}
				setOpen={handleOpen}
				handleClose={handleSubmit}
			/>
		</>
	);
};
