import { Routes } from "../app/Routes";

const authRoutes: Routes[] = [Routes.Login];
const publicRoutes: Routes[] = [Routes.Root];
const privateRoutes: Routes[] = [Routes.Dashboard];

export const isAuthRoute = (route: string): boolean => {
	return authRoutes.includes(route as Routes);
};
export const isPublicRoute = (route: string): boolean => {
	return publicRoutes.includes(route as Routes);
};

export const isPrivateRoute = (route: string): boolean => {
	return privateRoutes.includes(route as Routes);
};
