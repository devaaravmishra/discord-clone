import { Hash } from "lucide-react";

import MobileToggle from "@/components/mobile-toggle";
import SocketIndicator from "@/components/socket-indicator";
import UserAvatar from "@/components/user-avatar";
import { ChatVideoButton } from "./chat-video-button";

interface ChatHeaderProps {
	serverId: string;
	name: string;
	type: "conversation" | "channel";
	imageUrl?: string;
}

const ChatHeader = ({ name, serverId, type, imageUrl }: ChatHeaderProps) => {
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
				<UserAvatar src={imageUrl} className="mr-2" />
			)}
			<p className="font-semibold text-md text-black dark:text-white">{name}</p>
			<div className="flex items-center ml-auto">
				{type === "conversation" && <ChatVideoButton />}
				<SocketIndicator />
			</div>
		</div>
	);
};

export default ChatHeader;
