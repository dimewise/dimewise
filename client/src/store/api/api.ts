import { api } from "./client";
export const addTagTypes = [
	"Users",
	"Households",
	"Budgets",
	"Expenses",
	"Settlements",
] as const;
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getUsersMe: build.query<GetUsersMeApiResponse, GetUsersMeApiArg>({
				query: () => ({ url: `/users/me` }),
				providesTags: ["Users"],
			}),
			createHousehold: build.mutation<
				CreateHouseholdApiResponse,
				CreateHouseholdApiArg
			>({
				query: (queryArg) => ({
					url: `/households`,
					method: "POST",
					body: queryArg.createHouseholdRequest,
				}),
				invalidatesTags: ["Households"],
			}),
			deleteHousehold: build.mutation<
				DeleteHouseholdApiResponse,
				DeleteHouseholdApiArg
			>({
				query: () => ({ url: `/households`, method: "DELETE" }),
				invalidatesTags: ["Households"],
			}),
			getMyHousehold: build.query<
				GetMyHouseholdApiResponse,
				GetMyHouseholdApiArg
			>({
				query: () => ({ url: `/households/me` }),
				providesTags: ["Households"],
			}),
			joinHousehold: build.mutation<
				JoinHouseholdApiResponse,
				JoinHouseholdApiArg
			>({
				query: (queryArg) => ({
					url: `/households/join`,
					method: "POST",
					body: queryArg.joinHouseholdRequest,
				}),
				invalidatesTags: ["Households"],
			}),
			regenerateInviteCode: build.mutation<
				RegenerateInviteCodeApiResponse,
				RegenerateInviteCodeApiArg
			>({
				query: () => ({
					url: `/households/invite-code/regenerate`,
					method: "POST",
				}),
				invalidatesTags: ["Households"],
			}),
			removeHouseholdMember: build.mutation<
				RemoveHouseholdMemberApiResponse,
				RemoveHouseholdMemberApiArg
			>({
				query: (queryArg) => ({
					url: `/households/members/${queryArg.userId}`,
					method: "DELETE",
				}),
				invalidatesTags: ["Households"],
			}),
			leaveHousehold: build.mutation<
				LeaveHouseholdApiResponse,
				LeaveHouseholdApiArg
			>({
				query: () => ({ url: `/households/leave`, method: "POST" }),
				invalidatesTags: ["Households"],
			}),
			listBudgetCategories: build.query<
				ListBudgetCategoriesApiResponse,
				ListBudgetCategoriesApiArg
			>({
				query: () => ({ url: `/budgets` }),
				providesTags: ["Budgets"],
			}),
			createBudgetCategory: build.mutation<
				CreateBudgetCategoryApiResponse,
				CreateBudgetCategoryApiArg
			>({
				query: (queryArg) => ({
					url: `/budgets`,
					method: "POST",
					body: queryArg.createBudgetCategoryRequest,
				}),
				invalidatesTags: ["Budgets"],
			}),
			updateBudgetCategory: build.mutation<
				UpdateBudgetCategoryApiResponse,
				UpdateBudgetCategoryApiArg
			>({
				query: (queryArg) => ({
					url: `/budgets/${queryArg.budgetId}`,
					method: "PATCH",
					body: queryArg.updateBudgetCategoryRequest,
				}),
				invalidatesTags: ["Budgets"],
			}),
			deleteBudgetCategory: build.mutation<
				DeleteBudgetCategoryApiResponse,
				DeleteBudgetCategoryApiArg
			>({
				query: (queryArg) => ({
					url: `/budgets/${queryArg.budgetId}`,
					method: "DELETE",
				}),
				invalidatesTags: ["Budgets"],
			}),
			getBudgetOverview: build.query<
				GetBudgetOverviewApiResponse,
				GetBudgetOverviewApiArg
			>({
				query: () => ({ url: `/budgets/overview` }),
				providesTags: ["Budgets"],
			}),
			listExpenses: build.query<ListExpensesApiResponse, ListExpensesApiArg>({
				query: (queryArg) => ({
					url: `/expenses`,
					params: {
						category_id: queryArg.categoryId,
						paid_by: queryArg.paidBy,
						from: queryArg["from"],
						to: queryArg.to,
						limit: queryArg.limit,
						offset: queryArg.offset,
					},
				}),
				providesTags: ["Expenses"],
			}),
			createExpense: build.mutation<
				CreateExpenseApiResponse,
				CreateExpenseApiArg
			>({
				query: (queryArg) => ({
					url: `/expenses`,
					method: "POST",
					body: queryArg.createExpenseRequest,
				}),
				invalidatesTags: ["Expenses"],
			}),
			getExpense: build.query<GetExpenseApiResponse, GetExpenseApiArg>({
				query: (queryArg) => ({ url: `/expenses/${queryArg.expenseId}` }),
				providesTags: ["Expenses"],
			}),
			updateExpense: build.mutation<
				UpdateExpenseApiResponse,
				UpdateExpenseApiArg
			>({
				query: (queryArg) => ({
					url: `/expenses/${queryArg.expenseId}`,
					method: "PATCH",
					body: queryArg.updateExpenseRequest,
				}),
				invalidatesTags: ["Expenses"],
			}),
			deleteExpense: build.mutation<
				DeleteExpenseApiResponse,
				DeleteExpenseApiArg
			>({
				query: (queryArg) => ({
					url: `/expenses/${queryArg.expenseId}`,
					method: "DELETE",
				}),
				invalidatesTags: ["Expenses"],
			}),
			listSettlements: build.query<
				ListSettlementsApiResponse,
				ListSettlementsApiArg
			>({
				query: () => ({ url: `/settlements` }),
				providesTags: ["Settlements"],
			}),
			generateSettlement: build.mutation<
				GenerateSettlementApiResponse,
				GenerateSettlementApiArg
			>({
				query: (queryArg) => ({
					url: `/settlements/generate`,
					method: "POST",
					body: queryArg.generateSettlementRequest,
				}),
				invalidatesTags: ["Settlements"],
			}),
			getSettlement: build.query<GetSettlementApiResponse, GetSettlementApiArg>(
				{
					query: (queryArg) => ({
						url: `/settlements/${queryArg.settlementId}`,
					}),
					providesTags: ["Settlements"],
				},
			),
			markTransferPaid: build.mutation<
				MarkTransferPaidApiResponse,
				MarkTransferPaidApiArg
			>({
				query: (queryArg) => ({
					url: `/settlements/transfers/${queryArg.transferId}/pay`,
					method: "PATCH",
				}),
				invalidatesTags: ["Settlements"],
			}),
		}),
		overrideExisting: false,
	});
