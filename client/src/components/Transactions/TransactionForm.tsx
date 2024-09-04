import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TransactionFormSchema, type TransactionFormSchemaType } from "../../lib/schemas/TransactionSchema";

export const TransactionForm = () => {
	const { t } = useTranslation();
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TransactionFormSchemaType>({
		resolver: yupResolver(TransactionFormSchema),
	});

	const onSubmit = (data: TransactionFormSchemaType) => {
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
					<FormLabel htmlFor="amount">{t("transactions.form.field_date.label")}</FormLabel>
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
				<Button
					type="submit"
					fullWidth
					variant="contained"
				>
					{t("common.button.create")}
				</Button>
			</Box>
		</>
	);
};
