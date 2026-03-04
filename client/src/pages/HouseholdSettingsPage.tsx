import { useUser } from "@clerk/clerk-react";
import {
	AlertTriangle,
	ChevronRight,
	Clipboard,
	Globe,
	LogOut,
	RefreshCw,
	Shield,
	Trash2,
	UserMinus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SkeletonPage } from "@/components/ui/skeleton";
import { RoutesEnum } from "@/routes/Routes";
import type { HouseholdMember } from "@/store/api/api";
import {
	useDeleteHouseholdMutation,
	useGetMyHouseholdQuery,
	useLeaveHouseholdMutation,
	useRegenerateInviteCodeMutation,
	useRemoveHouseholdMemberMutation,
} from "@/store/api/api";

export const HouseholdSettingsPage = () => {
	const { t } = useTranslation();
	const { user } = useUser();
	const navigate = useNavigate();
	const { data: household, isLoading } = useGetMyHouseholdQuery(undefined);

	const [regenerateCode] = useRegenerateInviteCodeMutation();
	const [removeMember] = useRemoveHouseholdMemberMutation();
	const [leaveHousehold] = useLeaveHouseholdMutation();
	const [deleteHousehold] = useDeleteHouseholdMutation();

	const [confirmAction, setConfirmAction] = useState<
		| null
		| { type: "remove"; member: HouseholdMember }
		| { type: "leave" }
		| { type: "delete" }
	>(null);

	if (isLoading) {
		return <SkeletonPage />;
	}

	if (!household) {
		return <Navigate to={RoutesEnum.householdSetup} replace />;
	}

	const isOwner = household.owner_id === user?.id;
	const currency = household.currency;

	const getMemberName = (m: HouseholdMember) => {
		const name = [m.first_name, m.last_name].filter(Boolean).join(" ");
		return name || m.email;
	};

	const getInitials = (m: HouseholdMember) => {
		if (m.first_name && m.last_name) {
			return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase();
		}
		return m.email[0]?.toUpperCase() ?? "?";
	};

	const handleCopyInvite = () => {
		navigator.clipboard.writeText(household.invite_code);
		toast.success(t("householdSettings.copyInviteCode"));
	};

	const handleRegenerateCode = async () => {
		try {
			await regenerateCode(undefined).unwrap();
			toast.success(t("householdSettings.codeRegenerated"));
		} catch {
			toast.error(t("householdSettings.regenerateFailed"));
		}
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;

		try {
			if (confirmAction.type === "remove") {
				await removeMember({
					userId: confirmAction.member.user_id,
				}).unwrap();
				toast.success(
					t("householdSettings.memberRemoved", {
						name: getMemberName(confirmAction.member),
					}),
				);
			} else if (confirmAction.type === "leave") {
				await leaveHousehold(undefined).unwrap();
				toast.success(t("householdSettings.leftHousehold"));
				navigate(RoutesEnum.householdSetup, { replace: true });
			} else if (confirmAction.type === "delete") {
				await deleteHousehold(undefined).unwrap();
				toast.success(t("householdSettings.householdDeleted"));
				navigate(RoutesEnum.householdSetup, { replace: true });
			}
		} catch {
			toast.error(t("householdSettings.actionFailed"));
		} finally {
			setConfirmAction(null);
		}
	};

	const getConfirmDialogContent = () => {
		if (!confirmAction) return { title: "", description: "" };
		switch (confirmAction.type) {
			case "remove":
				return {
					title: t("householdSettings.removeMember"),
					description: t("householdSettings.removeMemberConfirm", {
						name: getMemberName(confirmAction.member),
					}),
				};
			case "leave":
				return {
					title: t("householdSettings.leaveHousehold"),
					description: t("householdSettings.leaveConfirm"),
				};
			case "delete":
				return {
					title: t("householdSettings.deleteHousehold"),
					description: t("householdSettings.deleteConfirm"),
				};
		}
	};

	return (
		<div className="space-y-5">
			<h1 className="text-2xl font-bold tracking-tight">
				{t("householdSettings.title")}
			</h1>

			{/* Household Info */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						{t("householdSettings.household")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground text-xs">
								{t("householdSettings.name")}
							</p>
							<p className="font-medium">{household.name}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">
								{t("householdSettings.currency")}
							</p>
							<p className="font-medium">{currency}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Invite Code */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						{t("householdSettings.inviteCode")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-2">
						<code className="flex-1 rounded-lg bg-muted px-3 py-2.5 text-sm font-mono tracking-widest text-center select-all">
							{household.invite_code}
						</code>
						<Button
							variant="outline"
							size="icon"
							onClick={handleCopyInvite}
							title="Copy to clipboard"
						>
							<Clipboard className="h-4 w-4" />
						</Button>
					</div>
					{isOwner && (
						<Button
							variant="secondary"
							size="sm"
							className="gap-1.5"
							onClick={handleRegenerateCode}
						>
							<RefreshCw className="h-3.5 w-3.5" />
							{t("householdSettings.regenerateCode")}
						</Button>
					)}
					<p className="text-xs text-muted-foreground">
						{t("householdSettings.shareCodeHelp")}
					</p>
				</CardContent>
			</Card>

			{/* Members */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Users className="h-4 w-4" />
						{t("householdSettings.members")} ({household.members.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						{household.members.map((member) => {
							const isSelf = member.user_id === user?.id;
							const isMemberOwner = member.user_id === household.owner_id;
							return (
								<div
									key={member.id}
									className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
								>
									<Avatar className="h-9 w-9">
										{member.avatar_url && (
											<AvatarImage src={member.avatar_url} />
										)}
										<AvatarFallback className="text-xs">
											{getInitials(member)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium truncate">
												{getMemberName(member)}
												{isSelf && (
													<span className="text-muted-foreground ml-1">
														{t("householdSettings.you")}
													</span>
												)}
											</p>
											{isMemberOwner && (
												<Badge variant="default" className="text-[10px] gap-1">
													<Shield className="h-2.5 w-2.5" />
													{t("householdSettings.owner")}
												</Badge>
											)}
										</div>
										<p className="text-xs text-muted-foreground truncate">
											{member.email}
										</p>
									</div>
									{isOwner && !isSelf && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-danger hover:text-danger shrink-0"
											onClick={() =>
												setConfirmAction({
													type: "remove",
													member,
												})
											}
										>
											<UserMinus className="h-4 w-4" />
										</Button>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Account Settings link */}
			<Card
				className="cursor-pointer transition-colors hover:bg-muted/50"
				onClick={() => navigate(RoutesEnum.accountSettings)}
			>
				<CardContent className="flex items-center justify-between p-4">
					<div className="flex items-center gap-3">
						<Globe className="h-4 w-4 text-muted-foreground" />
						<div>
							<p className="text-sm font-medium">
								{t("accountSettings.title")}
							</p>
							<p className="text-xs text-muted-foreground">
								{t("accountSettings.languageDescription")}
							</p>
						</div>
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground" />
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-danger/30">
				<CardHeader>
					<CardTitle className="text-base text-danger flex items-center gap-2">
						<AlertTriangle className="h-4 w-4" />
						{t("householdSettings.dangerZone")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{!isOwner && (
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">
									{t("householdSettings.leaveHousehold")}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("householdSettings.leaveDescription")}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger"
								onClick={() => setConfirmAction({ type: "leave" })}
							>
								<LogOut className="h-3.5 w-3.5" />
								{t("householdSettings.leave")}
							</Button>
						</div>
					)}
					{isOwner && (
						<>
							{!isOwner ? null : <Separator />}
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">
										{t("householdSettings.deleteHousehold")}
									</p>
									<p className="text-xs text-muted-foreground">
										{t("householdSettings.deleteDescription")}
									</p>
								</div>
								<Button
									variant="danger"
									size="sm"
									className="gap-1.5"
									onClick={() => setConfirmAction({ type: "delete" })}
								>
									<Trash2 className="h-3.5 w-3.5" />
									{t("common.delete")}
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Confirmation dialog */}
			<Dialog
				open={!!confirmAction}
				onOpenChange={(v) => !v && setConfirmAction(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{getConfirmDialogContent().title}</DialogTitle>
						<DialogDescription>
							{getConfirmDialogContent().description}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmAction(null)}>
							{t("common.cancel")}
						</Button>
						<Button variant="danger" onClick={handleConfirmAction}>
							{confirmAction?.type === "delete"
								? t("common.delete")
								: confirmAction?.type === "leave"
									? t("householdSettings.leave")
									: t("householdSettings.remove")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
