import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CategorySchema, type CategorySchemaType } from "../../lib/schemas/CategorySchema";

export const CategoryForm = () => {
	const { t } = useTranslation();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CategorySchemaType>({
		resolver: yupResolver(CategorySchema),
	});

	const onSubmit = (data: CategorySchemaType) => {
		// submit the form based on the backend endpoint
		console.log("submitted", data);
	};

	return (
		<>
			<Box
				component="form"
				onSubmit={handleSubmit(onSubmit)}
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
					{t("common.button.create")}
				</Button>
			</Box>
		</>
	);
};
