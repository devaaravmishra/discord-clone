import { Call } from "@prisma/client";
import { create } from "zustand";

interface CallStore {
	ongoingCall: Call | null;
	setOngoingCall: (call: Call | null) => void;
}

export const useCallStore = create<CallStore>((set) => ({
	ongoingCall: null,
	setOngoingCall: (ongoingCall) => set({ ongoingCall }),
}));
