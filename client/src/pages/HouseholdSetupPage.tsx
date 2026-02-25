import { ArrowLeft, Home, KeyRound, Plus } from "lucide-react";
import { useState } from "react";
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
	{ value: "USD", label: "USD — US Dollar" },
	{ value: "EUR", label: "EUR — Euro" },
	{ value: "GBP", label: "GBP — British Pound" },
	{ value: "CAD", label: "CAD — Canadian Dollar" },
	{ value: "AUD", label: "AUD — Australian Dollar" },
	{ value: "SGD", label: "SGD — Singapore Dollar" },
	{ value: "HKD", label: "HKD — Hong Kong Dollar" },
	{ value: "NZD", label: "NZD — New Zealand Dollar" },
	{ value: "CHF", label: "CHF — Swiss Franc" },
	{ value: "JPY", label: "JPY — Japanese Yen" },
	{ value: "KRW", label: "KRW — South Korean Won" },
];

type Mode = "choose" | "create" | "join";

export const HouseholdSetupPage = () => {
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
			toast.success("Household created!");
			navigate(RoutesEnum.dashboard);
		} catch {
			toast.error("Failed to create household. Please try again.");
		}
	};

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteCode.trim()) return;
		try {
			await joinHousehold({
				joinHouseholdRequest: { invite_code: inviteCode.trim() },
			}).unwrap();
			toast.success("Joined household!");
			navigate(RoutesEnum.dashboard);
		} catch {
			toast.error("Invalid invite code or you already belong to a household.");
		}
	};

	if (mode === "choose") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-md animate-fade-in">
					<CardHeader className="items-center text-center pb-2">
						<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
							<Home className="h-7 w-7 text-brand" />
						</div>
						<CardTitle className="text-xl">Welcome to Dimewise!</CardTitle>
						<CardDescription>
							Get started by creating a new household or joining an existing one
							with an invite code.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Button
							size="lg"
							className="w-full gap-2"
							onClick={() => setMode("create")}
						>
							<Plus className="h-4 w-4" />
							Create a Household
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="w-full gap-2"
							onClick={() => setMode("join")}
						>
							<KeyRound className="h-4 w-4" />
							Join with Invite Code
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
							<CardTitle>Create a Household</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCreate} className="flex flex-col gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Household Name</Label>
								<Input
									id="name"
									placeholder="e.g. The Smith Family"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									maxLength={100}
								/>
							</div>
							<div className="space-y-2">
								<Label>Currency</Label>
								<Select value={currency} onValueChange={setCurrency}>
									<SelectTrigger>
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										{currencyOptions.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
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
								{isCreating ? "Creating..." : "Create"}
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
						<CardTitle>Join a Household</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleJoin} className="flex flex-col gap-4">
						<div className="space-y-2">
							<Label htmlFor="invite-code">Invite Code</Label>
							<Input
								id="invite-code"
								placeholder="e.g. A1B2C3D4"
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value)}
								required
								className="font-mono tracking-wider text-center text-lg"
							/>
							<p className="text-xs text-muted-foreground">
								Ask your household owner for the invite code.
							</p>
						</div>
						<Button
							type="submit"
							size="lg"
							className="w-full mt-2"
							disabled={isJoining || !inviteCode.trim()}
						>
							{isJoining ? "Joining..." : "Join"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
