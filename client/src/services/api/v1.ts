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
    createCategoryApiV1CategoryPost: build.mutation<
      CreateCategoryApiV1CategoryPostApiResponse,
      CreateCategoryApiV1CategoryPostApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/category`,
        method: "POST",
        body: queryArg.categoryPost,
      }),
    }),
    deleteCategoryApiV1CategoryCategoryIdDelete: build.mutation<
      DeleteCategoryApiV1CategoryCategoryIdDeleteApiResponse,
      DeleteCategoryApiV1CategoryCategoryIdDeleteApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/category/${queryArg.categoryId}`,
        method: "DELETE",
      }),
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
export type CreateCategoryApiV1CategoryPostApiResponse =
  /** status 200 Successful Response */ any;
export type CreateCategoryApiV1CategoryPostApiArg = {
  categoryPost: CategoryPost;
};
export type DeleteCategoryApiV1CategoryCategoryIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteCategoryApiV1CategoryCategoryIdDeleteApiArg = {
  categoryId: string;
};
export type GetRecentExpensesApiV1ExpensesRecentGetApiResponse =
  /** status 200 Successful Response */ Expense[];
export type GetRecentExpensesApiV1ExpensesRecentGetApiArg = void;
export type CategoryFull = {
  name: string;
  budget: number;
  id: string;
  user_id: string;
  spent: number;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type CategoryPost = {
  name: string;
  budget: number;
};
export type Expense = {
  id?: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  user_id: string;
};
export const {
  useRootApiV1GetQuery,
  useLazyRootApiV1GetQuery,
  useGetCategoriesApiV1CategoriesGetQuery,
  useLazyGetCategoriesApiV1CategoriesGetQuery,
  useCreateCategoryApiV1CategoryPostMutation,
  useDeleteCategoryApiV1CategoryCategoryIdDeleteMutation,
  useGetRecentExpensesApiV1ExpensesRecentGetQuery,
  useLazyGetRecentExpensesApiV1ExpensesRecentGetQuery,
} = injectedRtkApi;