export { injectedRtkApi as api };
export type GetUsersMeApiResponse = /** status 200 OK */ User;
export type GetUsersMeApiArg = void;
export type CreateHouseholdApiResponse =
	/** status 201 Household created */ Household;
export type CreateHouseholdApiArg = {
	createHouseholdRequest: CreateHouseholdRequest;
};
export type DeleteHouseholdApiResponse = unknown;
export type DeleteHouseholdApiArg = void;
export type GetMyHouseholdApiResponse =
	/** status 200 OK */ HouseholdWithMembers;
export type GetMyHouseholdApiArg = void;
export type JoinHouseholdApiResponse =
	/** status 200 Joined household */ HouseholdWithMembers;
export type JoinHouseholdApiArg = {
	joinHouseholdRequest: JoinHouseholdRequest;
};
export type RegenerateInviteCodeApiResponse =
	/** status 200 New invite code generated */ Household;
export type RegenerateInviteCodeApiArg = void;
export type RemoveHouseholdMemberApiResponse = unknown;
export type RemoveHouseholdMemberApiArg = {
	userId: string;
};
export type LeaveHouseholdApiResponse = unknown;
export type LeaveHouseholdApiArg = void;
export type ListBudgetCategoriesApiResponse =
	/** status 200 OK */ BudgetCategory[];
