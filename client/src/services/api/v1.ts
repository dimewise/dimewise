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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as apiV1 };
export type ApiV1RootApiResponse = unknown;
export type ApiV1RootApiArg = void;
export type ApiV1CategoryGetCategoriesApiResponse =
  /** status 200 Request fulfilled, document follows */ CategoryFull[];
export type ApiV1CategoryGetCategoriesApiArg = void;
export type ApiV1CategoryCreateCategoryApiResponse =
  /** status 201 Document created, URL follows */ void;
export type ApiV1CategoryCreateCategoryApiArg = {
  categoryCreate: CategoryCreate;
};
export type ApiV1CategoryCategoryIdDeleteCategoryApiResponse =
  /** status 204 Request fulfilled, nothing follows */ void;
export type ApiV1CategoryCategoryIdDeleteCategoryApiArg = {
  categoryId: string;
};
export type ApiV1CategoryCategoryIdUpateCategoryApiResponse =
  /** status 200 Request fulfilled, document follows */ void;
export type ApiV1CategoryCategoryIdUpateCategoryApiArg = {
  categoryId: string;
  categoryCreate: CategoryCreate;
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
export const {
  useApiV1RootQuery,
  useLazyApiV1RootQuery,
  useApiV1CategoryGetCategoriesQuery,
  useLazyApiV1CategoryGetCategoriesQuery,
  useApiV1CategoryCreateCategoryMutation,
  useApiV1CategoryCategoryIdDeleteCategoryMutation,
  useApiV1CategoryCategoryIdUpateCategoryMutation,
} = injectedRtkApi;
