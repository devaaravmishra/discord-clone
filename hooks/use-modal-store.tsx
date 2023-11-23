import { CallData } from "@/types/call";
import { MemberWithProfile } from "@/types/server";
import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand";

export type ModalType =
	| "createServer"
	| "invite"
	| "editServer"
	| "members"
	| "createChannel"
	| "leaveServer"
	| "deleteServer"
	| "deleteChannel"
	| "editChannel"
	| "messageFile"
	| "deleteMessage"
	| "incomingCall"
	| "outgoingCall";

interface ModalStore {
	type: ModalType | null;
	isOpen: boolean;
	data: ModalData;
	onOpen: (modal: ModalType, data?: ModalData) => void;
	onClose: () => void;
}

interface ModalData {
	server?: Server;
	channel?: Channel;
	channelType?: ChannelType;
	apiUrl?: string;
	query?: Record<string, any>;
	callData?: CallData;
	callee?: MemberWithProfile;
}

export const useModal = create<ModalStore>((set) => ({
	type: null,
	isOpen: false,
	data: {},
	onOpen: (type: ModalType, data = {}) => set({ type, isOpen: true, data }),
	onClose: () => set({ type: null, isOpen: false }),
}));
