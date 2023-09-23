"use client";

import { format } from "date-fns";
import { Loader2, ServerCrash } from "lucide-react";
import { ElementRef, Fragment, useRef } from "react";

import ChatItem from "@/components/chat/chat-item";
import ChatWelcome from "@/components/chat/chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { MessageWithMemberWithProfile } from "@/types/server";
import { Member } from "@prisma/client";

const DATE_FORMAT = "MMMM d, yyyy, HH:mm";

interface ChatMessagesProps {
	name: string;
	member: Member;
	chatId: string;
	apiUrl: string;
	socketUrl: string;
	socketQuery: Record<string, string>;
	paramKey: "channelId" | "conversationId";
	paramValue: string;
	type: "channel" | "conversation";
}

const ChatMessages = ({
	apiUrl,
	chatId,
	member,
	name,
	paramKey,
	paramValue,
	socketQuery,
	socketUrl,
	type,
}: ChatMessagesProps) => {
	const queryKey = `chat:${chatId}`;
	const addKey = `chat:${chatId}:messages`;
	const updateKey = `chat:${chatId}:messages:update`;

	const chatRef = useRef<ElementRef<"div">>(null);
	const bottomRef = useRef<ElementRef<"div">>(null);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useChatQuery({
			apiUrl,
			paramKey,
			paramValue,
			queryKey,
		});

	// Emits update, add event to all clients
	useChatSocket({ queryKey, addKey, updateKey });

	// Scrolls to bottom on new message
	useChatScroll({
		chatRef,
		bottomRef,
		loadMore: fetchNextPage,
		shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
		count: data?.pages[0]?.items?.length ?? 0,
	});

	if (status === "loading") {
		return (
			<div className="flex-1 flex flex-col items-center justify-center">
				<Loader2 className="h-7 w-7 text-zinc-500 dark:text-zinc-400 animate-spin my-4" />
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Loading messages...
				</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex-1 flex flex-col items-center justify-center">
				<ServerCrash className="h-7 w-7 text-zinc-500 dark:text-zinc-400 my-4" />
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Something went wrong.
				</p>
			</div>
		);
	}

	return (
		<div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
			{!hasNextPage && (
				<>
					<div className="flex-1" />
					<ChatWelcome name={name} type={type} />
				</>
			)}
			{hasNextPage && (
				<div className="flex justify-center">
					{isFetchingNextPage ? (
						<Loader2 className="h-6 w-6 text-zinc-500 dark:text-zinc-400 animate-spin my-4" />
					) : (
						<button
							className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-600
							 dark:hover:text-zinc-300 my-4 transition"
							onClick={() => fetchNextPage()}
						>
							Load previous messages
						</button>
					)}
				</div>
			)}
			<div className="flex flex-col-reverse mt-auto">
				{data?.pages.map((page, i) => (
					<Fragment key={i}>
						{page.items.map((message: MessageWithMemberWithProfile) => (
							<ChatItem
								key={message.id}
								currentMember={member}
								id={message.id}
								content={message.content}
								member={message.member}
								timeStamp={format(new Date(message.createdAt), DATE_FORMAT)}
								fileUrl={message.fileUrl}
								deleted={message.deleted}
								isUpdated={message.updatedAt !== message.createdAt}
								socketUrl={socketUrl}
								socketQuery={socketQuery}
							/>
						))}
					</Fragment>
				))}
			</div>
			<div ref={bottomRef} />
		</div>
	);
};

export default ChatMessages;
