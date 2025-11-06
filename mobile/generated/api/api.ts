import { api } from "./client";
export const addTagTypes = [
  "Users",
  "Categories",
  "Payment Methods",
  "Expenses",
  "Analytics",
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
      postUsersMe: build.mutation<PostUsersMeApiResponse, PostUsersMeApiArg>({
        query: (queryArg) => ({
          url: `/users/me`,
          method: "POST",
          body: queryArg.userCreate,
        }),
        invalidatesTags: ["Users"],
      }),
      putUsersMe: build.mutation<PutUsersMeApiResponse, PutUsersMeApiArg>({
        query: (queryArg) => ({
          url: `/users/me`,
          method: "PUT",
          body: queryArg.userUpdate,
        }),
        invalidatesTags: ["Users"],
      }),
      getCategories: build.query<GetCategoriesApiResponse, GetCategoriesApiArg>(
        {
          query: (queryArg) => ({
            url: `/categories`,
            params: {
              include_deleted: queryArg.includeDeleted,
            },
          }),
          providesTags: ["Categories"],
        },
      ),
      postCategories: build.mutation<
        PostCategoriesApiResponse,
        PostCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/categories`,
          method: "POST",
          body: queryArg.categoryCreate,
        }),
        invalidatesTags: ["Categories"],
      }),
      getCategoriesByCategoryId: build.query<
        GetCategoriesByCategoryIdApiResponse,
        GetCategoriesByCategoryIdApiArg
      >({
        query: (queryArg) => ({ url: `/categories/${queryArg.categoryId}` }),
        providesTags: ["Categories"],
      }),
      putCategoriesByCategoryId: build.mutation<
        PutCategoriesByCategoryIdApiResponse,
        PutCategoriesByCategoryIdApiArg
      >({
        query: (queryArg) => ({
          url: `/categories/${queryArg.categoryId}`,
          method: "PUT",
          body: queryArg.categoryUpdate,
        }),
        invalidatesTags: ["Categories"],
      }),
      deleteCategoriesByCategoryId: build.mutation<
        DeleteCategoriesByCategoryIdApiResponse,
        DeleteCategoriesByCategoryIdApiArg
      >({
        query: (queryArg) => ({
          url: `/categories/${queryArg.categoryId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Categories"],
      }),
      getPaymentMethods: build.query<
        GetPaymentMethodsApiResponse,
        GetPaymentMethodsApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-methods`,
          params: {
            include_deleted: queryArg.includeDeleted,
          },
        }),
        providesTags: ["Payment Methods"],
      }),
      postPaymentMethods: build.mutation<
        PostPaymentMethodsApiResponse,
        PostPaymentMethodsApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-methods`,
          method: "POST",
          body: queryArg.paymentMethodCreate,
        }),
        invalidatesTags: ["Payment Methods"],
      }),
      getPaymentMethodsByPaymentMethodId: build.query<
        GetPaymentMethodsByPaymentMethodIdApiResponse,
        GetPaymentMethodsByPaymentMethodIdApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-methods/${queryArg.paymentMethodId}`,
        }),
        providesTags: ["Payment Methods"],
      }),
      putPaymentMethodsByPaymentMethodId: build.mutation<
        PutPaymentMethodsByPaymentMethodIdApiResponse,
        PutPaymentMethodsByPaymentMethodIdApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-methods/${queryArg.paymentMethodId}`,
          method: "PUT",
          body: queryArg.paymentMethodUpdate,
        }),
        invalidatesTags: ["Payment Methods"],
      }),
      deletePaymentMethodsByPaymentMethodId: build.mutation<
        DeletePaymentMethodsByPaymentMethodIdApiResponse,
        DeletePaymentMethodsByPaymentMethodIdApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-methods/${queryArg.paymentMethodId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Payment Methods"],
      }),
      getExpenses: build.query<GetExpensesApiResponse, GetExpensesApiArg>({
        query: (queryArg) => ({
          url: `/expenses`,
          params: {
            cursor: queryArg.cursor,
            limit: queryArg.limit,
            search: queryArg.search,
            category_id: queryArg.categoryId,
            payment_method_id: queryArg.paymentMethodId,
            date_from: queryArg.dateFrom,
            date_to: queryArg.dateTo,
            verification_status: queryArg.verificationStatus,
          },
        }),
        providesTags: ["Expenses"],
      }),
      postExpenses: build.mutation<PostExpensesApiResponse, PostExpensesApiArg>(
        {
          query: (queryArg) => ({
            url: `/expenses`,
            method: "POST",
            body: queryArg.expenseCreate,
          }),
          invalidatesTags: ["Expenses", "Analytics"],
        },
      ),
      getExpensesByExpenseId: build.query<
        GetExpensesByExpenseIdApiResponse,
        GetExpensesByExpenseIdApiArg
      >({
        query: (queryArg) => ({ url: `/expenses/${queryArg.expenseId}` }),
        providesTags: ["Expenses"],
      }),
      putExpensesByExpenseId: build.mutation<
        PutExpensesByExpenseIdApiResponse,
        PutExpensesByExpenseIdApiArg
      >({
        query: (queryArg) => ({
          url: `/expenses/${queryArg.expenseId}`,
          method: "PUT",
          body: queryArg.expenseUpdate,
        }),
        invalidatesTags: ["Expenses", "Analytics"],
      }),
      deleteExpensesByExpenseId: build.mutation<
        DeleteExpensesByExpenseIdApiResponse,
        DeleteExpensesByExpenseIdApiArg
      >({
        query: (queryArg) => ({
          url: `/expenses/${queryArg.expenseId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Expenses", "Analytics"],
      }),
      postExpensesByExpenseIdVerify: build.mutation<
        PostExpensesByExpenseIdVerifyApiResponse,
        PostExpensesByExpenseIdVerifyApiArg
      >({
        query: (queryArg) => ({
          url: `/expenses/${queryArg.expenseId}/verify`,
          method: "POST",
        }),
        invalidatesTags: ["Expenses", "Analytics"],
      }),
      getAnalyticsBudgetOverview: build.query<
        GetAnalyticsBudgetOverviewApiResponse,
        GetAnalyticsBudgetOverviewApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/budget-overview`,
          params: {
            month: queryArg.month,
            year: queryArg.year,
          },
        }),
        providesTags: ["Analytics"],
      }),
      getAnalyticsCategoriesBreakdown: build.query<
        GetAnalyticsCategoriesBreakdownApiResponse,
        GetAnalyticsCategoriesBreakdownApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/categories-breakdown`,
          params: {
            month: queryArg.month,
            year: queryArg.year,
          },
        }),
        providesTags: ["Analytics"],
      }),
      getAnalyticsPaymentMethodsBreakdown: build.query<
        GetAnalyticsPaymentMethodsBreakdownApiResponse,
        GetAnalyticsPaymentMethodsBreakdownApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/payment-methods-breakdown`,
          params: {
            month: queryArg.month,
            year: queryArg.year,
          },
        }),
        providesTags: ["Analytics"],
      }),
      getAnalyticsRecentTransactions: build.query<
        GetAnalyticsRecentTransactionsApiResponse,
        GetAnalyticsRecentTransactionsApiArg
      >({
        query: (queryArg) => ({
          url: `/analytics/recent-transactions`,
          params: {
            limit: queryArg.limit,
            month: queryArg.month,
            year: queryArg.year,
          },
        }),
        providesTags: ["Analytics"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type GetUsersMeApiResponse =
  /** status 200 User profile retrieved successfully */ User;
export type GetUsersMeApiArg = void;
export type PostUsersMeApiResponse =
  /** status 201 User created successfully */ User;
export type PostUsersMeApiArg = {
  userCreate: UserCreate;
};
export type PutUsersMeApiResponse =
  /** status 200 User profile updated successfully */ User;
export type PutUsersMeApiArg = {
  userUpdate: UserUpdate;
};
export type GetCategoriesApiResponse =
  /** status 200 Categories retrieved successfully */ Category[];
export type GetCategoriesApiArg = {
  /** Include soft-deleted categories */
  includeDeleted?: boolean;
};
export type PostCategoriesApiResponse =
  /** status 201 Category created successfully */ Category;
export type PostCategoriesApiArg = {
  categoryCreate: CategoryCreate;
};
export type GetCategoriesByCategoryIdApiResponse =
  /** status 200 Category retrieved successfully */ Category;
export type GetCategoriesByCategoryIdApiArg = {
  categoryId: string;
};
export type PutCategoriesByCategoryIdApiResponse =
  /** status 200 Category updated successfully */ Category;
export type PutCategoriesByCategoryIdApiArg = {
  categoryId: string;
  categoryUpdate: CategoryUpdate;
};
export type DeleteCategoriesByCategoryIdApiResponse =
  /** status 200 Category deleted successfully */ SuccessResponse;
export type DeleteCategoriesByCategoryIdApiArg = {
  categoryId: string;
};
export type GetPaymentMethodsApiResponse =
  /** status 200 Payment methods retrieved successfully */ PaymentMethod[];
export type GetPaymentMethodsApiArg = {
  /** Include soft-deleted payment methods */
  includeDeleted?: boolean;
};
export type PostPaymentMethodsApiResponse =
  /** status 201 Payment method created successfully */ PaymentMethod;
export type PostPaymentMethodsApiArg = {
  paymentMethodCreate: PaymentMethodCreate;
};
export type GetPaymentMethodsByPaymentMethodIdApiResponse =
  /** status 200 Payment method retrieved successfully */ PaymentMethod;
export type GetPaymentMethodsByPaymentMethodIdApiArg = {
  paymentMethodId: string;
};
export type PutPaymentMethodsByPaymentMethodIdApiResponse =
  /** status 200 Payment method updated successfully */ PaymentMethod;
export type PutPaymentMethodsByPaymentMethodIdApiArg = {
  paymentMethodId: string;
  paymentMethodUpdate: PaymentMethodUpdate;
};
export type DeletePaymentMethodsByPaymentMethodIdApiResponse =
  /** status 200 Payment method deleted successfully */ SuccessResponse;
export type DeletePaymentMethodsByPaymentMethodIdApiArg = {
  paymentMethodId: string;
};
export type GetExpensesApiResponse =
  /** status 200 Expenses retrieved successfully */ CursorPaginatedResponse & {
    data?: ExpenseWithDetails[];
  };
export type GetExpensesApiArg = {
  /** Encoded cursor for pagination (base64 encoded cursor from previous page) */
  cursor?: string;
  /** Number of items per page */
  limit?: number;
  /** Search query for title/description */
  search?: string;
  /** Filter by category ID */
  categoryId?: string;
  /** Filter by payment method ID */
  paymentMethodId?: string;
  /** Filter expenses from this date (YYYY-MM-DD) */
  dateFrom?: string;
  /** Filter expenses to this date (YYYY-MM-DD) */
  dateTo?: string;
  /** Filter by verification status */
  verificationStatus?: "verified" | "unverified";
};
export type PostExpensesApiResponse =
  /** status 201 Expense created successfully */ ExpenseWithDetails;
export type PostExpensesApiArg = {
  expenseCreate: ExpenseCreate;
};
export type GetExpensesByExpenseIdApiResponse =
  /** status 200 Expense retrieved successfully */ ExpenseWithDetails;
export type GetExpensesByExpenseIdApiArg = {
  expenseId: string;
};
export type PutExpensesByExpenseIdApiResponse =
  /** status 200 Expense updated successfully */ ExpenseWithDetails;
export type PutExpensesByExpenseIdApiArg = {
  expenseId: string;
  expenseUpdate: ExpenseUpdate;
};
export type DeleteExpensesByExpenseIdApiResponse =
  /** status 200 Expense deleted successfully */ SuccessResponse;
export type DeleteExpensesByExpenseIdApiArg = {
  expenseId: string;
};
export type PostExpensesByExpenseIdVerifyApiResponse =
  /** status 200 Expense verified successfully */ ExpenseWithDetails;
export type PostExpensesByExpenseIdVerifyApiArg = {
  expenseId: string;
};
export type GetAnalyticsBudgetOverviewApiResponse =
  /** status 200 Budget overview retrieved successfully */ BudgetOverview;
export type GetAnalyticsBudgetOverviewApiArg = {
  /** Month 1-12 */
  month?: number;
  /** Year */
  year?: number;
};
export type GetAnalyticsCategoriesBreakdownApiResponse =
  /** status 200 Categories breakdown retrieved successfully */ CategoryBreakdown[];
export type GetAnalyticsCategoriesBreakdownApiArg = {
  /** Month (0-11, where 0 is January) */
  month?: number;
  /** Year */
  year?: number;
};
export type GetAnalyticsPaymentMethodsBreakdownApiResponse =
  /** status 200 Payment methods breakdown retrieved successfully */ PaymentMethodBreakdown[];
export type GetAnalyticsPaymentMethodsBreakdownApiArg = {
  /** Month (0-11, where 0 is January) */
  month?: number;
  /** Year */
  year?: number;
};
export type GetAnalyticsRecentTransactionsApiResponse =
  /** status 200 Recent transactions retrieved successfully */ ExpenseWithDetails[];
export type GetAnalyticsRecentTransactionsApiArg = {
  /** Number of recent transactions to retrieve */
  limit?: number;
  /** Month (0-11, where 0 is January) */
  month?: number;
  /** Year */
  year?: number;
};
export type BaseEntity = {
  /** Unique identifier */
  id: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
};
export type CurrencyType =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "KRW"
  | "CAD"
  | "AUD"
  | "CHF"
  | "CNY"
  | "SEK"
  | "NOK"
  | "MXN"
  | "NZD"
  | "SGD"
  | "HKD"
  | "INR"
  | "RUB"
  | "ZAR"
  | "TRY"
  | "BRL"
  | "PLN"
  | "MYR"
  | "THB"
  | "VND"
  | "IDR"
  | "PHP"
  | "TWD"
  | "DKK"
  | "CZK"
  | "HUF";
export type SupportedLanguage = "en" | "ja";
export type User = BaseEntity & {
  currency: CurrencyType;
  preferred_language: SupportedLanguage;
};
export type ErrorResponse = {
  success: boolean;
  error: string;
  code: string;
};
export type UserCreate = {
  currency: CurrencyType;
  preferred_language: SupportedLanguage;
};
export type UserUpdate = {
  currency: CurrencyType;
  preferred_language: SupportedLanguage;
};
export type Category = BaseEntity & {
  /** User ID */
  user_id: string;
  /** Category title */
  title: string;
  /** Budget amount in cents */
  amount: number;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};
export type CategoryCreate = {
  /** Category title */
  title: string;
  /** Budget amount in cents */
  amount: number;
};
export type CategoryUpdate = {
  /** Category title */
  title: string;
  /** Budget amount in cents */
  amount: number;
};
export type SuccessResponse = {
  success: boolean;
  message: string;
};
export type PaymentMethodType =
  | "credit_card"
  | "debit_card"
  | "cash"
  | "bank_transfer"
  | "digital_wallet"
  | "other";
export type PaymentMethod = BaseEntity & {
  /** User ID */
  user_id: string;
  /** Payment method name */
  title: string;
  method_type: PaymentMethodType;
  /** Soft deletion timestamp */
  deleted_at?: string | null;
};
export type PaymentMethodCreate = {
  /** Payment method name */
  title: string;
  method_type: PaymentMethodType;
};
export type PaymentMethodUpdate = {
  /** Payment method name */
  title: string;
  method_type: PaymentMethodType;
};
export type Pagination = {
  limit: number;
  /** Whether there are more items after the current cursor */
  has_next: boolean;
  /** Whether there are more items before the current cursor */
  has_prev: boolean;
  /** Encoded cursor for the next page (null if has_next is false) */
  next_cursor?: string;
  /** Encoded cursor for the previous page (null if has_prev is false) */
  prev_cursor?: string;
};
export type CursorPaginatedResponse = {
  data: object[];
  pagination: Pagination;
};
export type Expense = BaseEntity & {
  /** User ID */
  user_id: string;
  /** Category ID */
  category_id: string;
  /** Payment method ID */
  payment_method_id: string;
  /** Expense title */
  title: string;
  /** Expense description */
  description?: string | null;
  /** Amount in cents */
  amount: number;
  /** When the expense was incurred */
  incurred_at: string;
  /** Verification timestamp */
  verified_at?: string | null;
};
export type ExpenseWithDetails = Expense & {
  category: Category;
  payment_method: PaymentMethod;
};
export type ExpenseCreate = {
  /** Category ID */
  category_id: string;
  /** Payment method ID */
  payment_method_id: string;
  /** Expense title */
  title: string;
  /** Expense description */
  description?: string | null;
  /** Amount in cents */
  amount: number;
  /** When the expense was incurred */
  incurred_at: string;
};
export type ExpenseUpdate = {
  /** Category ID */
  category_id: string;
  /** Payment method ID */
  payment_method_id: string;
  /** Expense title */
  title: string;
  /** Expense description */
  description?: string | null;
  /** Amount in cents */
  amount: number;
  /** When the expense was incurred */
  incurred_at: string;
};
export type BudgetOverview = {
  /** Total budget amount in cents */
  totalBudget: number;
  /** Total spent amount in cents */
  totalSpent: number;
  /** Remaining budget in cents */
  remainingBudget: number;
  /** Month (1-12) */
  month: number;
  /** Year */
  year: number;
};
export type CategoryBreakdown = {
  category_id: string;
  category_title: string;
  /** Budget amount in cents */
  budget: number;
  /** Spent amount in cents */
  spent: number;
  /** Remaining budget in cents */
  remaining: number;
};
export type PaymentMethodBreakdown = {
  payment_method_id: string;
  payment_method_title: string;
  /** Total spent amount in cents */
  total_spent: number;
};
export const {
  useGetUsersMeQuery,
  useLazyGetUsersMeQuery,
  usePostUsersMeMutation,
  usePutUsersMeMutation,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  usePostCategoriesMutation,
  useGetCategoriesByCategoryIdQuery,
  useLazyGetCategoriesByCategoryIdQuery,
  usePutCategoriesByCategoryIdMutation,
  useDeleteCategoriesByCategoryIdMutation,
  useGetPaymentMethodsQuery,
  useLazyGetPaymentMethodsQuery,
  usePostPaymentMethodsMutation,
  useGetPaymentMethodsByPaymentMethodIdQuery,
  useLazyGetPaymentMethodsByPaymentMethodIdQuery,
  usePutPaymentMethodsByPaymentMethodIdMutation,
  useDeletePaymentMethodsByPaymentMethodIdMutation,
  useGetExpensesQuery,
  useLazyGetExpensesQuery,
  usePostExpensesMutation,
  useGetExpensesByExpenseIdQuery,
  useLazyGetExpensesByExpenseIdQuery,
  usePutExpensesByExpenseIdMutation,
  useDeleteExpensesByExpenseIdMutation,
  usePostExpensesByExpenseIdVerifyMutation,
  useGetAnalyticsBudgetOverviewQuery,
  useLazyGetAnalyticsBudgetOverviewQuery,
  useGetAnalyticsCategoriesBreakdownQuery,
  useLazyGetAnalyticsCategoriesBreakdownQuery,
  useGetAnalyticsPaymentMethodsBreakdownQuery,
  useLazyGetAnalyticsPaymentMethodsBreakdownQuery,
  useGetAnalyticsRecentTransactionsQuery,
  useLazyGetAnalyticsRecentTransactionsQuery,
} = injectedRtkApi;
