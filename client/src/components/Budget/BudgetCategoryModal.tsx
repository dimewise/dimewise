import { Form, Input, InputNumber, Modal, message } from "antd";
import { useEffect } from "react";
import type { BudgetCategory } from "@/store/api/api";
import {
	useCreateBudgetCategoryMutation,
	useUpdateBudgetCategoryMutation,
} from "@/store/api/api";
import { fromSmallestUnit, toSmallestUnit } from "@/utils/currency";

type Props = {
	open: boolean;
	onClose: () => void;
	currency: string;
	category?: BudgetCategory | null;
};

type FormValues = {
	name: string;
	amount: number;
};

export const BudgetCategoryModal = ({
	open,
	onClose,
	currency,
	category,
}: Props) => {
	const [form] = Form.useForm<FormValues>();
	const [createCategory, { isLoading: isCreating }] =
		useCreateBudgetCategoryMutation();
	const [updateCategory, { isLoading: isUpdating }] =
		useUpdateBudgetCategoryMutation();

	const isEditing = !!category;

	useEffect(() => {
		if (open) {
			if (category) {
				form.setFieldsValue({
					name: category.name,
					amount: fromSmallestUnit(category.amount, currency),
				});
			} else {
				form.resetFields();
			}
		}
	}, [open, category, currency, form]);

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const amountInSmallestUnit = toSmallestUnit(values.amount, currency);

			if (isEditing && category) {
				await updateCategory({
					budgetId: category.id,
					updateBudgetCategoryRequest: {
						name: values.name,
						amount: amountInSmallestUnit,
					},
				}).unwrap();
				message.success("Category updated!");
			} else {
				await createCategory({
					createBudgetCategoryRequest: {
						name: values.name,
						amount: amountInSmallestUnit,
					},
				}).unwrap();
				message.success("Category created!");
			}
			onClose();
		} catch {
			message.error(
				isEditing ? "Failed to update category." : "Failed to create category.",
			);
		}
	};

	return (
		<Modal
			open={open}
			title={isEditing ? "Edit Budget Category" : "New Budget Category"}
			okText={isEditing ? "Save" : "Create"}
			onOk={handleSubmit}
			onCancel={onClose}
			confirmLoading={isCreating || isUpdating}
			destroyOnClose
		>
			<Form form={form} layout="vertical" style={{ marginTop: 16 }}>
				<Form.Item
					name="name"
					label="Category Name"
					rules={[
						{
							required: true,
							message: "Please enter a category name",
						},
					]}
				>
					<Input placeholder="e.g. Groceries, Rent, Utilities" />
				</Form.Item>
				<Form.Item
					name="amount"
					label="Monthly Budget"
					rules={[
						{
							required: true,
							message: "Please enter a budget amount",
						},
						{
							type: "number",
							min: 0.01,
							message: "Amount must be greater than zero",
						},
					]}
				>
					<InputNumber
						style={{ width: "100%" }}
						prefix={currency}
						min={0}
						precision={["JPY", "KRW"].includes(currency.toUpperCase()) ? 0 : 2}
						placeholder="0.00"
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
