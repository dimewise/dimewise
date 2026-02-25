import { Copy, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { HouseholdWithMembers } from "@/store/api/api";
import { useGetUsersMeQuery } from "@/store/api/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

type Props = {
	household: HouseholdWithMembers;
};

export const HouseholdDashboard = ({ household }: Props) => {
	const { data: currentUser } = useGetUsersMeQuery();
	const isOwner = currentUser?.id === household.owner_id;

	const copyInviteCode = () => {
		navigator.clipboard.writeText(household.invite_code);
		toast.success("Invite code copied!");
	};

	const getInitials = (
		firstName?: string,
		lastName?: string,
		email?: string,
	) => {
		if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
		if (firstName) return firstName[0];
		if (email) return email[0]?.toUpperCase();
		return "?";
	};

	return (
		<div className="space-y-4">
			{/* Household info cards */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
				<Card>
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground mb-1">Currency</p>
						<p className="text-2xl font-bold">{household.currency}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs text-muted-foreground mb-1">Members</p>
						<p className="text-2xl font-bold">{household.members.length}</p>
					</CardContent>
				</Card>
				{isOwner && (
					<Card className="col-span-2 md:col-span-1">
						<CardContent className="p-4">
							<p className="text-xs text-muted-foreground mb-1">Invite Code</p>
							<button
								type="button"
								onClick={copyInviteCode}
								className="flex items-center gap-2 group"
							>
								<span className="text-lg font-bold font-mono tracking-wider">
									{household.invite_code}
								</span>
								<Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand transition-colors" />
							</button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Members */}
			<Card>
				<CardContent>
					<div className="flex items-center gap-2 mb-4">
						<Users className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-semibold text-sm">Members</h3>
					</div>
					<div className="space-y-3">
						{household.members.map((member) => {
							const isMemberOwner = member.user_id === household.owner_id;
							const displayName = [member.first_name, member.last_name]
								.filter(Boolean)
								.join(" ");

							return (
								<div
									key={member.id}
									className={cn(
										"flex items-center gap-3 rounded-lg p-2 -mx-2",
										"hover:bg-muted transition-colors",
									)}
								>
									<Avatar className="h-9 w-9">
										{member.avatar_url && (
											<AvatarImage src={member.avatar_url} />
										)}
										<AvatarFallback className="text-xs">
											{getInitials(
												member.first_name,
												member.last_name,
												member.email,
											)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium truncate">
												{displayName || member.email}
											</p>
											{isMemberOwner && (
												<Badge variant="warning" className="shrink-0">
													<Crown className="h-3 w-3" />
													Owner
												</Badge>
											)}
										</div>
										{displayName && (
											<p className="text-xs text-muted-foreground truncate">
												{member.email}
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
