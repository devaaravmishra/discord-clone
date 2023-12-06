import { Call } from "@prisma/client";
import { NextApiRequest } from "next";
import { currentProfilePages } from "./current-profile-pages";

export async function fetchIncomingCall(req: NextApiRequest) {
	const profile = await currentProfilePages(req);

	let inComingCall = {} as Call;

	profile?.callsInitiated.forEach((call) => {
		if (
			!call?.isEnded &&
			!call?.isRejected &&
			!call?.isCanceled &&
			!call?.isMissed &&
			!call?.isAccepted
		) {
			inComingCall = call;

			return { inComingCall };
		}
	});

	profile?.callsReceived.forEach((call) => {
		if (
			!call?.isEnded &&
			!call?.isRejected &&
			!call?.isCanceled &&
			!call?.isMissed &&
			!call?.isAccepted
		) {
			inComingCall = call;

			return { inComingCall };
		}
	});

	return { inComingCall };
}
