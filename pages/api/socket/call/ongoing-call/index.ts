import { fetchIncomingCall } from "@/lib/calls";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const profile = await currentProfilePages(req);

		if (!profile) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const { inComingCall } = await fetchIncomingCall(req);

		if (inComingCall?.id) {
			const call = await db.call.findUnique({
				where: {
					id: inComingCall?.id,
				},
				select: {
					id: true,
					conversationId: true,
					conversation: {
						include: {
							memberOne: {
								select: {
									profile: true,
								},
							},
							memberTwo: {
								select: {
									profile: true,
								},
							},
						},
					},
					callerId: true,
					caller: true,
					serverId: true,
				},
			});

			const callData = {
				caller: call?.caller,
				callId: call?.id,
				conversationId: call?.conversationId,
				serverId: call?.serverId,
				calleeMemberId:
					call?.conversation?.memberOne?.profile?.id === profile?.id
						? call?.conversation?.memberTwo?.profile?.id
						: call?.conversation?.memberOne?.profile?.id,
				callerMemberId:
					call?.conversation?.memberOne?.profile?.id === profile?.id
						? call?.conversation?.memberOne?.profile?.id
						: call?.conversation?.memberTwo?.profile?.id,
			};

			return res.status(200).json({ callData, call });
		}

		return res.status(404).json({ message: "No incoming call found" });
	} catch (error) {
		console.error("[Ongoing Call] Error: ", error);
	}
}
