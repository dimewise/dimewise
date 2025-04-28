import { baseApiV1 as api } from "./client";
export const addTagTypes = ["transactions", "me-detail"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      apiV1Root: build.query<ApiV1RootApiResponse, ApiV1RootApiArg>({
        query: () => ({ url: `/api/v1` }),
      }),
      apiV1CategoriesGetCategories: build.query<
        ApiV1CategoriesGetCategoriesApiResponse,
        ApiV1CategoriesGetCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/categories`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
          },
        }),
      }),
      apiV1CategoriesCreateCategory: build.mutation<
        ApiV1CategoriesCreateCategoryApiResponse,
        ApiV1CategoriesCreateCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/categories`,
          method: "POST",
          body: queryArg.categoryCreate,
        }),
      }),
      apiV1CategoriesOverviewYearGetCategoriesPerMonth: build.query<
        ApiV1CategoriesOverviewYearGetCategoriesPerMonthApiResponse,
        ApiV1CategoriesOverviewYearGetCategoriesPerMonthApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/categories/overview_year`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
          },
        }),
      }),
      apiV1CategoriesCategoryIdDeleteCategory: build.mutation<
        ApiV1CategoriesCategoryIdDeleteCategoryApiResponse,
        ApiV1CategoriesCategoryIdDeleteCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/categories/${queryArg.categoryId}`,
          method: "DELETE",
        }),
      }),
      apiV1CategoriesCategoryIdUpdateCategory: build.mutation<
        ApiV1CategoriesCategoryIdUpdateCategoryApiResponse,
        ApiV1CategoriesCategoryIdUpdateCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/categories/${queryArg.categoryId}`,
          method: "PATCH",
          body: queryArg.categoryCreate,
        }),
      }),
      apiV1ExpensesGetExpenses: build.query<
        ApiV1ExpensesGetExpensesApiResponse,
        ApiV1ExpensesGetExpensesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
            category_ids: queryArg.categoryIds,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["transactions"],
      }),
      apiV1ExpensesCreateExpense: build.mutation<
        ApiV1ExpensesCreateExpenseApiResponse,
        ApiV1ExpensesCreateExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses`,
          method: "POST",
          body: queryArg.expenseCreate,
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1ExpensesExpenseIdDeleteExpense: build.mutation<
        ApiV1ExpensesExpenseIdDeleteExpenseApiResponse,
        ApiV1ExpensesExpenseIdDeleteExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.expenseId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1ExpensesExpenseIdUpdateExpense: build.mutation<
        ApiV1ExpensesExpenseIdUpdateExpenseApiResponse,
        ApiV1ExpensesExpenseIdUpdateExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.expenseId}`,
          method: "PATCH",
          body: queryArg.expenseCreate,
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1UsersMeDetailGetMeDetail: build.query<
        ApiV1UsersMeDetailGetMeDetailApiResponse,
        ApiV1UsersMeDetailGetMeDetailApiArg
      >({
        query: () => ({ url: `/api/v1/users/me-detail` }),
        providesTags: ["me-detail"],
      }),
      apiV1UsersMeDetailUpdateMeDetail: build.mutation<
        ApiV1UsersMeDetailUpdateMeDetailApiResponse,
        ApiV1UsersMeDetailUpdateMeDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/me-detail`,
          method: "PATCH",
          body: queryArg.userEdit,
        }),
        invalidatesTags: ["me-detail"],
      }),
      apiV1UsersRegisterCreateUser: build.mutation<
        ApiV1UsersRegisterCreateUserApiResponse,
        ApiV1UsersRegisterCreateUserApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/register`,
          method: "POST",
          body: queryArg.userCreate,
        }),
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as apiV1 };
export type ApiV1RootApiResponse = unknown;
export type ApiV1RootApiArg = void;
export type ApiV1CategoriesGetCategoriesApiResponse =
  /** status 200 Request fulfilled, document follows */ CategoryFull[];
export type ApiV1CategoriesGetCategoriesApiArg = {
  fromDate?: string | null;
  toDate?: string | null;
};
export type ApiV1CategoriesCreateCategoryApiResponse = unknown;
export type ApiV1CategoriesCreateCategoryApiArg = {
  categoryCreate: CategoryCreate;
};
export type ApiV1CategoriesOverviewYearGetCategoriesPerMonthApiResponse =
  /** status 200 Request fulfilled, document follows */ CategoryOverview;
export type ApiV1CategoriesOverviewYearGetCategoriesPerMonthApiArg = {
  fromDate: string;
  toDate: string;
};
export type ApiV1CategoriesCategoryIdDeleteCategoryApiResponse = unknown;
export type ApiV1CategoriesCategoryIdDeleteCategoryApiArg = {
  categoryId: string;
};
export type ApiV1CategoriesCategoryIdUpdateCategoryApiResponse = unknown;
export type ApiV1CategoriesCategoryIdUpdateCategoryApiArg = {
  categoryId: string;
  categoryCreate: CategoryCreate;
};
export type ApiV1ExpensesGetExpensesApiResponse =
  /** status 200 Request fulfilled, document follows */ Expense[];
export type ApiV1ExpensesGetExpensesApiArg = {
  fromDate?: string | null;
  toDate?: string | null;
  categoryIds?: string[] | null;
  limit?: number | null;
};
export type ApiV1ExpensesCreateExpenseApiResponse = unknown;
export type ApiV1ExpensesCreateExpenseApiArg = {
  expenseCreate: ExpenseCreate;
};
export type ApiV1ExpensesExpenseIdDeleteExpenseApiResponse = unknown;
export type ApiV1ExpensesExpenseIdDeleteExpenseApiArg = {
  expenseId: string;
};
export type ApiV1ExpensesExpenseIdUpdateExpenseApiResponse = unknown;
export type ApiV1ExpensesExpenseIdUpdateExpenseApiArg = {
  expenseId: string;
  expenseCreate: ExpenseCreate;
};
export type ApiV1UsersMeDetailGetMeDetailApiResponse =
  /** status 200 Request fulfilled, document follows */ User;
export type ApiV1UsersMeDetailGetMeDetailApiArg = void;
export type ApiV1UsersMeDetailUpdateMeDetailApiResponse = unknown;
export type ApiV1UsersMeDetailUpdateMeDetailApiArg = {
  userEdit: UserEdit;
};
export type ApiV1UsersRegisterCreateUserApiResponse = unknown;
export type ApiV1UsersRegisterCreateUserApiArg = {
  userCreate: UserCreate;
};
export type CategoryFull = {
  budget: number;
  id: string;
  name: string;
  spent: number;
};
export type CategoryCreate = {
  budget: number;
  name: string;
};
export type CategoryOverview = {
  budget: number;
  months: {
    [key: string]: number[];
  };
};
export type CategoryExpense = {
  budget: number;
  id: string;
  name: string;
};
export type Expense = {
  amount: number;
  category: CategoryExpense;
  date: string;
  description?: string | null;
  id: string;
  title: string;
};
export type ExpenseCreate = {
  amount: number;
  category_id: string;
  date: string;
  description?: string | null;
  title: string;
};
export type User = {
  avatar_url?: string | null;
  default_currency:
    | "USD"
    | "EUR"
    | "JPY"
    | "GBP"
    | "AUD"
    | "CAD"
    | "CHF"
    | "CNY"
    | "SEK"
    | "NZD"
    | "NOK"
    | "KRW"
    | "INR"
    | "BRL"
    | "RUB"
    | "ZAR"
    | "TRY"
    | "MXN"
    | "SGD"
    | "HKD";
  email: string;
  id: string;
  name?: string | null;
};
export type UserEdit = {
  avatar_url?: string | null;
  name?: string | null;
};
export type UserCreate = {
  avatar_url?: string | null;
  default_currency:
    | "USD"
    | "EUR"
    | "JPY"
    | "GBP"
    | "AUD"
    | "CAD"
    | "CHF"
    | "CNY"
    | "SEK"
    | "NZD"
    | "NOK"
    | "KRW"
    | "INR"
    | "BRL"
    | "RUB"
    | "ZAR"
    | "TRY"
    | "MXN"
    | "SGD"
    | "HKD";
  email: string;
  id: string;
  name?: string | null;
};
export const {
  useApiV1RootQuery,
  useLazyApiV1RootQuery,
  useApiV1CategoriesGetCategoriesQuery,
  useLazyApiV1CategoriesGetCategoriesQuery,
  useApiV1CategoriesCreateCategoryMutation,
  useApiV1CategoriesOverviewYearGetCategoriesPerMonthQuery,
  useLazyApiV1CategoriesOverviewYearGetCategoriesPerMonthQuery,
  useApiV1CategoriesCategoryIdDeleteCategoryMutation,
  useApiV1CategoriesCategoryIdUpdateCategoryMutation,
  useApiV1ExpensesGetExpensesQuery,
  useLazyApiV1ExpensesGetExpensesQuery,
  useApiV1ExpensesCreateExpenseMutation,
  useApiV1ExpensesExpenseIdDeleteExpenseMutation,
  useApiV1ExpensesExpenseIdUpdateExpenseMutation,
  useApiV1UsersMeDetailGetMeDetailQuery,
  useLazyApiV1UsersMeDetailGetMeDetailQuery,
  useApiV1UsersMeDetailUpdateMeDetailMutation,
  useApiV1UsersRegisterCreateUserMutation,
} = injectedRtkApi;
