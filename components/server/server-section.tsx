"use client";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types/server";
import { ChannelType, MemberRole } from "@prisma/client";
import { Plus, Settings } from "lucide-react";
import { useMemo } from "react";

interface ServerSectionProps {
	label: string;
	role?: MemberRole;
	sectionType: "channels" | "members";
	channelType?: ChannelType;
	server?: ServerWithMembersWithProfiles;
}

const ServerSection = ({
	label,
	sectionType,
	channelType,
	role,
	server,
}: ServerSectionProps) => {
	const { onOpen } = useModal();

	const numberOfMembersOnline = useMemo(() => {
		if (!server) return 0;

		return server.members.filter((member) => member.profile.isOnline).length;
	}, [server]);

	return (
		<div className="flex items-center justify-between py-2">
			<div className="flex justify-between items-center gap-2">
				<p className="text-xs uppercase font-semibold  text-zinc-500 dark:text-zinc-400">
					{label}
				</p>
				{sectionType === "members" && numberOfMembersOnline > 0 && (
					<div
						className="
          flex items-center justify-center
          bg-green-200 dark:bg-green-600
          rounded-full px-2 py-1
        "
					>
						<span className="text-[0.5rem] uppercase font-semibold text-green-500 dark:text-green-100">
							Online: {numberOfMembersOnline}
						</span>
					</div>
				)}
			</div>
			{role !== MemberRole.GUEST && sectionType === "channels" && (
				<ActionTooltip label="Create Channel" side="top">
					<button
						onClick={() => onOpen("createChannel", { channelType })}
						className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
					>
						<Plus className="h-4 w-4" />
					</button>
				</ActionTooltip>
			)}
			{role === MemberRole.ADMIN && sectionType === "members" && (
				<ActionTooltip label="Create Channel" side="top">
					<button
						onClick={() => onOpen("members", { server })}
						className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
					>
						<Settings className="h-4 w-4" />
					</button>
				</ActionTooltip>
			)}
		</div>
	);
};

export default ServerSection;
