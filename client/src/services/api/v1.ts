import { baseApiV1 as api } from "./client";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    rootGet: build.query<RootGetApiResponse, RootGetApiArg>({
      query: () => ({ url: `/` }),
    }),
    signupSignupPost: build.mutation<
      SignupSignupPostApiResponse,
      SignupSignupPostApiArg
    >({
      query: (queryArg) => ({
        url: `/signup`,
        method: "POST",
        body: queryArg.signInUpRequest,
      }),
    }),
    signinSigninPost: build.mutation<
      SigninSigninPostApiResponse,
      SigninSigninPostApiArg
    >({
      query: (queryArg) => ({
        url: `/signin`,
        method: "POST",
        body: queryArg.signInUpRequest,
      }),
    }),
    verifyVerifyPost: build.mutation<
      VerifyVerifyPostApiResponse,
      VerifyVerifyPostApiArg
    >({
      query: (queryArg) => ({
        url: `/verify`,
        method: "POST",
        body: queryArg.verifyRequest,
      }),
    }),
    getCategoriesCategoriesGet: build.query<
      GetCategoriesCategoriesGetApiResponse,
      GetCategoriesCategoriesGetApiArg
    >({
      query: () => ({ url: `/categories` }),
    }),
    getRecentExpensesExpensesRecentGet: build.query<
      GetRecentExpensesExpensesRecentGetApiResponse,
      GetRecentExpensesExpensesRecentGetApiArg
    >({
      query: () => ({ url: `/expenses/recent` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as apiV1 };
export type RootGetApiResponse = /** status 200 Successful Response */ any;
export type RootGetApiArg = void;
export type SignupSignupPostApiResponse =
  /** status 201 Successful Response */ any;
export type SignupSignupPostApiArg = {
  signInUpRequest: SignInUpRequest;
};
export type SigninSigninPostApiResponse =
  /** status 201 Successful Response */ any;
export type SigninSigninPostApiArg = {
  signInUpRequest: SignInUpRequest;
};
export type VerifyVerifyPostApiResponse =
  /** status 201 Successful Response */ any;
export type VerifyVerifyPostApiArg = {
  verifyRequest: VerifyRequest;
};
export type GetCategoriesCategoriesGetApiResponse =
  /** status 200 Successful Response */ Category[];
export type GetCategoriesCategoriesGetApiArg = void;
export type GetRecentExpensesExpensesRecentGetApiResponse =
  /** status 200 Successful Response */ Expense[];
export type GetRecentExpensesExpensesRecentGetApiArg = void;
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type SignInUpRequest = {
  email: string;
  password: string;
};
export type VerifyRequest = {
  token: string;
};
export type Category = {
  id: string;
  name: string;
  budget: number;
};
export type Expense = {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
};
export const {
  useRootGetQuery,
  useLazyRootGetQuery,
  useSignupSignupPostMutation,
  useSigninSigninPostMutation,
  useVerifyVerifyPostMutation,
  useGetCategoriesCategoriesGetQuery,
  useLazyGetCategoriesCategoriesGetQuery,
  useGetRecentExpensesExpensesRecentGetQuery,
  useLazyGetRecentExpensesExpensesRecentGetQuery,
} = injectedRtkApi;
