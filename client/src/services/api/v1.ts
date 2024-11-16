import { baseApiV1 as api } from "./client";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    apiV1Root: build.query<ApiV1RootApiResponse, ApiV1RootApiArg>({
      query: () => ({ url: `/api/v1` }),
    }),
    apiV1CategoryGetCategories: build.query<
      ApiV1CategoryGetCategoriesApiResponse,
      ApiV1CategoryGetCategoriesApiArg
    >({
      query: () => ({ url: `/api/v1/category` }),
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
    apiV1CategoryCategoryIdDeleteCategory: build.mutation<
      ApiV1CategoryCategoryIdDeleteCategoryApiResponse,
      ApiV1CategoryCategoryIdDeleteCategoryApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/category/${queryArg.categoryId}`,
        method: "DELETE",
      }),
    }),
    apiV1CategoryCategoryIdUpateCategory: build.mutation<
      ApiV1CategoryCategoryIdUpateCategoryApiResponse,
      ApiV1CategoryCategoryIdUpateCategoryApiArg
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
      query: () => ({ url: `/api/v1/expense` }),
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
export type ApiV1CategoryGetCategoriesApiArg = void;
export type ApiV1CategoryCreateCategoryApiResponse = unknown;
export type ApiV1CategoryCreateCategoryApiArg = {
  categoryCreate: CategoryCreate;
};
export type ApiV1CategoryCategoryIdDeleteCategoryApiResponse = unknown;
export type ApiV1CategoryCategoryIdDeleteCategoryApiArg = {
  categoryId: string;
};
export type ApiV1CategoryCategoryIdUpateCategoryApiResponse = unknown;
export type ApiV1CategoryCategoryIdUpateCategoryApiArg = {
  categoryId: string;
  categoryCreate: CategoryCreate;
};
export type ApiV1ExpenseGetExpensesApiResponse =
  /** status 200 Request fulfilled, document follows */ Expense[];
export type ApiV1ExpenseGetExpensesApiArg = void;
export type ApiV1ExpenseCreateExpenseApiResponse = unknown;
export type ApiV1ExpenseCreateExpenseApiArg = {
  expenseCreate: ExpenseCreate;
};
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
  date: string;
  description?: null | string;
  title: string;
};
export type UserCreate = {
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
};
export const {
  useApiV1RootQuery,
  useLazyApiV1RootQuery,
  useApiV1CategoryGetCategoriesQuery,
  useLazyApiV1CategoryGetCategoriesQuery,
  useApiV1CategoryCreateCategoryMutation,
  useApiV1CategoryCategoryIdDeleteCategoryMutation,
  useApiV1CategoryCategoryIdUpateCategoryMutation,
  useApiV1ExpenseGetExpensesQuery,
  useLazyApiV1ExpenseGetExpensesQuery,
  useApiV1ExpenseCreateExpenseMutation,
  useApiV1UserRegisterCreateUserMutation,
} = injectedRtkApi;
