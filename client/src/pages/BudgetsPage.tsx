import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Empty,
	Flex,
	Modal,
	message,
	Progress,
	Spin,
	Table,
	Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { Navigate } from "react-router";
import { BudgetCategoryModal } from "@/components/Budget/BudgetCategoryModal";
import { BudgetOverviewCard } from "@/components/Budget/BudgetOverviewCard";
import { RoutesEnum } from "@/routes/Routes";
import type { BudgetCategory } from "@/store/api/api";
import {
	useDeleteBudgetCategoryMutation,
	useGetBudgetOverviewQuery,
	useGetMyHouseholdQuery,
	useListBudgetCategoriesQuery,
} from "@/store/api/api";
import { formatCurrency } from "@/utils/currency";

export const BudgetsPage = () => {
	const { data: household, isLoading: isHouseholdLoading } =
		useGetMyHouseholdQuery();
	const { data: categories, isLoading: isCategoriesLoading } =
		useListBudgetCategoriesQuery(undefined, { skip: !household });
	const { data: overview, isLoading: isOverviewLoading } =
		useGetBudgetOverviewQuery(undefined, { skip: !household });
	const [deleteCategory] = useDeleteBudgetCategoryMutation();

	const [modalOpen, setModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
		null,
	);

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

	const handleEdit = (category: BudgetCategory) => {
		setEditingCategory(category);
		setModalOpen(true);
	};

	const handleDelete = (category: BudgetCategory) => {
		Modal.confirm({
			title: "Delete Category",
			content: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
			okText: "Delete",
			okType: "danger",
			onOk: async () => {
				try {
					await deleteCategory({ budgetId: category.id }).unwrap();
					message.success(`"${category.name}" deleted.`);
				} catch {
					message.error("Failed to delete category.");
				}
			},
		});
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingCategory(null);
	};

	// Build a lookup of spent-per-category from overview
	const spentByCategory = new Map<string, number>();
	if (overview) {
		for (const cat of overview.categories) {
			spentByCategory.set(cat.id, cat.spent);
		}
	}

	const columns: ColumnsType<BudgetCategory> = [
		{
			title: "Category",
			dataIndex: "name",
			key: "name",
			render: (name: string) => (
				<Typography.Text strong>{name}</Typography.Text>
			),
		},
		{
			title: "Budget",
			dataIndex: "amount",
			key: "amount",
			align: "right",
			render: (amount: number) => formatCurrency(amount, currency),
		},
		{
			title: "Spent",
			key: "spent",
			align: "right",
			render: (_: unknown, record: BudgetCategory) => {
				const spent = spentByCategory.get(record.id) ?? 0;
				return formatCurrency(spent, currency);
			},
		},
		{
			title: "Progress",
			key: "progress",
			width: 200,
			render: (_: unknown, record: BudgetCategory) => {
				const spent = spentByCategory.get(record.id) ?? 0;
				const pct =
					record.amount > 0 ? Math.round((spent / record.amount) * 100) : 0;
				return (
					<Progress
						percent={pct}
						size="small"
						status={pct >= 100 ? "exception" : "active"}
					/>
				);
			},
		},
		{
			title: "",
			key: "actions",
			width: 100,
			render: (_: unknown, record: BudgetCategory) => (
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

	const isLoading = isCategoriesLoading || isOverviewLoading;

	return (
		<Flex vertical gap={24}>
			<Flex justify="space-between" align="center">
				<Typography.Title level={3} style={{ margin: 0 }}>
					Budget Categories
				</Typography.Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => setModalOpen(true)}
				>
					Add Category
				</Button>
			</Flex>

			{overview && (
				<BudgetOverviewCard overview={overview} currency={currency} />
			)}

			<Card>
				{isLoading ? (
					<Flex justify="center" style={{ padding: 48 }}>
						<Spin />
					</Flex>
				) : categories && categories.length > 0 ? (
					<Table
						dataSource={categories}
						columns={columns}
						rowKey="id"
						pagination={false}
					/>
				) : (
					<Empty description="No budget categories yet. Create one to get started!" />
				)}
			</Card>

			<BudgetCategoryModal
				open={modalOpen}
				onClose={handleCloseModal}
				currency={currency}
				category={editingCategory}
			/>
		</Flex>
	);
};
