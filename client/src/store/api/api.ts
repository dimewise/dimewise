import { api } from "./client";
export const addTagTypes = ["Users", "Households", "Budgets"] as const;
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
				invalidatesTags: ["Budgets"],
			}),
			deleteBudgetCategory: build.mutation<
				DeleteBudgetCategoryApiResponse,
				DeleteBudgetCategoryApiArg
			>({
				query: (queryArg) => ({
					url: `/budgets/${queryArg.budgetId}`,
					method: "DELETE",
				}),
				invalidatesTags: ["Budgets"],
			}),
			getBudgetOverview: build.query<
				GetBudgetOverviewApiResponse,
				GetBudgetOverviewApiArg
			>({
				query: () => ({ url: `/budgets/overview` }),
				providesTags: ["Budgets"],
			}),
		}),
		overrideExisting: false,
	});
export { injectedRtkApi as api };
export type GetUsersMeApiResponse = /** status 200 OK */ User;
export type GetUsersMeApiArg = void;
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
export const {
	useGetUsersMeQuery,
	useLazyGetUsersMeQuery,
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
} = injectedRtkApi;
