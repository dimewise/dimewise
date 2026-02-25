import {
	ArrowRight,
	FileBarChart,
	PiggyBank,
	Receipt,
	Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { RoutesEnum } from "@/routes/Routes";

const features = [
	{
		icon: Users,
		title: "Household Budgets",
		description: "Create a shared household and track spending together.",
	},
	{
		icon: Receipt,
		title: "Split Expenses",
		description: "Log expenses and split them fairly among household members.",
	},
	{
		icon: PiggyBank,
		title: "Budget Categories",
		description: "Set monthly budgets by category and monitor your spending.",
	},
	{
		icon: FileBarChart,
		title: "Monthly Reports",
		description: "Get itemized breakdowns of spending and see who owes whom.",
	},
];

export const LandingPage = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand text-white shadow-lg">
					<PiggyBank className="h-8 w-8" />
				</div>
				<h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
					Split expenses,
					<br />
					<span className="text-brand">not friendships.</span>
				</h1>
				<p className="mt-5 max-w-lg text-lg text-muted-foreground">
					Dimewise makes household budgeting simple. Track shared expenses,
					split costs fairly, and settle up each month — all in one place.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button
						size="lg"
						onClick={() => navigate(RoutesEnum.register)}
						className="gap-2"
					>
						Get Started
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={() => navigate(RoutesEnum.login)}
					>
						Sign In
					</Button>
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border bg-muted/50 px-4 py-16 md:py-20">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
						Everything you need to manage shared finances
					</h2>
					<div className="grid gap-6 sm:grid-cols-2">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
							>
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
									<feature.icon className="h-5 w-5" />
								</div>
								<h3 className="text-base font-semibold">{feature.title}</h3>
								<p className="mt-1.5 text-sm text-muted-foreground">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border px-4 py-8">
				<p className="text-center text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} Dimewise. Built with love for shared
					living.
				</p>
			</footer>
		</div>
	);
};