export type ListBudgetCategoriesApiArg = void;
export type CreateBudgetCategoryApiResponse =
	/** status 201 Budget category created */ BudgetCategory;
export type CreateBudgetCategoryApiArg = {
	createBudgetCategoryRequest: CreateBudgetCategoryRequest;
};
export type UpdateBudgetCategoryApiResponse =
	/** status 200 Budget category updated */ BudgetCategory;
export type UpdateBudgetCategoryApiArg = {
	budgetId: string;
	updateBudgetCategoryRequest: UpdateBudgetCategoryRequest;
};
export type DeleteBudgetCategoryApiResponse = unknown;
export type DeleteBudgetCategoryApiArg = {
	budgetId: string;
};
export type GetBudgetOverviewApiResponse = /** status 200 OK */ BudgetOverview;
export type GetBudgetOverviewApiArg = void;
export type ListExpensesApiResponse = /** status 200 OK */ ExpenseListResponse;
export type ListExpensesApiArg = {
	categoryId?: string;
	paidBy?: string;
	from?: string;
	to?: string;
	limit?: number;
	offset?: number;
};
export type CreateExpenseApiResponse =
	/** status 201 Expense created */ ExpenseWithSplits;
export type CreateExpenseApiArg = {
	createExpenseRequest: CreateExpenseRequest;
};
export type GetExpenseApiResponse = /** status 200 OK */ ExpenseWithSplits;
export type GetExpenseApiArg = {
	expenseId: string;
};
export type UpdateExpenseApiResponse =
	/** status 200 Expense updated */ ExpenseWithSplits;
export type UpdateExpenseApiArg = {
	expenseId: string;
	updateExpenseRequest: UpdateExpenseRequest;
};
export type DeleteExpenseApiResponse = unknown;
export type DeleteExpenseApiArg = {
	expenseId: string;
};
export type ListSettlementsApiResponse = /** status 200 OK */ Settlement[];
export type ListSettlementsApiArg = void;
export type GenerateSettlementApiResponse =
	/** status 201 Settlement generated */ SettlementWithTransfers;
export type GenerateSettlementApiArg = {
	generateSettlementRequest: GenerateSettlementRequest;
};
export type GetSettlementApiResponse =
	/** status 200 OK */ SettlementWithTransfers;
export type GetSettlementApiArg = {
	settlementId: string;
};
export type MarkTransferPaidApiResponse =
	/** status 200 Transfer marked as paid */ SettlementTransfer;
