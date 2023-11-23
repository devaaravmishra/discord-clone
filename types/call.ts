import { MemberWithProfile } from "./server";

export type CallData = {
	callId: string;
	caller: MemberWithProfile;
	conversationId: string;
};

export type CallDataWithoutMember = {
	callId: string;
	conversationId: string;
};
