"use client";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/utils/cn";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface ServerChannelProps {
	channel: Channel;
	server: Server;
	role?: MemberRole;
}

const icons = {
	[ChannelType.AUDIO]: Mic,
	[ChannelType.VIDEO]: Video,
	[ChannelType.TEXT]: Hash,
};

const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {
	const params = useParams();
	const router = useRouter();
	const { onOpen } = useModal();

	const Icon = icons[channel.type];

	const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();
		router.push(`/servers/${server.id}/channels/${channel.id}`);
	};

	return (
		<button
			onClick={(e) => onClick(e)}
			className={cn(
				"group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zince-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
				params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700",
			)}
		>
			<Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
			<p
				className={cn(
					"line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
					params?.channelId === channel.id &&
						"text-primary dark:text-zinc-200 dark:group-hover:text-white",
				)}
			>
				{channel.name}
			</p>
			{channel.name !== "general" && role !== MemberRole.GUEST && (
				<div className="flex items-center gap-x-2 ml-auto">
					<ActionTooltip label="Edit">
						<Edit
							onClick={(e) => {
								e.stopPropagation();
								onOpen("editChannel", {
									channel,
									server,
									channelType: channel.type,
								});
							}}
							className="hidden group-hover:block h-4 w-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
						/>
					</ActionTooltip>
					<ActionTooltip label="Delete">
						<Trash
							onClick={(e) => {
								e.stopPropagation();
								onOpen("deleteChannel", { channel, server });
							}}
							className="hidden group-hover:block h-4 w-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
						/>
					</ActionTooltip>
				</div>
			)}
			{channel.name === "general" && (
				<Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
			)}
		</button>
	);
};

export default ServerChannel;
