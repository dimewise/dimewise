import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormLabel, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CategorySchema, type CategorySchemaType } from "../../lib/schemas/CategorySchema";
import { useCreateCategoryApiV1CategoryPostMutation, useUpdateCategoryApiV1CategoryCategoryIdPatchMutation, type CategoryPatch } from "../../services/api/v1";
import type { CreateUpdateCategory } from "../../pages/Categories";

interface Props {
  category: CreateUpdateCategory | null;
  handleClose: () => void
}

export const CategoryForm = ({ category, handleClose }: Props) => {
  const { t } = useTranslation();
  const [createCategory] = useCreateCategoryApiV1CategoryPostMutation()
  const [updateCategory] = useUpdateCategoryApiV1CategoryCategoryIdPatchMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategorySchemaType>({
    defaultValues: {
      ...category,
    },
    resolver: yupResolver(CategorySchema),
  });

  const onSubmit = (data: CategorySchemaType) => {
    if (category?.id) {
      updateCategory({ categoryId: category.id, categoryPatch: data }).then(() => {
        handleClose()
      })
    } else {
      createCategory({ categoryPost: data }).then(() => {
        handleClose()
      })
    }
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
          {t("common.button.confirm")}
        </Button>
      </Box>
    </>
  );
};
