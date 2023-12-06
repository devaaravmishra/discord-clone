import { Hash } from "lucide-react";

import MobileToggle from "@/components/mobile-toggle";
import SocketIndicator from "@/components/socket-indicator";
import { MemberWithProfile } from "@/types/server";
import { Profile } from "@prisma/client";
import UserAvatarWraper from "../user-avatar-wrapper";
import { ChatVideoButton } from "./chat-video-button";

interface ChatHeaderProps {
	serverId: string;
	name: string;
	type: "conversation" | "channel";
	imageUrl?: string;
	conversationId?: string;
	callerId?: string;
	callee?: MemberWithProfile;
}

const ChatHeader = ({
	name,
	serverId,
	type,
	imageUrl,
	callee,
	callerId,
	conversationId,
}: ChatHeaderProps) => {
	return (
		<div
			className="text-md font-semibold px-3 flex items-center h-12 border-neutral-200
     dark:border-neutral-800 border-b-2"
		>
			<MobileToggle serverId={serverId} />
			{type === "channel" && (
				<Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
			)}
			{type === "conversation" && (
				<UserAvatarWraper
					imageUrl={imageUrl || ""}
					profile={callee?.profile || ({} as Profile)}
				/>
			)}
			<p className="font-semibold text-md text-black dark:text-white ml-2">
				{name}
			</p>
			<div className="flex items-center ml-auto">
				{type === "conversation" && (
					<ChatVideoButton
						callee={callee as MemberWithProfile}
						callerId={callerId || ""}
						conversationId={conversationId || ""}
						serverId={serverId}
					/>
				)}
				<SocketIndicator />
			</div>
		</div>
	);
};

export default ChatHeader;
