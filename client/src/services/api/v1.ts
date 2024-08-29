import { baseApiV1 as api } from "./client";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    rootApiV1Get: build.query<RootApiV1GetApiResponse, RootApiV1GetApiArg>({
      query: () => ({ url: `/api/v1/` }),
    }),
    getCategoriesApiV1CategoriesGet: build.query<
      GetCategoriesApiV1CategoriesGetApiResponse,
      GetCategoriesApiV1CategoriesGetApiArg
    >({
      query: () => ({ url: `/api/v1/categories` }),
    }),
    getRecentExpensesApiV1ExpensesRecentGet: build.query<
      GetRecentExpensesApiV1ExpensesRecentGetApiResponse,
      GetRecentExpensesApiV1ExpensesRecentGetApiArg
    >({
      query: () => ({ url: `/api/v1/expenses/recent` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as apiV1 };
export type RootApiV1GetApiResponse = /** status 200 Successful Response */ any;
export type RootApiV1GetApiArg = void;
export type GetCategoriesApiV1CategoriesGetApiResponse =
  /** status 200 Successful Response */ CategoryFull[];
export type GetCategoriesApiV1CategoriesGetApiArg = void;
export type GetRecentExpensesApiV1ExpensesRecentGetApiResponse =
  /** status 200 Successful Response */ Expense[];
export type GetRecentExpensesApiV1ExpensesRecentGetApiArg = void;
export type CategoryFull = {
  uuid?: string;
  name: string;
  budget: number;
  userId: string;
  spent: number;
};
export type Expense = {
  uuid?: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  userId: string;
};
export const {
  useRootApiV1GetQuery,
  useLazyRootApiV1GetQuery,
  useGetCategoriesApiV1CategoriesGetQuery,
  useLazyGetCategoriesApiV1CategoriesGetQuery,
  useGetRecentExpensesApiV1ExpensesRecentGetQuery,
  useLazyGetRecentExpensesApiV1ExpensesRecentGetQuery,
} = injectedRtkApi;
