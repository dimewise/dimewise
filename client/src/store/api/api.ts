import { api } from "./client";
export const addTagTypes = [
  "Users",
  "Households",
  "Budgets",
  "Expenses",
  "Balances",
  "Reports",
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
      patchUsersMe: build.mutation<PatchUsersMeApiResponse, PatchUsersMeApiArg>(
        {
          query: (queryArg) => ({
            url: `/users/me`,
            method: "PATCH",
            body: queryArg.updateUserRequest,
          }),
          invalidatesTags: ["Users"],
        },
      ),
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
        invalidatesTags: ["Budgets", "Expenses"],
      }),
      deleteBudgetCategory: build.mutation<
        DeleteBudgetCategoryApiResponse,
        DeleteBudgetCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/budgets/${queryArg.budgetId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Budgets", "Expenses"],
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
        invalidatesTags: ["Expenses", "Budgets", "Balances"],
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
        invalidatesTags: ["Expenses", "Budgets", "Balances"],
      }),
      deleteExpense: build.mutation<
        DeleteExpenseApiResponse,
        DeleteExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/expenses/${queryArg.expenseId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Expenses", "Budgets", "Balances"],
      }),
      getMyBalances: build.query<GetMyBalancesApiResponse, GetMyBalancesApiArg>(
        {
          query: (queryArg) => ({
            url: `/balances/me`,
            params: {
              month: queryArg.month,
              year: queryArg.year,
            },
          }),
          providesTags: ["Balances"],
        },
      ),
      listReports: build.query<ListReportsApiResponse, ListReportsApiArg>({
        query: () => ({ url: `/reports` }),
        providesTags: ["Reports"],
      }),
      generateReport: build.mutation<
        GenerateReportApiResponse,
        GenerateReportApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/generate`,
          method: "POST",
          body: queryArg.generateReportRequest,
        }),
        invalidatesTags: ["Reports"],
      }),
      getReport: build.query<GetReportApiResponse, GetReportApiArg>({
        query: (queryArg) => ({ url: `/reports/${queryArg.reportId}` }),
        providesTags: ["Reports"],
      }),
      getReportTrends: build.query<
        GetReportTrendsApiResponse,
        GetReportTrendsApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/trends`,
          params: {
            months: queryArg.months,
            month: queryArg.month,
            year: queryArg.year,
          },
        }),
        providesTags: ["Reports"],
      }),
      markReportTransferPaid: build.mutation<
        MarkReportTransferPaidApiResponse,
        MarkReportTransferPaidApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/transfers/${queryArg.transferId}/pay`,
          method: "PATCH",
        }),
        invalidatesTags: ["Reports", "Balances"],
      }),
      unmarkReportTransferPaid: build.mutation<
        UnmarkReportTransferPaidApiResponse,
        UnmarkReportTransferPaidApiArg
      >({
        query: (queryArg) => ({
          url: `/reports/transfers/${queryArg.transferId}/unpay`,
          method: "PATCH",
        }),
        invalidatesTags: ["Reports", "Balances"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type GetUsersMeApiResponse = /** status 200 OK */ User;
export type GetUsersMeApiArg = void;
export type PatchUsersMeApiResponse =
  /** status 200 Updated user profile */ User;
export type PatchUsersMeApiArg = {
  updateUserRequest: UpdateUserRequest;
};
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
export type GetMyBalancesApiResponse = /** status 200 OK */ BalanceSummary;
export type GetMyBalancesApiArg = {
  /** Month (1-12). Defaults to current month. */
  month?: number;
  /** Year. Defaults to current year. */
  year?: number;
};
export type ListReportsApiResponse = /** status 200 OK */ Report[];
export type ListReportsApiArg = void;
export type GenerateReportApiResponse =
  /** status 201 Report generated */ ReportWithDetails;
export type GenerateReportApiArg = {
  generateReportRequest: GenerateReportRequest;
};
export type GetReportApiResponse = /** status 200 OK */ ReportWithDetails;
export type GetReportApiArg = {
  reportId: string;
};
export type GetReportTrendsApiResponse = /** status 200 OK */ ReportTrends;
export type GetReportTrendsApiArg = {
  /** Number of most recent months to include (default 12) */
  months?: number;
  /** Upper bound month (1-12). Only reports up to this month/year are included. */
  month?: number;
  /** Upper bound year. Only reports up to this month/year are included. */
  year?: number;
};
export type MarkReportTransferPaidApiResponse =
  /** status 200 Transfer marked as paid */ ReportTransfer;
export type MarkReportTransferPaidApiArg = {
  transferId: string;
};
export type UnmarkReportTransferPaidApiResponse =
  /** status 200 Transfer unmarked as paid */ ReportTransfer;
export type UnmarkReportTransferPaidApiArg = {
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
  /** Preferred language code (e.g. en, ja) */
  language: string;
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
export type UpdateUserRequest = {
  /** Preferred language code (e.g. en, ja) */
  language?: "en" | "ja";
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
export type MemberBalance = {
  user_id: string;
  member_name: string;
  /** Amount relative to current user (positive = they owe you, negative = you owe them) */
  amount: number;
};
export type BalanceSummary = {
  month: number;
  year: number;
  /** Current user's net balance (positive = owed money, negative = owes money) */
  net_balance: number;
  balances: MemberBalance[];
};
export type Report = BaseEntity & {
  household_id: string;
  month: number;
  year: number;
  /** Number of expenses in the month */
  total_expenses: number;
  /** Total expenditure in smallest currency unit */
  total_amount: number;
  /** Total number of transfers in this report */
  transfers_total: number;
  /** Number of transfers that have been marked as paid */
  transfers_settled: number;
  generated_at: string;
};
export type ReportMemberSummary = {
  id: string;
  user_id: string;
  member_name: string;
  /** Total amount this member paid for expenses */
  total_paid: number;
  /** Total amount this member owes (from splits) */
  total_owed: number;
  /** total_paid minus total_owed (positive means owed money) */
  net_balance: number;
};
export type ReportCategoryBreakdown = {
  id: string;
  category_name: string;
  /** Monthly budget for this category */
  budget_amount: number;
  /** Total spent in this category */
  total_spent: number;
};
export type ReportLineItemSplit = {
  id: string;
  user_id: string;
  member_name: string;
  amount: number;
};
export type ReportLineItem = {
  id: string;
  expense_id?: string;
  expense_title: string;
  category_name?: string;
  paid_by_user_id: string;
  paid_by_name: string;
  amount: number;
  incurred_at: string;
  notes?: string;
  splits: ReportLineItemSplit[];
};
export type ReportTransfer = {
  id: string;
  report_id?: string;
  from_user_id: string;
  to_user_id: string;
  from_name: string;
  to_name: string;
  /** Transfer amount in smallest currency unit */
  amount: number;
  paid_at?: string;
};
export type ReportWithDetails = Report & {
  member_summaries: ReportMemberSummary[];
  category_breakdowns: ReportCategoryBreakdown[];
  line_items: ReportLineItem[];
  transfers: ReportTransfer[];
};
export type GenerateReportRequest = {
  month: number;
  year: number;
};
export type MonthlySpend = {
  month: number;
  year: number;
  /** Total expenditure in smallest currency unit */
  total_amount: number;
  /** Number of expenses in the month */
  total_expenses: number;
};
export type CategoryTrendPoint = {
  month: number;
  year: number;
  total_spent: number;
  budget_amount: number;
};
export type CategoryTrend = {
  category_name: string;
  data: CategoryTrendPoint[];
};
export type MemberTrendPoint = {
  month: number;
  year: number;
  total_paid: number;
};
export type MemberTrend = {
  user_id: string;
  member_name: string;
  data: MemberTrendPoint[];
};
export type ReportTrends = {
  /** Monthly spend totals, oldest-first */
  months: MonthlySpend[];
  category_trends: CategoryTrend[];
  member_trends: MemberTrend[];
};
export const {
  useGetUsersMeQuery,
  useLazyGetUsersMeQuery,
  usePatchUsersMeMutation,
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
  useGetMyBalancesQuery,
  useLazyGetMyBalancesQuery,
  useListReportsQuery,
  useLazyListReportsQuery,
  useGenerateReportMutation,
  useGetReportQuery,
  useLazyGetReportQuery,
  useGetReportTrendsQuery,
  useLazyGetReportTrendsQuery,
  useMarkReportTransferPaidMutation,
  useUnmarkReportTransferPaidMutation,
} = injectedRtkApi;
