import { ArrowLeft, KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RoutesEnum } from "@/routes/Routes";
import {
	useCreateHouseholdMutation,
	useJoinHouseholdMutation,
} from "@/store/api/api";

const currencyOptions = [
	"USD",
	"EUR",
	"GBP",
	"CAD",
	"AUD",
	"SGD",
	"HKD",
	"NZD",
	"CHF",
	"JPY",
	"KRW",
];

type Mode = "choose" | "create" | "join";

export const HouseholdSetupPage = () => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<Mode>("choose");
	const navigate = useNavigate();
	const [createHousehold, { isLoading: isCreating }] =
		useCreateHouseholdMutation();
	const [joinHousehold, { isLoading: isJoining }] = useJoinHouseholdMutation();

	const [name, setName] = useState("");
	const [currency, setCurrency] = useState("");
	const [inviteCode, setInviteCode] = useState("");

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !currency) return;
		try {
			await createHousehold({
				createHouseholdRequest: {
					name: name.trim(),
					currency: currency as "USD",
				},
			}).unwrap();
			toast.success(t("householdSetup.householdCreated"));
			navigate(RoutesEnum.dashboard);
		} catch {
			toast.error(t("householdSetup.createFailed"));
		}
	};

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteCode.trim()) return;
		try {
			await joinHousehold({
				joinHouseholdRequest: { invite_code: inviteCode.trim() },
			}).unwrap();
			toast.success(t("householdSetup.householdJoined"));
			navigate(RoutesEnum.dashboard);
		} catch {
			toast.error(t("householdSetup.joinFailed"));
		}
	};

	if (mode === "choose") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-md animate-fade-in">
					<CardHeader className="items-center text-center pb-2">
						<img
							src="/dimewise-household-setup.png"
							alt="Set up your household"
							className="mb-2 h-28 w-28 object-contain"
						/>
						<CardTitle className="text-xl">
							{t("householdSetup.welcome")}
						</CardTitle>
						<CardDescription>{t("householdSetup.description")}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Button
							size="lg"
							className="w-full gap-2"
							onClick={() => setMode("create")}
						>
							<Plus className="h-4 w-4" />
							{t("householdSetup.createHousehold")}
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="w-full gap-2"
							onClick={() => setMode("join")}
						>
							<KeyRound className="h-4 w-4" />
							{t("householdSetup.joinWithCode")}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (mode === "create") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-md animate-slide-up">
					<CardHeader>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setMode("choose")}
								className="rounded-lg p-1.5 hover:bg-muted transition-colors"
							>
								<ArrowLeft className="h-4 w-4" />
							</button>
							<CardTitle>{t("householdSetup.createHousehold")}</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCreate} className="flex flex-col gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">
									{t("householdSetup.householdName")}
								</Label>
								<Input
									id="name"
									placeholder={t("householdSetup.householdNamePlaceholder")}
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									maxLength={100}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t("householdSetup.currency")}</Label>
								<Select value={currency} onValueChange={setCurrency}>
									<SelectTrigger>
										<SelectValue
											placeholder={t("householdSetup.selectCurrency")}
										/>
									</SelectTrigger>
									<SelectContent>
										{currencyOptions.map((code) => (
											<SelectItem key={code} value={code}>
												{t(`currencies.${code}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button
								type="submit"
								size="lg"
								className="w-full mt-2"
								disabled={isCreating || !name.trim() || !currency}
							>
								{isCreating ? t("householdSetup.creating") : t("common.create")}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-md animate-slide-up">
				<CardHeader>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setMode("choose")}
							className="rounded-lg p-1.5 hover:bg-muted transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
						</button>
						<CardTitle>{t("householdSetup.joinHousehold")}</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleJoin} className="flex flex-col gap-4">
						<div className="space-y-2">
							<Label htmlFor="invite-code">
								{t("householdSetup.inviteCode")}
							</Label>
							<Input
								id="invite-code"
								placeholder={t("householdSetup.inviteCodePlaceholder")}
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value)}
								required
								className="font-mono tracking-wider text-center text-lg"
							/>
							<p className="text-xs text-muted-foreground">
								{t("householdSetup.inviteCodeHelp")}
							</p>
						</div>
						<Button
							type="submit"
							size="lg"
							className="w-full mt-2"
							disabled={isJoining || !inviteCode.trim()}
						>
							{isJoining
								? t("householdSetup.joining")
								: t("householdSetup.join")}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