export type MarkTransferPaidApiArg = {
	transferId: string;
};
export type BaseEntity = {
	id: string;
	created_at: string;
	updated_at: string;
};
export type User = BaseEntity & {
	email: string;
	first_name?: string;
	last_name?: string;
	avatar_url?: string;
};
export type ValidationError = {
	/** The JSON path to the field that failed (e.g., "email"). */
	field?: string;
	/** A description of why the field failed validation. */
	message?: string;
};
export type ProblemDetails = {
	/** A URI reference that identifies the problem type. */
	type?: string;
	/** A short, human-readable summary of the problem type. */
	title?: string;
	/** The HTTP status code generated by the origin server. */
	status?: number;
	/** A human-readable explanation specific to this occurrence. */
	detail?: string;
	/** A URI reference that identifies the specific occurrence. */
	instance?: string;
	/** Optional list of individual field errors (common for 400 errors). */
	errors?: ValidationError[];
};
export type Household = BaseEntity & {
	name: string;
	/** ISO 4217 currency code */
	currency: string;
	invite_code: string;
	owner_id: string;
};
export type CreateHouseholdRequest = {
	name: string;
	/** ISO 4217 currency code */
	currency:
		| "USD"
		| "EUR"
		| "GBP"
		| "CAD"
		| "AUD"
		| "SGD"
		| "HKD"
		| "NZD"
		| "CHF"
		| "JPY"
		| "KRW";
};
export type HouseholdMember = {
	id: string;
	user_id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	avatar_url?: string;
	joined_at: string;
};
export type HouseholdWithMembers = Household & {
	members: HouseholdMember[];
};
export type JoinHouseholdRequest = {
	invite_code: string;
};
export type BudgetCategory = BaseEntity & {
	household_id: string;
	name: string;
	/** Monthly budget in smallest currency unit (e.g. cents) */
	amount: number;
	sort_order: number;
};
export type CreateBudgetCategoryRequest = {
	name: string;
	/** Monthly budget in smallest currency unit */
	amount: number;
};
export type UpdateBudgetCategoryRequest = {
	name?: string;
	/** Monthly budget in smallest currency unit */
	amount?: number;
	sort_order?: number;
};
export type BudgetCategoryOverview = {
	id: string;
	name: string;
	budget: number;
	spent: number;
	remaining: number;
};
export type BudgetOverview = {
	/** Sum of all budget category amounts */
	total_budget: number;
	/** Total spent this month across all categories */
	total_spent: number;
	/** total_budget minus total_spent */
	remaining: number;
	categories: BudgetCategoryOverview[];
};
export type Expense = BaseEntity & {
	household_id: string;
	budget_category_id?: string;
	paid_by: string;
	logged_by: string;
	title: string;
	/** Amount in smallest currency unit */
	amount: number;
	notes?: string;
	incurred_at: string;
};
export type ExpenseSplit = {
	id: string;
	expense_id: string;
	user_id: string;
	/** Split amount in smallest currency unit */
	amount: number;
};
export type ExpenseWithSplits = Expense & {
	splits: ExpenseSplit[];
};
export type ExpenseListResponse = {
	expenses: ExpenseWithSplits[];
	/** Total number of matching expenses (for pagination) */
	total: number;
};
export type ExpenseSplitInput = {
	user_id: string;
	/** Split amount in smallest currency unit */
	amount: number;
};
export type CreateExpenseRequest = {
	paid_by: string;
	budget_category_id?: string;
	title: string;
	/** Amount in smallest currency unit */
	amount: number;
	notes?: string;
	incurred_at: string;
	splits: ExpenseSplitInput[];
};
export type UpdateExpenseRequest = {
	paid_by?: string;
	budget_category_id?: string;
	title?: string;
	amount?: number;
	notes?: string;
	incurred_at?: string;
	splits?: ExpenseSplitInput[];
};
export type Settlement = BaseEntity & {
	household_id: string;
	month: number;
	year: number;
	generated_at: string;
};
export type SettlementTransfer = BaseEntity & {
	settlement_id: string;
	from_user_id: string;
	to_user_id: string;
	/** Transfer amount in smallest currency unit */
	amount: number;
	paid_at?: string;
};
export type SettlementWithTransfers = Settlement & {
	transfers: SettlementTransfer[];
};
export type GenerateSettlementRequest = {
	month: number;
	year: number;
};
export const {
	useGetUsersMeQuery,
	useLazyGetUsersMeQuery,
	useCreateHouseholdMutation,
	useDeleteHouseholdMutation,
	useGetMyHouseholdQuery,
	useLazyGetMyHouseholdQuery,
	useJoinHouseholdMutation,
	useRegenerateInviteCodeMutation,
	useRemoveHouseholdMemberMutation,
	useLeaveHouseholdMutation,
	useListBudgetCategoriesQuery,
	useLazyListBudgetCategoriesQuery,
	useCreateBudgetCategoryMutation,
	useUpdateBudgetCategoryMutation,
	useDeleteBudgetCategoryMutation,
	useGetBudgetOverviewQuery,
	useLazyGetBudgetOverviewQuery,
	useListExpensesQuery,
	useLazyListExpensesQuery,
	useCreateExpenseMutation,
	useGetExpenseQuery,
	useLazyGetExpenseQuery,
	useUpdateExpenseMutation,
	useDeleteExpenseMutation,
	useListSettlementsQuery,
	useLazyListSettlementsQuery,
	useGenerateSettlementMutation,
	useGetSettlementQuery,
	useLazyGetSettlementQuery,
	useMarkTransferPaidMutation,
} = injectedRtkApi;
