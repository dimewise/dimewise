import { Link } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const PrivacyPolicyPage = () => {
	return (
		<div className="mx-auto max-w-3xl px-4 py-12 md:py-16 animate-fade-in">
			<h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
			<p className="text-sm text-muted-foreground mb-8">
				Last updated:{" "}
				{new Date().toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})}
			</p>

			<div className="prose prose-sm max-w-none space-y-6 text-foreground">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold">1. Introduction</h2>
					<p className="text-muted-foreground leading-relaxed">
						Dimewise ("we", "our", or "us") is committed to protecting your
						privacy. This Privacy Policy explains how we collect, use, and
						safeguard your information when you use our household expense
						tracking application.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">2. Information We Collect</h2>
					<p className="text-muted-foreground leading-relaxed">
						We collect the following types of information:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>
							<strong className="text-foreground">Account information:</strong>{" "}
							Your name, email address, and profile picture when you create an
							account.
						</li>
						<li>
							<strong className="text-foreground">Household data:</strong>{" "}
							Household names, member information, and invite codes.
						</li>
						<li>
							<strong className="text-foreground">Financial data:</strong>{" "}
							Expense descriptions, amounts, categories, budget limits, and
							settlement reports you create within the app.
						</li>
						<li>
							<strong className="text-foreground">Usage data:</strong>{" "}
							Information about how you interact with the app, including device
							type, browser, and general usage patterns.
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">
						3. How We Use Your Information
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We use your information to:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>Provide and maintain the Dimewise service</li>
						<li>
							Enable household expense tracking, budgeting, and settlement
							reports
						</li>
						<li>Authenticate your identity and secure your account</li>
						<li>Send important service-related communications</li>
						<li>Improve and optimize our application</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">4. Data Sharing</h2>
					<p className="text-muted-foreground leading-relaxed">
						We do not sell your personal information. Your financial data is
						only shared with members of your household within the app. We may
						share data with:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>
							<strong className="text-foreground">Service providers:</strong>{" "}
							Third-party services that help us operate the app (e.g.,
							authentication, hosting).
						</li>
						<li>
							<strong className="text-foreground">Legal requirements:</strong>{" "}
							When required by law or to protect our rights.
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">5. Data Security</h2>
					<p className="text-muted-foreground leading-relaxed">
						We implement industry-standard security measures to protect your
						data, including encryption in transit and at rest. However, no
						method of transmission over the internet is 100% secure.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">6. Data Retention</h2>
					<p className="text-muted-foreground leading-relaxed">
						We retain your data for as long as your account is active or as
						needed to provide the service. You may request deletion of your
						account and associated data at any time by contacting us.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">7. Your Rights</h2>
					<p className="text-muted-foreground leading-relaxed">
						Depending on your jurisdiction, you may have the right to:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>Access the personal data we hold about you</li>
						<li>Request correction of inaccurate data</li>
						<li>Request deletion of your data</li>
						<li>Export your data in a portable format</li>
						<li>Withdraw consent where processing is based on consent</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">8. Cookies</h2>
					<p className="text-muted-foreground leading-relaxed">
						Dimewise uses essential cookies and local storage for authentication
						and app functionality. We do not use third-party tracking cookies or
						advertising cookies.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
					<p className="text-muted-foreground leading-relaxed">
						We may update this Privacy Policy from time to time. We will notify
						you of significant changes by posting a notice within the app or
						sending an email.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">10. Contact Us</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you have any questions about this Privacy Policy, please contact
						us at{" "}
						<a
							href="mailto:support@dimewise.app"
							className="text-brand hover:underline"
						>
							support@dimewise.app
						</a>
						.
					</p>
				</section>
			</div>

			<div className="mt-10 pt-6 border-t border-border">
				<Link
					to={RoutesEnum.root}
					className="text-sm text-brand hover:underline"
				>
					&larr; Back to home
				</Link>
			</div>
		</div>
	);
};
