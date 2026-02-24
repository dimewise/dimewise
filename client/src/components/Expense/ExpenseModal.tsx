import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	message,
	Select,
	Space,
	Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import type {
	BudgetCategory,
	ExpenseWithSplits,
	HouseholdMember,
} from "@/store/api/api";
import {
	useCreateExpenseMutation,
	useUpdateExpenseMutation,
} from "@/store/api/api";
import { fromSmallestUnit, toSmallestUnit } from "@/utils/currency";

type Props = {
	open: boolean;
	onClose: () => void;
	currency: string;
	members: HouseholdMember[];
	categories: BudgetCategory[];
	expense?: ExpenseWithSplits | null;
};

type SplitFormValue = {
	user_id: string;
	amount: number;
};

type FormValues = {
	title: string;
	amount: number;
	paid_by: string;
	budget_category_id?: string;
	notes?: string;
	incurred_at: dayjs.Dayjs;
	splits: SplitFormValue[];
};

export const ExpenseModal = ({
	open,
	onClose,
	currency,
	members,
	categories,
	expense,
}: Props) => {
	const [form] = Form.useForm<FormValues>();
	const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
	const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

	const isEditing = !!expense;
	const isZeroDecimal = ["JPY", "KRW"].includes(currency.toUpperCase());
	const precision = isZeroDecimal ? 0 : 2;

	useEffect(() => {
		if (open) {
			if (expense) {
				form.setFieldsValue({
					title: expense.title,
					amount: fromSmallestUnit(expense.amount, currency),
					paid_by: expense.paid_by,
					budget_category_id: expense.budget_category_id ?? undefined,
					notes: expense.notes ?? undefined,
					incurred_at: dayjs(expense.incurred_at),
					splits: expense.splits.map((s) => ({
						user_id: s.user_id,
						amount: fromSmallestUnit(s.amount, currency),
					})),
				});
			} else {
				form.resetFields();
				// Default: split equally among all members
				form.setFieldsValue({
					incurred_at: dayjs(),
					paid_by: members[0]?.user_id,
					splits: members.map((m) => ({
						user_id: m.user_id,
						amount: 0,
					})),
				});
			}
		}
	}, [open, expense, currency, form, members]);

	const splitEvenly = () => {
		const amount = form.getFieldValue("amount") as number | undefined;
		const splits = form.getFieldValue("splits") as SplitFormValue[] | undefined;
		if (!amount || !splits || splits.length === 0) return;

		const totalSmallest = toSmallestUnit(amount, currency);
		const perPerson = Math.floor(totalSmallest / splits.length);
		const remainder = totalSmallest - perPerson * splits.length;

		const newSplits = splits.map((s, i) => ({
			...s,
			amount: fromSmallestUnit(perPerson + (i < remainder ? 1 : 0), currency),
		}));
		form.setFieldsValue({ splits: newSplits });
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const amountSmallest = toSmallestUnit(values.amount, currency);
			const splitsSmallest = values.splits.map((s) => ({
				user_id: s.user_id,
				amount: toSmallestUnit(s.amount, currency),
			}));

			// Validate splits sum
			const splitsSum = splitsSmallest.reduce((sum, s) => sum + s.amount, 0);
			if (splitsSum !== amountSmallest) {
				message.error(
					`Splits must add up to the total amount. Current sum: ${fromSmallestUnit(splitsSum, currency)}, expected: ${values.amount}`,
				);
				return;
			}

			if (isEditing && expense) {
				await updateExpense({
					expenseId: expense.id,
					updateExpenseRequest: {
						title: values.title,
						amount: amountSmallest,
						paid_by: values.paid_by,
						budget_category_id: values.budget_category_id,
						notes: values.notes,
						incurred_at: values.incurred_at.toISOString(),
						splits: splitsSmallest,
					},
				}).unwrap();
				message.success("Expense updated!");
			} else {
				await createExpense({
					createExpenseRequest: {
						title: values.title,
						amount: amountSmallest,
						paid_by: values.paid_by,
						budget_category_id: values.budget_category_id,
						notes: values.notes,
						incurred_at: values.incurred_at.toISOString(),
						splits: splitsSmallest,
					},
				}).unwrap();
				message.success("Expense created!");
			}
			onClose();
		} catch {
			message.error(
				isEditing ? "Failed to update expense." : "Failed to create expense.",
			);
		}
	};

	const memberOptions = members.map((m) => ({
		value: m.user_id,
		label: [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email,
	}));

	const categoryOptions = [
		{ value: "", label: "No category" },
		...categories.map((c) => ({ value: c.id, label: c.name })),
	];

	return (
		<Modal
			open={open}
			title={isEditing ? "Edit Expense" : "New Expense"}
			okText={isEditing ? "Save" : "Create"}
			onOk={handleSubmit}
			onCancel={onClose}
			confirmLoading={isCreating || isUpdating}
			destroyOnClose
			width={600}
		>
			<Form form={form} layout="vertical" style={{ marginTop: 16 }}>
				<Form.Item
					name="title"
					label="Title"
					rules={[{ required: true, message: "Please enter a title" }]}
				>
					<Input placeholder="e.g. Groceries at Trader Joe's" />
				</Form.Item>

				<Space size="large" style={{ display: "flex" }}>
					<Form.Item
						name="amount"
						label="Amount"
						rules={[
							{ required: true, message: "Required" },
							{ type: "number", min: 0.01, message: "Must be > 0" },
						]}
						style={{ flex: 1 }}
					>
						<InputNumber
							style={{ width: "100%" }}
							prefix={currency}
							min={0}
							precision={precision}
							placeholder="0.00"
						/>
					</Form.Item>

					<Form.Item
						name="incurred_at"
						label="Date"
						rules={[{ required: true, message: "Required" }]}
						style={{ flex: 1 }}
					>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
				</Space>

				<Space size="large" style={{ display: "flex" }}>
					<Form.Item
						name="paid_by"
						label="Paid By"
						rules={[{ required: true, message: "Required" }]}
						style={{ flex: 1 }}
					>
						<Select options={memberOptions} />
					</Form.Item>

					<Form.Item
						name="budget_category_id"
						label="Category"
						style={{ flex: 1 }}
					>
						<Select options={categoryOptions} allowClear />
					</Form.Item>
				</Space>

				<Form.Item name="notes" label="Notes">
					<Input.TextArea rows={2} placeholder="Optional notes..." />
				</Form.Item>

				<Form.Item label="Splits">
					<Space style={{ marginBottom: 8 }}>
						<Button size="small" onClick={splitEvenly}>
							Split Evenly
						</Button>
						<Typography.Text type="secondary">
							Splits must add up to the total amount.
						</Typography.Text>
					</Space>
					<Form.List name="splits">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space
										key={key}
										style={{ display: "flex", marginBottom: 8 }}
										align="baseline"
									>
										<Form.Item
											{...restField}
											name={[name, "user_id"]}
											rules={[{ required: true, message: "Required" }]}
										>
											<Select
												placeholder="Member"
												style={{ width: 200 }}
												options={memberOptions}
											/>
										</Form.Item>
										<Form.Item
											{...restField}
											name={[name, "amount"]}
											rules={[
												{ required: true, message: "Required" },
												{ type: "number", min: 0, message: "Must be >= 0" },
											]}
										>
											<InputNumber
												prefix={currency}
												min={0}
												precision={precision}
												placeholder="0.00"
												style={{ width: 150 }}
											/>
										</Form.Item>
										{fields.length > 1 && (
											<MinusCircleOutlined onClick={() => remove(name)} />
										)}
									</Space>
								))}
								<Button
									type="dashed"
									onClick={() => add({ user_id: undefined, amount: 0 })}
									icon={<PlusOutlined />}
									block
								>
									Add Split
								</Button>
							</>
						)}
					</Form.List>
				</Form.Item>
			</Form>
		</Modal>
	);
};
