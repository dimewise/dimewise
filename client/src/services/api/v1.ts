import { baseApiV1 as api } from "./client";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<GetCategoriesApiResponse, GetCategoriesApiArg>({
      query: () => ({ url: `/categories` }),
    }),
    postCategories: build.mutation<PostCategoriesApiResponse, PostCategoriesApiArg>({
      query: (queryArg) => ({
        url: `/categories`,
        method: "POST",
        body: queryArg.modifyCategoryDto,
      }),
    }),
    getCategoriesByCategoryId: build.query<GetCategoriesByCategoryIdApiResponse, GetCategoriesByCategoryIdApiArg>({
      query: (queryArg) => ({ url: `/categories/${queryArg.categoryId}` }),
    }),
    patchCategoriesByCategoryId: build.mutation<
      PatchCategoriesByCategoryIdApiResponse,
      PatchCategoriesByCategoryIdApiArg
    >({
      query: (queryArg) => ({
        url: `/categories/${queryArg.categoryId}`,
        method: "PATCH",
        body: queryArg.modifyCategoryDto,
      }),
    }),
    deleteCategoriesByCategoryId: build.mutation<
      DeleteCategoriesByCategoryIdApiResponse,
      DeleteCategoriesByCategoryIdApiArg
    >({
      query: (queryArg) => ({
        url: `/categories/${queryArg.categoryId}`,
        method: "DELETE",
      }),
    }),
    getExpenses: build.query<GetExpensesApiResponse, GetExpensesApiArg>({
      query: (queryArg) => ({
        url: `/expenses`,
        params: {
          type: queryArg["type"],
          start: queryArg.start,
          end: queryArg.end,
        },
      }),
    }),
    postExpenses: build.mutation<PostExpensesApiResponse, PostExpensesApiArg>({
      query: (queryArg) => ({
        url: `/expenses`,
        method: "POST",
        body: queryArg.modifyExpenseDto,
      }),
    }),
    getExpensesByExpenseId: build.query<GetExpensesByExpenseIdApiResponse, GetExpensesByExpenseIdApiArg>({
      query: (queryArg) => ({ url: `/expenses/${queryArg.expenseId}` }),
    }),
    patchExpensesByExpenseId: build.mutation<PatchExpensesByExpenseIdApiResponse, PatchExpensesByExpenseIdApiArg>({
      query: (queryArg) => ({
        url: `/expenses/${queryArg.expenseId}`,
        method: "PATCH",
        body: queryArg.modifyCategoryDto,
      }),
    }),
    deleteExpensesByExpenseId: build.mutation<DeleteExpensesByExpenseIdApiResponse, DeleteExpensesByExpenseIdApiArg>({
      query: (queryArg) => ({
        url: `/expenses/${queryArg.expenseId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as apiV1 };
export type GetCategoriesApiResponse = /** status 200 OK */ {
  /** An array of categories, null if empty */
  categories?: BaseCategoryDto[];
};
export type GetCategoriesApiArg = void;
export type PostCategoriesApiResponse = unknown;
export type PostCategoriesApiArg = {
  /** Form submission fields */
  modifyCategoryDto: ModifyCategoryDto;
};
export type GetCategoriesByCategoryIdApiResponse = /** status 200 OK */ FullCategoryDto;
export type GetCategoriesByCategoryIdApiArg = {
  /** ID of the category */
  categoryId: string;
};
export type PatchCategoriesByCategoryIdApiResponse = unknown;
export type PatchCategoriesByCategoryIdApiArg = {
  /** ID of the category */
  categoryId: string;
  /** Form submission fields */
  modifyCategoryDto: ModifyCategoryDto;
};
export type DeleteCategoriesByCategoryIdApiResponse = unknown;
export type DeleteCategoriesByCategoryIdApiArg = {
  /** ID of the category */
  categoryId: string;
};
export type GetExpensesApiResponse = /** status 200 OK */ {
  /** List of expenses, null if empty */
  expenses?: FullExpenseDto[];
};
export type GetExpensesApiArg = {
  /** Full for getting entire list, Recent for last 20 transactions */
  type: "full" | "recent";
  /** Start date for querying transactions */
  start?: string;
  /** End date for querying transactions */
  end?: string;
};
export type PostExpensesApiResponse = unknown;
export type PostExpensesApiArg = {
  /** Form submission fields */
  modifyExpenseDto: ModifyExpenseDto;
};
export type GetExpensesByExpenseIdApiResponse = /** status 200 OK */ FullExpenseDto;
export type GetExpensesByExpenseIdApiArg = {
  /** ID of the expense */
  expenseId: string;
};
export type PatchExpensesByExpenseIdApiResponse = unknown;
export type PatchExpensesByExpenseIdApiArg = {
  /** ID of the expense */
  expenseId: string;
  /** Form submission fields */
  modifyCategoryDto: ModifyCategoryDto;
};
export type DeleteExpensesByExpenseIdApiResponse = unknown;
export type DeleteExpensesByExpenseIdApiArg = {
  /** ID of the expense */
  expenseId: string;
};
export type BaseCategoryDto = {
  /** ID of category */
  id: string;
  /** Name of category */
  name: string;
};
export type ModifyCategoryDto = {
  /** Name of the category */
  name: string;
  /** Budget of the category */
  budget: number;
};
export type FullCategoryDto = {
  /** ID of category */
  id: string;
  /** Name of category */
  name: string;
  /** Budget of category */
  budget: number;
  /** Current amount used within category budget */
  current: number;
};
export type FullExpenseDto = {
  id: string;
  title: string;
  description: string;
  amount: number;
  category_id: string;
};
export type ModifyExpenseDto = {
  /** Title of the expense */
  title: string;
  /** Description of the expense */
  description: string;
  /** Amount spent on the expense */
  amount: string;
  /** ID of the category for the expense */
  category_id: string;
};
export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  usePostCategoriesMutation,
  useGetCategoriesByCategoryIdQuery,
  useLazyGetCategoriesByCategoryIdQuery,
  usePatchCategoriesByCategoryIdMutation,
  useDeleteCategoriesByCategoryIdMutation,
  useGetExpensesQuery,
  useLazyGetExpensesQuery,
  usePostExpensesMutation,
  useGetExpensesByExpenseIdQuery,
  useLazyGetExpensesByExpenseIdQuery,
  usePatchExpensesByExpenseIdMutation,
  useDeleteExpensesByExpenseIdMutation,
} = injectedRtkApi;
