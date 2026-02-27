import {
	ArrowRight,
	CheckCircle2,
	FileBarChart,
	Home,
	PiggyBank,
	Receipt,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { RoutesEnum } from "@/routes/Routes";

const features = [
	{
		icon: Home,
		title: "One Household, One Source of Truth",
		description:
			"Create your family household, invite everyone, and keep all shared spending in a single place.",
	},
	{
		icon: Receipt,
		title: "Log & Split Expenses Fairly",
		description:
			"Groceries, rent, utilities, subscriptions — log any expense and split it evenly or by custom amounts.",
	},
	{
		icon: PiggyBank,
		title: "Set Budgets That Stick",
		description:
			"Create monthly budget categories so your household knows exactly where the money goes.",
	},
	{
		icon: FileBarChart,
		title: "Monthly Settlement Reports",
		description:
			"At month's end, see who owes whom. Mark transfers as paid and keep everyone accountable.",
	},
];

const benefits = [
	"No more awkward money conversations",
	"See every expense in real time",
	"Fair splits — down to the cent",
	"Monthly reports settle it all",
];

export const LandingPage = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
				<img
					src="/dimewise-wave.png"
					alt="Dimewise mascot waving"
					className="mb-6 h-32 w-32 drop-shadow-lg md:h-40 md:w-40"
				/>
				<h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
					Family finances,
					<br />
					<span className="text-brand">finally simple.</span>
				</h1>
				<p className="mt-5 max-w-lg text-lg text-muted-foreground">
					Dimewise helps families manage shared household expenses without the
					spreadsheets, guesswork, or awkward conversations. Track spending, set
					budgets, and settle up — together.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button
						size="lg"
						onClick={() => navigate(RoutesEnum.register)}
						className="gap-2"
					>
						Start Your Household
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

			{/* Trust bar */}
			<section className="border-t border-border bg-muted/40 px-4 py-10">
				<div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
					{benefits.map((text) => (
						<div key={text} className="flex items-center gap-2.5">
							<CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
							<span className="text-sm font-medium text-foreground">
								{text}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border px-4 py-16 md:py-20">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-2xl font-bold tracking-tight md:text-3xl">
						Built for real households
					</h2>
					<p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
						Whether you're a couple sharing rent, parents managing the family
						budget, or housemates splitting groceries — Dimewise keeps it
						transparent and fair.
					</p>
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

			{/* How it works */}
			<section className="border-t border-border bg-muted/50 px-4 py-16 md:py-20">
				<div className="mx-auto max-w-3xl">
					<h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
						How it works
					</h2>
					<div className="grid gap-8 sm:grid-cols-3">
						{[
							{
								step: "1",
								title: "Create your household",
								description:
									"Sign up, name your household, and invite family members with a simple code.",
							},
							{
								step: "2",
								title: "Log expenses as they happen",
								description:
									"Anyone in the household can add an expense. Dimewise splits it automatically.",
							},
							{
								step: "3",
								title: "Settle up each month",
								description:
									"Review the monthly report, see who owes whom, and mark transfers as paid.",
							},
						].map((item) => (
							<div key={item.step} className="text-center">
								<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
									{item.step}
								</div>
								<h3 className="text-sm font-semibold">{item.title}</h3>
								<p className="mt-1.5 text-sm text-muted-foreground">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border px-4 py-16 md:py-20">
				<div className="mx-auto flex max-w-xl flex-col items-center text-center">
					<img
						src="/dimewise-celebrate.png"
						alt="Dimewise mascot celebrating"
						className="mb-4 h-28 w-28 object-contain"
					/>
					<h2 className="text-2xl font-bold tracking-tight md:text-3xl">
						Take the guesswork out of family finances
					</h2>
					<p className="mt-3 text-muted-foreground">
						Free to use. Set up your household in under a minute.
					</p>
					<Button
						size="lg"
						className="mt-8 gap-2"
						onClick={() => navigate(RoutesEnum.register)}
					>
						Get Started — It's Free
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border px-4 py-8">
				<div className="mx-auto max-w-5xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} Dimewise. Built with love for
						families who share more than just a roof.
					</p>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<a
							href={RoutesEnum.privacy}
							className="hover:text-foreground transition-colors"
						>
							Privacy Policy
						</a>
						<span className="text-border">&middot;</span>
						<a
							href={RoutesEnum.terms}
							className="hover:text-foreground transition-colors"
						>
							Terms of Service
						</a>
						<span className="text-border">&middot;</span>
						<a
							href="mailto:support@dimewise.app"
							className="hover:text-foreground transition-colors"
						>
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
};
