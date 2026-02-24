import {
	DeleteOutlined,
	EditOutlined,
	FilterOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	DatePicker,
	Empty,
	Flex,
	Modal,
	message,
	Select,
	Space,
	Spin,
	Table,
	Tag,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DateTime } from "luxon";
import { useState } from "react";
import { Navigate } from "react-router";
import { ExpenseModal } from "@/components/Expense/ExpenseModal";
import { RoutesEnum } from "@/routes/Routes";
import type { ExpenseWithSplits, HouseholdMember } from "@/store/api/api";
import {
	useDeleteExpenseMutation,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
	useListExpensesQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

const PAGE_SIZE = 20;

export const ExpensesPage = () => {
	const { data: household, isLoading: isHouseholdLoading } =
		useGetMyHouseholdQuery();
	const { data: categories } = useListBudgetCategoriesQuery(undefined, {
		skip: !household,
	});

	const [filters, setFilters] = useState<{
		categoryId?: string;
		paidBy?: string;
		from?: string;
		to?: string;
	}>({});
	const [page, setPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingExpense, setEditingExpense] =
		useState<ExpenseWithSplits | null>(null);

	const { data: expenseData, isLoading: isExpensesLoading } =
		useListExpensesQuery(
			{
				...filters,
				limit: PAGE_SIZE,
				offset: (page - 1) * PAGE_SIZE,
			},
			{ skip: !household },
		);
	const [deleteExpense] = useDeleteExpenseMutation();

	if (isHouseholdLoading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin size="large" />
			</Flex>
		);
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const currency = household.currency;

	const memberMap = new Map<string, HouseholdMember>();
	for (const m of household.members) {
		memberMap.set(m.user_id, m);
	}

	const categoryMap = new Map<string, string>();
	if (categories) {
		for (const c of categories) {
			categoryMap.set(c.id, c.name);
		}
	}

	const getMemberName = (userId: string) => {
		const m = memberMap.get(userId);
		if (!m) return userId.slice(0, 8);
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	const handleEdit = (expense: ExpenseWithSplits) => {
		setEditingExpense(expense);
		setModalOpen(true);
	};

	const handleDelete = (expense: ExpenseWithSplits) => {
		Modal.confirm({
			title: "Delete Expense",
			content: `Are you sure you want to delete "${expense.title}"?`,
			okText: "Delete",
			okType: "danger",
			onOk: async () => {
				try {
					await deleteExpense({ expenseId: expense.id }).unwrap();
					message.success("Expense deleted.");
				} catch {
					message.error("Failed to delete expense.");
				}
			},
		});
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingExpense(null);
	};

	const columns: ColumnsType<ExpenseWithSplits> = [
		{
			title: "Date",
			dataIndex: "incurred_at",
			key: "date",
			width: 120,
			render: (val: string) =>
				DateTime.fromISO(val).toLocaleString(DateTime.DATE_MED),
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			render: (title: string) => (
				<Typography.Text strong>{title}</Typography.Text>
			),
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			align: "right",
			width: 130,
			render: (amount: number) => formatCurrency(amount, currency),
		},
		{
			title: "Paid By",
			dataIndex: "paid_by",
			key: "paid_by",
			width: 150,
			render: (userId: string) => getMemberName(userId),
		},
		{
			title: "Category",
			dataIndex: "budget_category_id",
			key: "category",
			width: 150,
			render: (catId: string | undefined) =>
				catId ? (
					<Tag>{categoryMap.get(catId) ?? "Unknown"}</Tag>
				) : (
					<Typography.Text type="secondary">—</Typography.Text>
				),
		},
		{
			title: "Split",
			key: "splits",
			width: 100,
			render: (_: unknown, record: ExpenseWithSplits) => (
				<Typography.Text type="secondary">
					{record.splits.length} {record.splits.length === 1 ? "way" : "ways"}
				</Typography.Text>
			),
		},
		{
			title: "",
			key: "actions",
			width: 100,
			render: (_: unknown, record: ExpenseWithSplits) => (
				<Flex gap={4}>
					<Button
						type="text"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					/>
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record)}
					/>
				</Flex>
			),
		},
	];

	return (
		<Flex vertical gap={24}>
			<Flex justify="space-between" align="center">
				<Typography.Title level={3} style={{ margin: 0 }}>
					Expenses
				</Typography.Title>
				<Space>
					<Button
						icon={<FilterOutlined />}
						onClick={() => setShowFilters(!showFilters)}
					>
						Filters
					</Button>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => setModalOpen(true)}
					>
						Add Expense
					</Button>
				</Space>
			</Flex>

			{showFilters && (
				<Card size="small">
					<Flex gap={16} wrap="wrap">
						<Select
							placeholder="Category"
							allowClear
							style={{ width: 180 }}
							value={filters.categoryId}
							onChange={(val) =>
								setFilters((f) => ({ ...f, categoryId: val ?? undefined }))
							}
							options={categories?.map((c) => ({
								value: c.id,
								label: c.name,
							}))}
						/>
						<Select
							placeholder="Paid by"
							allowClear
							style={{ width: 180 }}
							value={filters.paidBy}
							onChange={(val) =>
								setFilters((f) => ({ ...f, paidBy: val ?? undefined }))
							}
							options={household.members.map((m) => ({
								value: m.user_id,
								label:
									[m.first_name, m.last_name].filter(Boolean).join(" ") ||
									m.email,
							}))}
						/>
						<DatePicker.RangePicker
							onChange={(dates) => {
								const [fromDate, toDate] = dates ?? [];
								if (fromDate && toDate) {
									setFilters((f) => ({
										...f,
										from: fromDate.toISOString(),
										to: toDate.toISOString(),
									}));
								} else {
									setFilters((f) => ({
										...f,
										from: undefined,
										to: undefined,
									}));
								}
							}}
						/>
						<Button
							onClick={() => {
								setFilters({});
								setPage(1);
							}}
						>
							Clear
						</Button>
					</Flex>
				</Card>
			)}

			<Card>
				{isExpensesLoading ? (
					<Flex justify="center" style={{ padding: 48 }}>
						<Spin />
					</Flex>
				) : expenseData && expenseData.expenses.length > 0 ? (
					<Table
						dataSource={expenseData.expenses}
						columns={columns}
						rowKey="id"
						pagination={{
							current: page,
							pageSize: PAGE_SIZE,
							total: expenseData.total,
							onChange: (p) => setPage(p),
							showSizeChanger: false,
							showTotal: (total) => `${total} expenses`,
						}}
					/>
				) : (
					<Empty description="No expenses yet. Add one to get started!" />
				)}
			</Card>

			<ExpenseModal
				open={modalOpen}
				onClose={handleCloseModal}
				currency={currency}
				members={household.members}
				categories={categories ?? []}
				expense={editingExpense}
			/>
		</Flex>
	);
};
