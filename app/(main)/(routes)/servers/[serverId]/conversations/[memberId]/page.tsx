import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface MemberIdPageProps {
	params: {
		serverId: string;
		memberId: string;
	};
}

const MemberIdPage = async ({ params }: MemberIdPageProps) => {
	const profile = await currentProfile();
	const { memberId, serverId } = params;

	if (!profile) {
		return redirectToSignIn();
	}

	const currentMember = await db.member.findFirst({
		where: {
			serverId: serverId,
			profileId: profile.id,
		},
		include: {
			profile: true,
		},
	});

	if (!currentMember) {
		return redirect("/");
	}

	const conversation = await getOrCreateConversation(
		currentMember.id,
		memberId,
	);

	if (!conversation) {
		return redirect(`/servers/${serverId}`);
	}

	const { memberOne, memberTwo } = conversation;

	const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader
				name={otherMember.profile.name}
				serverId={serverId}
				type="conversation"
				imageUrl={otherMember.profile.imageUrl}
			/>
			<ChatMessages
				apiUrl="/api/direct-messages"
				member={currentMember}
				name={otherMember.profile.name}
				chatId={conversation.id}
				paramKey="conversationId"
				paramValue={conversation.id}
				socketQuery={{
					conversationId: conversation.id,
				}}
				socketUrl="/api/socket/direct-messages"
				type="conversation"
			/>
			<ChatInput
				name={otherMember.profile.name}
				apiUrl="/api/socket/direct-messages"
				query={{
					conversationId: conversation.id,
				}}
				type="conversation"
			/>
		</div>
	);
};

export default MemberIdPage;
