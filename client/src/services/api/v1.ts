import { baseApiV1 as api } from "./client";
export const addTagTypes = ["transactions"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      apiV1Root: build.query<ApiV1RootApiResponse, ApiV1RootApiArg>({
        query: () => ({ url: `/api/v1` }),
      }),
      apiV1CategoryGetCategories: build.query<
        ApiV1CategoryGetCategoriesApiResponse,
        ApiV1CategoryGetCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/category`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
          },
        }),
      }),
      apiV1CategoryCreateCategory: build.mutation<
        ApiV1CategoryCreateCategoryApiResponse,
        ApiV1CategoryCreateCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/category`,
          method: "POST",
          body: queryArg.categoryCreate,
        }),
      }),
      apiV1CategoryOverviewYearGetCategoriesPerMonth: build.query<
        ApiV1CategoryOverviewYearGetCategoriesPerMonthApiResponse,
        ApiV1CategoryOverviewYearGetCategoriesPerMonthApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/category/overview_year`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
          },
        }),
      }),
      apiV1CategoryCategoryIdDeleteCategory: build.mutation<
        ApiV1CategoryCategoryIdDeleteCategoryApiResponse,
        ApiV1CategoryCategoryIdDeleteCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/category/${queryArg.categoryId}`,
          method: "DELETE",
        }),
      }),
      apiV1CategoryCategoryIdUpdateCategory: build.mutation<
        ApiV1CategoryCategoryIdUpdateCategoryApiResponse,
        ApiV1CategoryCategoryIdUpdateCategoryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/category/${queryArg.categoryId}`,
          method: "PATCH",
          body: queryArg.categoryCreate,
        }),
      }),
      apiV1ExpenseGetExpenses: build.query<
        ApiV1ExpenseGetExpensesApiResponse,
        ApiV1ExpenseGetExpensesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense`,
          params: {
            from_date: queryArg.fromDate,
            to_date: queryArg.toDate,
            category_ids: queryArg.categoryIds,
          },
        }),
        providesTags: ["transactions"],
      }),
      apiV1ExpenseCreateExpense: build.mutation<
        ApiV1ExpenseCreateExpenseApiResponse,
        ApiV1ExpenseCreateExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense`,
          method: "POST",
          body: queryArg.expenseCreate,
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1ExpenseExpenseIdDeleteExpense: build.mutation<
        ApiV1ExpenseExpenseIdDeleteExpenseApiResponse,
        ApiV1ExpenseExpenseIdDeleteExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense/${queryArg.expenseId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1ExpenseExpenseIdUpdateExpense: build.mutation<
        ApiV1ExpenseExpenseIdUpdateExpenseApiResponse,
        ApiV1ExpenseExpenseIdUpdateExpenseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense/${queryArg.expenseId}`,
          method: "PATCH",
          body: queryArg.expenseCreate,
        }),
        invalidatesTags: ["transactions"],
      }),
      apiV1UserMeDetailGetMeDetail: build.query<
        ApiV1UserMeDetailGetMeDetailApiResponse,
        ApiV1UserMeDetailGetMeDetailApiArg
      >({
        query: () => ({ url: `/api/v1/user/me-detail` }),
      }),
      apiV1UserRegisterCreateUser: build.mutation<
        ApiV1UserRegisterCreateUserApiResponse,
        ApiV1UserRegisterCreateUserApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/user/register`,
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
export type ApiV1CategoryGetCategoriesApiResponse =
  /** status 200 Request fulfilled, document follows */ CategoryFull[];
export type ApiV1CategoryGetCategoriesApiArg = {
  fromDate?: null | string;
  toDate?: null | string;
};
export type ApiV1CategoryCreateCategoryApiResponse = unknown;
export type ApiV1CategoryCreateCategoryApiArg = {
  categoryCreate: CategoryCreate;
};
export type ApiV1CategoryOverviewYearGetCategoriesPerMonthApiResponse =
  /** status 200 Request fulfilled, document follows */ {
    [key: string]: CategoryFull[];
  };
export type ApiV1CategoryOverviewYearGetCategoriesPerMonthApiArg = {
  fromDate?: null | string;
  toDate?: null | string;
};
export type ApiV1CategoryCategoryIdDeleteCategoryApiResponse = unknown;
export type ApiV1CategoryCategoryIdDeleteCategoryApiArg = {
  categoryId: string;
};
export type ApiV1CategoryCategoryIdUpdateCategoryApiResponse = unknown;
export type ApiV1CategoryCategoryIdUpdateCategoryApiArg = {
  categoryId: string;
  categoryCreate: CategoryCreate;
};
export type ApiV1ExpenseGetExpensesApiResponse =
  /** status 200 Request fulfilled, document follows */ Expense[];
export type ApiV1ExpenseGetExpensesApiArg = {
  fromDate?: null | string;
  toDate?: null | string;
  categoryIds?: null | string[];
};
export type ApiV1ExpenseCreateExpenseApiResponse = unknown;
export type ApiV1ExpenseCreateExpenseApiArg = {
  expenseCreate: ExpenseCreate;
};
export type ApiV1ExpenseExpenseIdDeleteExpenseApiResponse = unknown;
export type ApiV1ExpenseExpenseIdDeleteExpenseApiArg = {
  expenseId: string;
};
export type ApiV1ExpenseExpenseIdUpdateExpenseApiResponse = unknown;
export type ApiV1ExpenseExpenseIdUpdateExpenseApiArg = {
  expenseId: string;
  expenseCreate: ExpenseCreate;
};
export type ApiV1UserMeDetailGetMeDetailApiResponse =
  /** status 200 Request fulfilled, document follows */ User;
export type ApiV1UserMeDetailGetMeDetailApiArg = void;
export type ApiV1UserRegisterCreateUserApiResponse = unknown;
export type ApiV1UserRegisterCreateUserApiArg = {
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
export type CategoryExpense = {
  budget: number;
  id: string;
  name: string;
};
export type Expense = {
  amount: number;
  category: CategoryExpense;
  date: string;
  description?: null | string;
  id: string;
  title: string;
};
export type ExpenseCreate = {
  amount: number;
  category_id: string;
  date: string;
  description?: null | string;
  title: string;
};
export type User = {
  avatar_url?: null | string;
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
  name?: null | string;
};
export type UserCreate = {
  avatar_url?: null | string;
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
  name?: null | string;
};
export const {
  useApiV1RootQuery,
  useLazyApiV1RootQuery,
  useApiV1CategoryGetCategoriesQuery,
  useLazyApiV1CategoryGetCategoriesQuery,
  useApiV1CategoryCreateCategoryMutation,
  useApiV1CategoryOverviewYearGetCategoriesPerMonthQuery,
  useLazyApiV1CategoryOverviewYearGetCategoriesPerMonthQuery,
  useApiV1CategoryCategoryIdDeleteCategoryMutation,
  useApiV1CategoryCategoryIdUpdateCategoryMutation,
  useApiV1ExpenseGetExpensesQuery,
  useLazyApiV1ExpenseGetExpensesQuery,
  useApiV1ExpenseCreateExpenseMutation,
  useApiV1ExpenseExpenseIdDeleteExpenseMutation,
  useApiV1ExpenseExpenseIdUpdateExpenseMutation,
  useApiV1UserMeDetailGetMeDetailQuery,
  useLazyApiV1UserMeDetailGetMeDetailQuery,
  useApiV1UserRegisterCreateUserMutation,
} = injectedRtkApi;
