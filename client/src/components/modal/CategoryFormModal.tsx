import { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { type CategoryFormSchemaType, CategoryFormSchema } from "../../lib/schemas/CategoryFormSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

interface Props {
	handleClose: () => void;
	selectedCategoryId: string | null;
	setSelectedCategoryId: (id: string | null) => void;
}

export const CategoryFormModal = forwardRef<HTMLDialogElement, Props>(
	({ handleClose, selectedCategoryId, setSelectedCategoryId }, ref) => {
		const { t } = useTranslation();
		const title = selectedCategoryId ? "Edit Category" : "Create Category";

		const {
			register,
			handleSubmit,
			formState: { errors },
		} = useForm<CategoryFormSchemaType>({
			defaultValues: CategoryFormSchema.cast({
				name: "",
				budget: 0,
			}),
			resolver: yupResolver(CategoryFormSchema),
		});

		const handleCloseModal = () => {
			if (selectedCategoryId) {
				setSelectedCategoryId(null);
			}
			handleClose();
		};

		const onSubmit = (data: CategoryFormSchemaType) => {
			console.log(data);
		};

		return (
			<dialog
				className="modal modal-bottom lg:modal-middle"
				ref={ref}
			>
				<div className="modal-box">
					<h1 className="font-extrabold text-2xl">{title}</h1>
					<form
						className="w-full flex flex-col gap-3"
						onSubmit={handleSubmit(onSubmit)}
					>
						<label className="form-control w-full">
							<div className="label">
								<span className="label-text">{t("settings.categories.form.field_name.label")}</span>
							</div>
							<input
								type="text"
								placeholder={t("settings.categories.form.field_name.placeholder")}
								className="input input-bordered w-full"
								{...register("name")}
							/>
							{errors?.name && (
								<div className="label text-error text-sm">
									<span>{errors.name.message}</span>
								</div>
							)}
						</label>
						<div>
							<label className="form-control w-full">
								<div className="label">
									<span className="label-text">{t("settings.categories.form.field_budget.label")}</span>
								</div>
								<input
									type="text"
									inputMode="numeric"
									pattern="[0-9]"
									className="input input-bordered w-full"
									{...register("budget")}
								/>
								{errors?.budget && (
									<div className="label text-error text-sm">
										<span>{errors.budget.message}</span>
									</div>
								)}
							</label>
						</div>
						<div className="modal-action">
							<button
								type="button"
								className="btn"
								onClick={handleClose}
							>
								Close
							</button>
							<button
								type="submit"
								className="btn btn-primary text-white"
							>
								Create
							</button>
						</div>
					</form>
				</div>
				<form
					method="dialog"
					className="modal-backdrop"
				>
					{/* if there is a button in form, it will close the modal */}
					<button
						type="button"
						onClick={handleCloseModal}
					>
						Close
					</button>
				</form>
			</dialog>
		);
	},
);
