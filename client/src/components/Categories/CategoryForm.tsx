import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CategorySchema, type CategorySchemaType } from "../../lib/schemas/CategorySchema";
import type { CreateUpdateCategory } from "../../pages/Categories";
import {
	useApiV1CategoryCategoryIdUpdateCategoryMutation,
	useApiV1CategoryCreateCategoryMutation,
} from "../../services/api/v1";

interface Props {
	category: CreateUpdateCategory | null;
	handleSubmit: () => void;
}

export const CategoryForm = ({ category, handleSubmit }: Props) => {
	const { t } = useTranslation();
	const [createCategory] = useApiV1CategoryCreateCategoryMutation();
	const [updateCategory] = useApiV1CategoryCategoryIdUpdateCategoryMutation();

	const {
		register,
		handleSubmit: formSubmit,
		formState: { errors },
	} = useForm<CategorySchemaType>({
		defaultValues: {
			...category,
		},
		resolver: yupResolver(CategorySchema),
	});

	const onSubmit = (data: CategorySchemaType) => {
		if (category?.id) {
			updateCategory({ categoryId: category.id, categoryCreate: data }).then(() => {
				handleSubmit();
			});
		} else {
			createCategory({ categoryCreate: data }).then(() => {
				handleSubmit();
			});
		}
	};

	return (
		<>
			<Box
				component="form"
				onSubmit={formSubmit(onSubmit)}
				sx={{ display: "flex", flexDirection: "column", gap: 2 }}
			>
				<FormControl>
					<FormLabel htmlFor="title">{t("categories.form.field_name.label")}</FormLabel>
					<TextField
						required
						fullWidth
						id="title"
						placeholder="Groceries"
						variant="outlined"
						error={!!errors.name}
						helperText={errors.name?.message}
						color={errors.name ? "error" : "primary"}
						{...register("name")}
					/>
				</FormControl>
				<FormControl>
					<FormLabel htmlFor="budget">{t("categories.form.field_budget.label")}</FormLabel>
					<TextField
						required
						fullWidth
						id="budget"
						variant="outlined"
						error={!!errors.budget}
						helperText={errors.budget?.message}
						color={errors.budget ? "error" : "primary"}
						{...register("budget")}
					/>
				</FormControl>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3 }}
				>
					{t("common.button.confirm")}
				</Button>
			</Box>
		</>
	);
};
