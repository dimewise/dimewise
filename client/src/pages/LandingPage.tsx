import { useAuth } from "@clerk/clerk-react";
import { motion, useReducedMotion } from "framer-motion";
import {
	ArrowRight,
	CheckCircle2,
	FileBarChart,
	Home,
	PiggyBank,
	Receipt,
	Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { RoutesEnum } from "@/routes/Routes";

const featureKeys = [
	{ icon: Home, key: "household" },
	{ icon: Receipt, key: "expenses" },
	{ icon: PiggyBank, key: "budgets" },
	{ icon: FileBarChart, key: "reports" },
];

const benefitKeys = [
	"noAwkward",
	"realTime",
	"fairSplits",
	"monthlyReports",
	"installable",
	"anyDevice",
];

const VIEWPORT_OPTS = { once: true, amount: 0.3 } as const;

export const LandingPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isSignedIn, isLoaded } = useAuth();
	const shouldReduceMotion = useReducedMotion();

	if (isLoaded && isSignedIn) {
		return <Navigate to={RoutesEnum.dashboard} replace />;
	}

	const noMotion = shouldReduceMotion;

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
				<motion.img
					src="/dimewise-wave.png"
					alt="Dimewise mascot waving"
					className="mb-6 h-32 w-32 drop-shadow-lg md:h-40 md:w-40"
					initial={noMotion ? false : { opacity: 0, scale: 0.8 }}
					animate={
						noMotion
							? undefined
							: {
									opacity: 1,
									scale: 1,
									y: [0, -8, 0],
								}
					}
					transition={
						noMotion
							? undefined
							: {
									opacity: { duration: 0.5, ease: "easeOut" },
									scale: { duration: 0.5, ease: "easeOut" },
									y: {
										repeat: Number.POSITIVE_INFINITY,
										duration: 3,
										ease: "easeInOut",
										delay: 0.5,
									},
								}
					}
				/>
				<motion.h1
					className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl"
					initial={noMotion ? false : { opacity: 0, y: 16 }}
					animate={noMotion ? undefined : { opacity: 1, y: 0 }}
					transition={
						noMotion
							? undefined
							: { duration: 0.5, ease: "easeOut", delay: 0.1 }
					}
				>
					{t("landing.heroTitle1")}
					<br />
					<span className="text-brand">{t("landing.heroTitle2")}</span>
				</motion.h1>
				<motion.p
					className="mt-5 max-w-lg text-lg text-muted-foreground"
					initial={noMotion ? false : { opacity: 0, y: 12 }}
					animate={noMotion ? undefined : { opacity: 1, y: 0 }}
					transition={
						noMotion
							? undefined
							: { duration: 0.4, ease: "easeOut", delay: 0.2 }
					}
				>
					{t("landing.heroDescription")}
				</motion.p>
				<motion.div
					className="mt-8 flex flex-col gap-3 sm:flex-row"
					initial={noMotion ? false : { opacity: 0, y: 12 }}
					animate={noMotion ? undefined : { opacity: 1, y: 0 }}
					transition={
						noMotion
							? undefined
							: { duration: 0.4, ease: "easeOut", delay: 0.35 }
					}
				>
					<Button
						size="lg"
						onClick={() => navigate(RoutesEnum.register)}
						className="gap-2"
					>
						{t("landing.startHousehold")}
						<ArrowRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={() => navigate(RoutesEnum.login)}
					>
						{t("landing.signIn")}
					</Button>
				</motion.div>
			</section>

			{/* Trust bar */}
			<section className="border-t border-border bg-muted/40 px-4 py-10">
				<div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
					{benefitKeys.map((key, i) => (
						<motion.div
							key={key}
							className="flex items-center gap-2.5"
							initial={noMotion ? false : { opacity: 0, y: 8 }}
							whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
							viewport={VIEWPORT_OPTS}
							transition={
								noMotion
									? undefined
									: { duration: 0.3, ease: "easeOut", delay: i * 0.08 }
							}
						>
							<CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
							<span className="text-sm font-medium text-foreground">
								{t(`landing.benefits.${key}`)}
							</span>
						</motion.div>
					))}
				</div>
			</section>

			{/* Features */}
			<section className="border-t border-border px-4 py-16 md:py-20">
				<div className="mx-auto max-w-5xl">
					<motion.h2
						className="mb-4 text-center text-2xl font-bold tracking-tight md:text-3xl"
						initial={noMotion ? false : { opacity: 0, y: 12 }}
						whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={VIEWPORT_OPTS}
						transition={
							noMotion ? undefined : { duration: 0.4, ease: "easeOut" }
						}
					>
						{t("landing.features.title")}
					</motion.h2>
					<motion.p
						className="mx-auto mb-12 max-w-xl text-center text-muted-foreground"
						initial={noMotion ? false : { opacity: 0, y: 8 }}
						whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={VIEWPORT_OPTS}
						transition={
							noMotion
								? undefined
								: { duration: 0.4, ease: "easeOut", delay: 0.1 }
						}
					>
						{t("landing.features.description")}
					</motion.p>
					<div className="grid gap-6 sm:grid-cols-2">
						{featureKeys.map((feature, i) => (
							<motion.div
								key={feature.key}
								className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
								initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
								whileInView={noMotion ? undefined : { opacity: 1, scale: 1 }}
								viewport={VIEWPORT_OPTS}
								transition={
									noMotion
										? undefined
										: { duration: 0.3, ease: "easeOut", delay: i * 0.1 }
								}
							>
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
									<feature.icon className="h-5 w-5" />
								</div>
								<h3 className="text-base font-semibold">
									{t(`landing.features.${feature.key}.title`)}
								</h3>
								<p className="mt-1.5 text-sm text-muted-foreground">
									{t(`landing.features.${feature.key}.description`)}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="border-t border-border bg-muted/50 px-4 py-16 md:py-20">
				<div className="mx-auto max-w-3xl">
					<motion.h2
						className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl"
						initial={noMotion ? false : { opacity: 0, y: 12 }}
						whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={VIEWPORT_OPTS}
						transition={
							noMotion ? undefined : { duration: 0.4, ease: "easeOut" }
						}
					>
						{t("landing.howItWorks.title")}
					</motion.h2>
					<div className="grid gap-8 sm:grid-cols-3">
						{["step1", "step2", "step3"].map((step, index) => (
							<motion.div
								key={step}
								className="text-center"
								initial={noMotion ? false : { opacity: 0, y: 16 }}
								whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
								viewport={VIEWPORT_OPTS}
								transition={
									noMotion
										? undefined
										: {
												duration: 0.4,
												ease: "easeOut",
												delay: index * 0.15,
											}
								}
							>
								<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
									{index + 1}
								</div>
								<h3 className="text-sm font-semibold">
									{t(`landing.howItWorks.${step}.title`)}
								</h3>
								<p className="mt-1.5 text-sm text-muted-foreground">
									{t(`landing.howItWorks.${step}.description`)}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border px-4 py-16 md:py-20">
				<motion.div
					className="mx-auto flex max-w-xl flex-col items-center text-center"
					initial={noMotion ? false : { opacity: 0, y: 16 }}
					whileInView={noMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={VIEWPORT_OPTS}
					transition={noMotion ? undefined : { duration: 0.5, ease: "easeOut" }}
				>
					<motion.img
						src="/dimewise-celebrate.png"
						alt="Dimewise mascot celebrating"
						className="mb-4 h-28 w-28 object-contain"
						animate={noMotion ? undefined : { y: [0, -8, 0] }}
						transition={
							noMotion
								? undefined
								: {
										y: {
											repeat: Number.POSITIVE_INFINITY,
											duration: 3,
											ease: "easeInOut",
										},
									}
						}
					/>
					<h2 className="text-2xl font-bold tracking-tight md:text-3xl">
						{t("landing.cta.title")}
					</h2>
					<p className="mt-3 text-muted-foreground">
						{t("landing.cta.description")}
					</p>
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Smartphone className="h-4 w-4" />
						<span>{t("landing.cta.pwa")}</span>
					</div>
					<Button
						size="lg"
						className="mt-8 gap-2"
						onClick={() => navigate(RoutesEnum.register)}
					>
						{t("landing.cta.button")}
						<ArrowRight className="h-4 w-4" />
					</Button>
				</motion.div>
			</section>

			{/* Footer */}
			<motion.footer
				className="border-t border-border px-4 py-8"
				initial={noMotion ? false : { opacity: 0 }}
				whileInView={noMotion ? undefined : { opacity: 1 }}
				viewport={VIEWPORT_OPTS}
				transition={noMotion ? undefined : { duration: 0.4, ease: "easeOut" }}
			>
				<div className="mx-auto max-w-5xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<p className="text-sm text-muted-foreground">
						{t("landing.footer.copyright", { year: new Date().getFullYear() })}
					</p>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<a
							href={RoutesEnum.privacy}
							className="hover:text-foreground transition-colors"
						>
							{t("landing.footer.privacy")}
						</a>
						<span className="text-border">&middot;</span>
						<a
							href={RoutesEnum.terms}
							className="hover:text-foreground transition-colors"
						>
							{t("landing.footer.terms")}
						</a>
						<span className="text-border">&middot;</span>
						<a
							href="mailto:support@dimewise.app"
							className="hover:text-foreground transition-colors"
						>
							{t("landing.footer.contact")}
						</a>
					</div>
				</div>
			</motion.footer>
		</div>
	);
};
