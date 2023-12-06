import { Profile } from "@prisma/client";
import { MemberWithProfile } from "./server";

export type CallData = {
	callId: string;
	caller: MemberWithProfile | Profile;
	conversationId: string;
	serverId: string;
	callerMemberId: string;
	calleeMemberId: string;
};

export type CallDataWithoutMember = {
	callId: string;
	conversationId: string;
	serverId: string;
	callerMemberId: string;
	calleeMemberId: string;
};
