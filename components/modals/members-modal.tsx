"use client";

import {
	Check,
	Gavel,
	Loader2,
	MoreVertical,
	Shield,
	ShieldAlert,
	ShieldCheck,
	ShieldQuestion,
} from "lucide-react";
import qs from "query-string";
import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/user-avatar";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types/server";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";

const roleIcons = {
	GUEST: null,
	MODERATOR: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
	ADMIN: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
};

const MembersModal = () => {
	const router = useRouter();

	const { isOpen, onClose, type, data, onOpen } = useModal();

	const [loadingId, setLoadingId] = useState("");

	const isModalOpen = isOpen && type === "members";
	const { server } = data as { server: ServerWithMembersWithProfiles };

	const onRoleChange = async (memberId: string, role: MemberRole) => {
		try {
			setLoadingId(memberId);
			const url = qs.stringifyUrl({
				url: `/api/members/${memberId}`,
				query: { serverId: server?.id },
			});

			const res = await axios.patch(url, { role });

			router.refresh();
			onOpen("members", { server: res.data });
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingId("");
		}
	};

	const onKick = async (memberId: string) => {
		try {
			setLoadingId(memberId);
			const url = qs.stringifyUrl({
				url: `/api/members/${memberId}`,
				query: { serverId: server?.id },
			});

			const res = await axios.delete(url);

			router.refresh();
			onOpen("members", { server: res.data });
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingId("");
		}
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className="bg-white text-black overflow-hidden">
				<DialogHeader className="pt-6 px-6">
					<DialogTitle className="text-2xl font-bold text-center">
						Manage Members
					</DialogTitle>
					<DialogDescription className="text-zinc-500 text-center">
						{server?.members?.length} Members
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="mt-8 max-h-[420px] pr-6">
					{server?.members?.map((member) => (
						<div key={member?.id} className="flex items-center gap-x-2 mb-6">
							<UserAvatar
								src={member?.profile.imageUrl}
								isOnline={member?.profile?.isOnline}
							/>
							<div className="flex flex-col gap-y-1">
								<div className="text-xs font-semibold items-center flex gap-x-1">
									{member?.profile.name}
									{roleIcons[member?.role]}
								</div>
								<p className="text-xs text-zinc-500">{member?.profile.email}</p>
							</div>
							{server?.profileId !== member?.profileId &&
								loadingId !== member?.id && (
									<div className="ml-auto">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<MoreVertical className="w-4 h-4 text-zinc-500" />
											</DropdownMenuTrigger>
											<DropdownMenuContent side="left">
												<DropdownMenuSub>
													<DropdownMenuSubTrigger className="flex items-center">
														<ShieldQuestion className="w-4 h-4 mr-2" />
														<span>Role</span>
													</DropdownMenuSubTrigger>
													<DropdownMenuPortal>
														<DropdownMenuSubContent>
															<DropdownMenuItem
																onClick={() =>
																	onRoleChange(member?.id, "GUEST")
																}
															>
																<Shield className="w-4 h-4 mr-2" />
																Guest
																{member?.role === "GUEST" && (
																	<Check className="w-4 h-4 ml-auto" />
																)}
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	onRoleChange(member?.id, "MODERATOR")
																}
															>
																<ShieldCheck className="w-4 h-4 mr-2" />
																Moderator
																{member?.role === "MODERATOR" && (
																	<Check className="w-4 h-4 ml-auto" />
																)}
															</DropdownMenuItem>
														</DropdownMenuSubContent>
													</DropdownMenuPortal>
												</DropdownMenuSub>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={() => onKick(member?.id)}>
													<Gavel className="w-4 h-4 mr-2" />
													Kick
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
							{loadingId === member?.id && (
								<Loader2 className="ml-auto h-4 w-4 animate-spin text-zinc-500" />
							)}
						</div>
					))}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default MembersModal;
