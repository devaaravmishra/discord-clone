"use client";

import ChatTypingIndicator from "@/components/chat/chat-typing-indicator";
import { useSocket } from "@/components/providers/socket-provider";
import { MemberWithProfile } from "@/types/server";
import { useEffect, useMemo } from "react";
import { useImmer } from "use-immer";

interface ChannelProps {
	type: "channel";
	channelId: string;
	currentMember: MemberWithProfile;
	serverMembers: MemberWithProfile[];
}

interface ConversationProps {
	type: "conversation";
	conversationId: string;
	member: MemberWithProfile;
}

type ChatTypingWrapperProps = ChannelProps | ConversationProps;

const ChatTypingWrapper = (props: ChatTypingWrapperProps) => {
	const { socket, isConnected } = useSocket();
	const [typingCache, setTypingCache] = useImmer<Record<string, boolean>>({});

	const isChannel = props.type === "channel";
	const isConversation = props.type === "conversation";

	useEffect(() => {
		if (!isConnected) return;

		const key = "typing";

		const handleTypingStatusChange = (profileId: string, isTyping: boolean) => {
			setTypingCache((draft) => {
				draft[profileId] = isTyping;
			});
		};

		socket?.on(key, (data: any) => {
			const { profileId, isTyping, channelId, conversationId } = data;

			if (isConversation) {
				// If the conversationId is not the same as the one in the props,
				if (conversationId !== props.conversationId) {
					return;
				}

				// if the member is not the same as the one in the props,
				if (profileId !== props.member.profile.id) {
					return;
				}
			}

			if (isChannel) {
				// If the channelId is not the same as the one in the props,
				if (channelId !== props.channelId) {
					return;
				}

				// if I'm the one typing, don't show the typing indicator
				if (profileId === props.currentMember.profile.id) {
					return;
				}
			}

			handleTypingStatusChange(profileId, isTyping);
		});

		return () => {
			socket?.off(key, () => {});
		};
	}, [props, isConnected, socket, setTypingCache, isConversation, isChannel]);

	const memoizedMembers = useMemo(() => {
		const typingMembers = Object.keys(typingCache).filter(
			(id) => typingCache[id],
		);

		return typingMembers.map((id) => {
			if (isConversation) {
				return props.member.profileId === id ? props.member.profile.name : "";
			}

			if (isChannel) {
				const member = props.serverMembers.find(
					(member) => member.profileId === id,
				);

				return member ? member.profile.name : "";
			}

			return "";
		});
	}, [isChannel, isConversation, props, typingCache]);

	return <ChatTypingIndicator members={memoizedMembers} />;
};

export default ChatTypingWrapper;
