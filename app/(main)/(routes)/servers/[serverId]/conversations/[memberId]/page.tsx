import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import ChatTypingWrapper from "@/components/chat/chat-typing-wrapper";
import MediaRoom from "@/components/media-room";
import { getOrCreateConversation } from "@/helpers/conversation";
import { currentProfile } from "@/helpers/current-profile";
import { db } from "@/lib/db";

interface MemberIdPageProps {
	params: {
		serverId: string;
		memberId: string;
	};
	searchParams: {
		video?: boolean;
	};
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
	const profile = await currentProfile();
	const { memberId, serverId } = params;

	if (!profile) {
		return redirectToSignIn();
	}

	const currentMember = await db.member.findFirst({
		where: {
			serverId: serverId,
			profileId: profile?.id,
		},
		include: {
			profile: true,
		},
	});

	if (!currentMember) {
		return redirect("/");
	}

	const conversation = await getOrCreateConversation(
		currentMember?.id,
		memberId,
	);

	if (!conversation) {
		return redirect(`/servers/${serverId}`);
	}

	const { memberOne, memberTwo } = conversation;

	const otherMember =
		memberOne?.id === currentMember?.id ? memberTwo : memberOne;

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader
				name={otherMember?.profile?.name}
				serverId={serverId}
				type="conversation"
				imageUrl={otherMember?.profile?.imageUrl}
				conversationId={conversation?.id}
				callee={otherMember}
				callerId={currentMember?.profileId}
			/>
			{!searchParams?.video && (
				<>
					<ChatMessages
						apiUrl="/api/direct-messages"
						member={currentMember}
						name={otherMember?.profile?.name}
						chatId={conversation?.id}
						paramKey="conversationId"
						paramValue={conversation?.id}
						socketQuery={{
							conversationId: conversation?.id,
						}}
						socketUrl="/api/socket/direct-messages"
						type="conversation"
					/>
					<ChatTypingWrapper
						conversationId={conversation?.id}
						type="conversation"
						member={otherMember}
					/>
					<ChatInput
						name={otherMember?.profile?.name}
						apiUrl="/api/socket/direct-messages"
						query={{
							conversationId: conversation?.id,
						}}
						type="conversation"
						profileId={profile?.id}
					/>
				</>
			)}
			{searchParams?.video && (
				<MediaRoom
					audio={true}
					video={true}
					chatId={conversation?.id}
					apiUrl="/api/direct-messages"
					type="conversation"
					profileId={profile?.id}
				/>
			)}
		</div>
	);
};

export default MemberIdPage;
