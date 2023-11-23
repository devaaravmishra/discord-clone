import { NextApiRequest } from "next";
import { currentProfilePages } from "./current-profile-pages";

export async function hasOngoingCall(req: NextApiRequest) {
	const profile = await currentProfilePages(req);

	if (!profile) {
		return false;
	}

	let ongoingCall = false;

	profile?.callsInitiated.forEach((call) => {
		if (!call?.isEnded) {
			ongoingCall = true;

			return ongoingCall;
		}
	});

	profile?.callsReceived.forEach((call) => {
		if (!call?.isEnded) {
			ongoingCall = true;

			return ongoingCall;
		}
	});

	return ongoingCall;
}
