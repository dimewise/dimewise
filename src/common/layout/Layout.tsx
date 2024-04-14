import { type ReactElement, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export const Layout = (): ReactElement => {
	return (
		<>
			<Header />
			<main>
				<Suspense fallback={<div>loading...</div>}>
					<Outlet />
				</Suspense>
			</main>
			<Footer />
		</>
	);
};
