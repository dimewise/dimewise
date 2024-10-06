import Add from "@mui/icons-material/Add";
import { Button, Card, CardContent, Grid2 as Grid, LinearProgress, Stack, Typography, alpha } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CreateUpdateCategory } from "../../pages/Categories";
import { useApiV1CategoryGetCategoriesQuery } from "../../services/api/v1";
import { CategoryFormPopup } from "../Categories/CategoryFormPopup";

type DataType = {
	id: string;
	name: string;
	budget: number;
	used: number;
};
const fakeCategoryData: DataType[] = [
	{ id: "1", name: "Entertainment", budget: 5000, used: 3500 },
	{ id: "2", name: "Food", budget: 10000, used: 8200 },
	{ id: "3", name: "Housing", budget: 500000, used: 45000 },
	{ id: "4", name: "Transportation", budget: 3000, used: 1200 },
	{ id: "5", name: "Utilities", budget: 10000, used: 7600 },
	{ id: "6", name: "Check", budget: 10000, used: 7600 },
];

export const CategoriesWidget = () => {
	const { t } = useTranslation();
	// TODO: get categories data from api
	const data = fakeCategoryData;

	const [category, setCategory] = useState<CreateUpdateCategory | null>(null);
	const { refetch: refetchGetCategories } = useApiV1CategoryGetCategoriesQuery();

	const handleOpenCreateCategory = (open: boolean) => {
		setCategory(open ? { id: "", name: "", budget: 0 } : null);
	};

	const handleSubmitCreateCategory = () => {
		setCategory(null);
		refetchGetCategories();
	};

	return (
		<>
			<Grid size={12}>
				<Card
					variant="outlined"
					sx={{ height: "100%", flexGrow: 1 }}
				>
					<CardContent>
						<Typography
							component="h2"
							variant="subtitle2"
							gutterBottom
						>
							{t("overview.widget.category.title")}
						</Typography>
						<Grid
							container
							spacing={2}
							columns={12}
						>
							{data.map((c) => (
								<CategoryWidgetItem
									category={c}
									key={c.id}
								/>
							))}
							<CreateCategoryPlaceholder onClick={handleOpenCreateCategory} />
						</Grid>
					</CardContent>
				</Card>
			</Grid>
			<CategoryFormPopup
				category={category}
				open={category !== null}
				setOpen={handleOpenCreateCategory}
				handleClose={handleSubmitCreateCategory}
			/>
		</>
	);
};

const CategoryWidgetItem = ({ category }: { category: DataType }) => {
	const currency = "JPY";
	const progress = (category.used / category.budget) * 100;
	const severity = progress > 65 ? "error" : progress > 30 ? "warning" : "primary";

	const spentStr = `${currency} ${category.used}`;
	const budgetStr = `/ ${currency} ${category.budget} (${progress.toFixed(1)}%)`;

	return (
		<Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
			<Card>
				<CardContent>
					<Typography
						variant="caption"
						component="p"
					>
						{category.name}
					</Typography>
					<Stack
						direction="column"
						sx={{ alignItems: "start", flexWrap: "wrap", mb: 2 }}
					>
						<Typography
							noWrap
							variant="h6"
							component="p"
						>
							{spentStr}
						</Typography>
						<Typography
							noWrap
							variant="caption"
							component="p"
						>
							{budgetStr}
						</Typography>
					</Stack>
					<LinearProgress
						variant="determinate"
						color={severity}
						value={progress}
						sx={(theme) => ({
							backgroundColor: theme.palette.grey[700],
						})}
					/>
				</CardContent>
			</Card>
		</Grid>
	);
};

const CreateCategoryPlaceholder = ({ onClick }: { onClick: (open: boolean) => void }) => {
	const { t } = useTranslation();
	const handleOnClick = () => {
		onClick(true);
	};

	return (
		<Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
			<Button
				sx={(theme) => ({
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					border: 1,
					borderColor: alpha(theme.palette.grey[700], 0.6),
					borderStyle: "dashed",
					backgroundColor: alpha(theme.palette.grey[700], 0.1),
					color: alpha(theme.palette.grey[400], 0.4),
					"&:hover": {
						backgroundColor: alpha(theme.palette.grey[700], 0.2),
						color: theme.palette.grey[400],
					},
				})}
				onClick={handleOnClick}
			>
				<Add fontSize="small" />
				<Typography
					gutterBottom
					variant="subtitle2"
					component="div"
					align="center"
					sx={{
						m: 0,
					}}
				>
					{t("overview.widget.category.add-category")}
				</Typography>
			</Button>
		</Grid>
	);
};
