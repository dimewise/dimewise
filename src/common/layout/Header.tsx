import type { FC, ReactElement } from "react";
import { Link } from "react-router-dom";

export const Header: FC = (): ReactElement => {
	const closeDrawer = () => {
		document.getElementById("dw-drawer")?.click();
	};

	// TOOD: Change the li element to use a map over the path constant + i18n the menu text
	return (
		<div className="drawer text-sm">
			<input id="dw-drawer" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content flex flex-col">
				{/* Navbar */}
				<div className="w-full navbar">
					<div className="flex-none lg:hidden">
						<label htmlFor="dw-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
							<svg
								role="menu"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="inline-block w-6 h-6 stroke-current"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</label>
					</div>
					<div className="flex-none px-2 mx-2">
						<Link to="/">Dimewise</Link>
					</div>
					<div className="flex-none hidden lg:block">
						<ul className="menu menu-horizontal">
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/about">About</Link>
							</li>
							{/* <li onClick={closeDrawer}>
								<Link to="/privacy-policy">Privacy Policy</Link>
							</li>
							<li onClick={closeDrawer}>
								<Link to="/terms-and-conditions">Terms and Conditions</Link>
							</li> */}
							{/* <li onClick={closeDrawer}>
								<Link to="/auth/login">Login</Link>
							</li>
							<li onClick={closeDrawer} className="bg-primary">
								<Link to="/auth/register">Get Started</Link>
							</li> */}
						</ul>
					</div>
					<div className="flex-1 hidden lg:flex justify-end space-x-8 mr-2">
						<button type="button" className="">
							<Link to="/auth/login">Login</Link>
						</button>
						<button type="button" className="btn btn-primary">
							<Link to="/auth/register">Get Started</Link>
						</button>
					</div>
				</div>
			</div>
			<div className="drawer-side">
				<label htmlFor="dw-drawer" aria-label="close sidebar" className="drawer-overlay" />
				<div className="flex flex-col min-h-full">
					<ul className="menu p-4 w-80 flex-1 bg-base-200">
						<li onClick={closeDrawer}>
							<Link to="/">Home</Link>
						</li>
						<li onClick={closeDrawer}>
							<Link to="/about">About</Link>
						</li>
						<li onClick={closeDrawer}>
							<Link to="/privacy-policy">Privacy Policy</Link>
						</li>
						<li onClick={closeDrawer}>
							<Link to="/terms-and-conditions">Terms and Conditions</Link>
						</li>
						{/* <li onClick={closeDrawer}>
						<Link to="/auth/register">Register</Link>
					</li>
					<li onClick={closeDrawer}>
						<Link to="/auth/login">Login</Link>
					</li> */}
					</ul>
					<div className="flex-none bg-base-200 flex flex-col space-y-3 p-4">
						<button type="button" className="btn btn-block btn-secondary btn-outline" onClick={closeDrawer}>
							<Link to="/auth/login">Login</Link>
						</button>
						<button type="button" className="btn btn-primary btn-block" onClick={closeDrawer}>
							<Link to="/auth/register">Get Started</Link>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
