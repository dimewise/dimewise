import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { type CategoryFormData, CategorySchema } from "../../lib/schemas/CategorySchema";
import type { CreateUpdateCategory } from "../../pages/Categories";
import {
  useApiV1CategoriesCategoryIdUpdateCategoryMutation,
  useApiV1CategoriesCreateCategoryMutation,
} from "../../services/api/v1";
import { showToast } from "../../store/toastSlice";

interface Props {
  category: CreateUpdateCategory | null;
  handleSubmit: () => void;
}

export const CategoryForm = ({ category, handleSubmit }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [createCategory] = useApiV1CategoriesCreateCategoryMutation();
  const [updateCategory] = useApiV1CategoriesCategoryIdUpdateCategoryMutation();

  const {
    register,
    handleSubmit: formSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      ...category,
    },
    resolver: zodResolver(CategorySchema),
  });

  const onSubmit = (data: CategoryFormData) => {
    if (category?.id) {
      updateCategory({ categoryId: category.id, categoryCreate: data })
        .unwrap()
        .then(() => {
          handleSubmit();
          dispatch(showToast({ message: t("categories.toast.edit-success"), type: "success" }));
        })
        .catch((err) => {
          console.error(err);
          dispatch(showToast({ message: t("common.toast.error"), type: "error" }));
        });
    } else {
      createCategory({ categoryCreate: data })
        .unwrap()
        .then(() => {
          handleSubmit();
          dispatch(showToast({ message: t("categories.toast.edit-success"), type: "success" }));
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
