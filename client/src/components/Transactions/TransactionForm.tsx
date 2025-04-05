import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormControl, FormHelperText, FormLabel, MenuItem, Select, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { type TransactionFormData, TransactionSchema } from "../../lib/schemas/TransactionSchema";
import {
  type Expense,
  type ExpenseCreate,
  useApiV1CategoriesGetCategoriesQuery,
  useApiV1ExpensesCreateExpenseMutation,
  useApiV1ExpensesExpenseIdUpdateExpenseMutation,
} from "../../services/api/v1";
import { showToast } from "../../store/toastSlice";

interface Props {
  transaction?: Expense;
  handleSubmit: () => void;
  handleClose: () => void;
}

export const TransactionForm = ({ transaction, handleSubmit, handleClose }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [createTransaction] = useApiV1ExpensesCreateExpenseMutation();
  const [editTransaction] = useApiV1ExpensesExpenseIdUpdateExpenseMutation();
  const now = DateTime.now();
  const { data: categories } = useApiV1CategoriesGetCategoriesQuery({
    fromDate: now.startOf("month").toUTC().toISO(),
    toDate: now.endOf("month").toUTC().toISO(),
  });

  const {
    control,
    register,
    handleSubmit: formSubmit,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      title: transaction ? transaction.title : "",
      description: transaction?.description ? transaction.description : "",
      date: transaction ? DateTime.fromISO(transaction.date).toJSDate() : DateTime.now().startOf("day").toJSDate(),
      amount: transaction ? transaction.amount : 0,
      category_id: transaction ? transaction.category.id : "",
    },
    resolver: zodResolver(TransactionSchema),
  });

  const onSubmit = (data: TransactionFormData) => {
    const transformedData: ExpenseCreate = {
      ...data,
      date: DateTime.fromJSDate(data.date).toISO() ?? "",
    };
    if (transaction) {
      editTransaction({ expenseId: transaction.id, expenseCreate: transformedData })
        .unwrap()
        .then(() => {
          handleSubmit();
          dispatch(showToast({ message: t("transactions.toast.edit-success"), type: "success" }));
        })
        .catch((err) => {
          console.error(err);
          dispatch(showToast({ message: t("common.toast.error"), type: "error" }));
        });
    } else {
      createTransaction({ expenseCreate: transformedData })
        .unwrap()
        .then(() => {
          handleSubmit();
          dispatch(showToast({ message: t("transactions.toast.create-success"), type: "success" }));
        })
        .catch((err) => {
          console.error(err);
          dispatch(showToast({ message: t("common.toast.error"), type: "error" }));
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
                  value={field.value ? DateTime.fromJSDate(field.value) : null}
                  inputRef={field.ref}
                  onChange={(date) => {
                    field.onChange(date);
                  }}
                  slotProps={{
                    textField: {
                      error: !!errors.date,
                      helperText: errors.date?.message,
                    },
                  }}
                />
              );
            }}
          />
        </FormControl>
        <FormControl error={!!errors.category_id}>
          <FormLabel htmlFor="category_id">{t("transactions.form.field_category.label")}</FormLabel>
          <Controller
            control={control}
            name="category_id"
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <>
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
                  {errors.category_id?.message && <FormHelperText>{errors.category_id.message}</FormHelperText>}
                </>
              );
            }}
          />
        </FormControl>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { sm: "space-between", md: "end" },
            gap: 1,
          }}
        >
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{
              textTransform: "none",
              width: {
                xs: "100%",
                md: "fit-content",
              },
            }}
            onClick={handleClose}
          >
            {t("common.button.cancel")}
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              textTransform: "none",
              width: {
                xs: "100%",
                md: "fit-content",
              },
            }}
          >
            {transaction ? t("common.button.save") : t("common.button.create")}
          </Button>
        </Box>
      </Box>
    </>
  );
};
