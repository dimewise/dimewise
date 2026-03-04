import { Link } from "react-router";
import { RoutesEnum } from "@/routes/Routes";

export const TermsOfServicePage = () => {
	return (
		<div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
			<h1 className="text-3xl font-bold tracking-tight mb-2">
				Terms of Service
			</h1>
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
					<h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
					<p className="text-muted-foreground leading-relaxed">
						By accessing or using Dimewise ("the Service"), you agree to be
						bound by these Terms of Service. If you do not agree to these terms,
						please do not use the Service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">2. Description of Service</h2>
					<p className="text-muted-foreground leading-relaxed">
						Dimewise is a household expense tracking application that allows
						families and housemates to log shared expenses, set budgets, and
						generate monthly settlement reports. The Service is provided free of
						charge.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">3. User Accounts</h2>
					<p className="text-muted-foreground leading-relaxed">
						To use Dimewise, you must create an account. You are responsible
						for:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>Providing accurate and complete registration information</li>
						<li>Maintaining the security of your account credentials</li>
						<li>All activities that occur under your account</li>
						<li>
							Notifying us immediately of any unauthorized use of your account
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">4. Households</h2>
					<p className="text-muted-foreground leading-relaxed">
						Each user may belong to one household at a time. Household owners
						are responsible for managing membership and invite codes. All
						members of a household can view expenses, budgets, and reports
						created within that household.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">5. Acceptable Use</h2>
					<p className="text-muted-foreground leading-relaxed">
						You agree not to:
					</p>
					<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
						<li>Use the Service for any illegal purpose</li>
						<li>
							Attempt to gain unauthorized access to the Service or other users'
							accounts
						</li>
						<li>Interfere with or disrupt the Service or its infrastructure</li>
						<li>
							Upload malicious content or attempt to exploit vulnerabilities
						</li>
						<li>Use the Service to harass, abuse, or harm other users</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">6. Financial Data</h2>
					<p className="text-muted-foreground leading-relaxed">
						Dimewise is an expense tracking tool only. It does not connect to
						bank accounts, process payments, or transfer money between users.
						Any financial settlements suggested by the app are informational and
						must be carried out independently by users. We are not a financial
						institution and do not provide financial advice.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">7. Intellectual Property</h2>
					<p className="text-muted-foreground leading-relaxed">
						The Dimewise name, logo, mascot, and all associated branding are the
						property of Dimewise. You may not use our branding without prior
						written consent. Content you create within the app (expenses,
						budgets, reports) remains yours.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
					<p className="text-muted-foreground leading-relaxed">
						Dimewise is provided "as is" without warranties of any kind, express
						or implied. We shall not be liable for any indirect, incidental,
						special, or consequential damages arising from use of the Service.
						Our total liability shall not exceed the amount you paid for the
						Service (which is zero, as the Service is free).
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">9. Service Availability</h2>
					<p className="text-muted-foreground leading-relaxed">
						We strive to keep Dimewise available at all times, but we do not
						guarantee uninterrupted access. We may modify, suspend, or
						discontinue the Service at any time with reasonable notice where
						possible.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">10. Termination</h2>
					<p className="text-muted-foreground leading-relaxed">
						We reserve the right to suspend or terminate your account if you
						violate these Terms of Service. You may delete your account at any
						time by contacting us. Upon termination, your data will be deleted
						in accordance with our Privacy Policy.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">11. Changes to These Terms</h2>
					<p className="text-muted-foreground leading-relaxed">
						We may update these Terms of Service from time to time. Continued
						use of the Service after changes constitutes acceptance of the new
						terms. We will notify you of significant changes by posting a notice
						within the app.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold">12. Contact Us</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you have any questions about these Terms of Service, please
						contact us at{" "}
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
