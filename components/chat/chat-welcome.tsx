"use client";

import { Hash } from "lucide-react";

interface ChatWelcomeProps {
	name: string;
	type: "channel" | "conversation";
}

const ChatWelcome = ({ name, type }: ChatWelcomeProps) => {
	return (
		<div className="space-y-2 px-4 mb-4">
			{type === "channel" && (
				<div
					className="h-[75px] w-[75px] flex items-center justify-center rounded-full
        dark:bg-zinc-700 bg-zinc-500"
				>
					<Hash className="h-12 w-12 text-white" />
				</div>
			)}
			<p className="text-xl font-bold md:text-3xl">
				{type === "channel" ? `Welcome to #` : ""}
				{name}
			</p>
			<p className="text-zinc-600 dark:text-zinc-400 text-sm">
				{type === "channel"
					? "This is the beginning of the channel."
					: `This is the very beginning of your direct message history.`}
			</p>
		</div>
	);
};

export default ChatWelcome;
