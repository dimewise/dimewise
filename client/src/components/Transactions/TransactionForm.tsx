import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormLabel, MenuItem, Select, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TransactionSchema, type TransactionSchemaType } from "../../lib/schemas/TransactionSchema";
import { useApiV1CategoryGetCategoriesQuery, useApiV1ExpenseCreateExpenseMutation } from "../../services/api/v1";

interface Props {
	handleSubmit: () => void;
}

export const TransactionForm = ({ handleSubmit }: Props) => {
	const { t } = useTranslation();
	const [createTransaction] = useApiV1ExpenseCreateExpenseMutation();
	const { data: categories } = useApiV1CategoryGetCategoriesQuery();

	const {
		control,
		register,
		handleSubmit: formSubmit,
		formState: { errors },
	} = useForm<TransactionSchemaType>({
		defaultValues: {
			date: DateTime.now().startOf("day"),
			amount: 0,
			category_id: "",
		},
		resolver: yupResolver(TransactionSchema),
	});

	// TODO: add edit
	const onSubmit = (data: TransactionSchemaType) => {
		createTransaction({ expenseCreate: data }).then(() => {
			handleSubmit();
		});
	};

	return (
		<>
			<Box
				component="form"
				onSubmit={formSubmit(onSubmit)}
				sx={{ display: "flex", flexDirection: "column", gap: 2 }}
			>
				<FormControl>
					<FormLabel htmlFor="title">{t("transactions.form.field_title.label")}</FormLabel>
					<TextField
						required
						fullWidth
						id="title"
						placeholder="Groceries"
						variant="outlined"
						error={!!errors.title}
						helperText={errors.title?.message}
						color={errors.title ? "error" : "primary"}
						{...register("title")}
					/>
				</FormControl>
				<FormControl>
					<FormLabel htmlFor="description">{t("transactions.form.field_description.label")}</FormLabel>
					<TextField
						fullWidth
						placeholder="Add more description to what this expenses is about"
						id="description"
						variant="outlined"
						error={!!errors.description}
						helperText={errors.description?.message}
						color={errors.description ? "error" : "primary"}
						{...register("description")}
					/>
				</FormControl>
				<FormControl>
					<FormLabel htmlFor="amount">{t("transactions.form.field_amount.label")}</FormLabel>
					<TextField
						required
						fullWidth
						id="amount"
						variant="outlined"
						error={!!errors.amount}
						helperText={errors.amount?.message}
						color={errors.amount ? "error" : "primary"}
						{...register("amount")}
					/>
				</FormControl>
				<FormControl>
					<FormLabel htmlFor="date">{t("transactions.form.field_date.label")}</FormLabel>
					<Controller
						control={control}
						name="date"
						rules={{ required: true }}
						render={({ field }) => {
							return (
								<DatePicker
									value={field.value}
									inputRef={field.ref}
									onChange={(date) => {
										field.onChange(date);
									}}
								/>
							);
						}}
					/>
				</FormControl>
				<FormControl>
					<FormLabel htmlFor="category_id">{t("transactions.form.field_category.label")}</FormLabel>
					<Controller
						control={control}
						name="category_id"
						rules={{ required: true }}
						render={({ field }) => {
							return (
								<Select
									notched
									{...field}
									variant="outlined"
									inputProps={{ id: "category_id" }}
								>
									{categories?.map((category) => (
										<MenuItem
											value={category.id}
											key={category.id}
										>
											{category.name}{" "}
										</MenuItem>
									))}
								</Select>
							);
						}}
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
