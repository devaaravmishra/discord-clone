import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { publisher } from "@/lib/redis";
import { NextApiResponseServerIo } from "@/types/server";
import { Call } from "@prisma/client";
import { NextApiRequest } from "next";

function hasActiveCall(calls: Call[]) {
	calls?.some((call) => {
		if (!call?.isEnded) {
			return true;
		}
	});

	return false;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo,
) {
	if (req.method !== "POST" && req.method !== "PATCH") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const profile = await currentProfilePages(req);

		if (!profile) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (req.method === "POST") {
			const { conversationId, callerId } = req.query;

			if (!conversationId || !callerId) {
				return res.status(400).json({ message: "Bad request" });
			}

			const conversation = await db.conversation.findUnique({
				where: {
					id: conversationId as string,
				},
				select: {
					memberOne: {
						select: {
							profile: {
								include: {
									callsInitiated: true,
									callsReceived: true,
								},
							},
						},
					},
					memberTwo: {
						select: {
							profile: {
								include: {
									callsInitiated: true,
									callsReceived: true,
								},
							},
						},
					},
				},
			});

			if (!conversation) {
				return res.status(404).json({ message: "Conversation not found" });
			}

			const memberOneProfileId = conversation.memberOne.profile.id;
			const memberTwoProfileId = conversation.memberTwo.profile.id;

			if (
				memberOneProfileId !== profile.id &&
				memberTwoProfileId !== profile.id
			) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			// Check if is already a call in progress for either caller or callee
			if (
				hasActiveCall(conversation.memberOne.profile.callsInitiated) ||
				hasActiveCall(conversation.memberOne.profile.callsReceived) ||
				hasActiveCall(conversation.memberTwo.profile.callsInitiated) ||
				hasActiveCall(conversation.memberTwo.profile.callsReceived)
			) {
				const CALL_IN_PROGRESS_KEY = "CALL_IN_PROGRESS";
				const payload = {
					callerId,
					conversationId,
				};

				publisher.publish(CALL_IN_PROGRESS_KEY, JSON.stringify(payload));

				// res?.socket?.server?.io?.emit(`ongoing-call-${callerId}`, {
				// 	conversationId: conversationId,
				// });
			}

			const call = await db.call.create({
				data: {
					conversationId: conversationId as string,
					callerId: callerId as string,
					calleeId:
						memberOneProfileId === profile?.id
							? memberTwoProfileId
							: memberOneProfileId,
				},
			});

			if (!call) {
				console.log("🚀 ~ file: index.ts:105 ~ call:", call);
				return res.status(500).json({ message: "Internal server error" });
			}

			const outGoingCallKey = `outgoing-call-${call?.calleeId}`;
			const OUTGOING_CALL_KEY = "OUTGOING_CALL";

			const caller =
				conversation.memberOne.profile.id === callerId
					? conversation.memberOne
					: conversation.memberTwo;

			const callId = call.id;

			const payload = {
				callId,
				caller,
				conversationId,
				calleeId: call.calleeId,
			};

			publisher.publish(OUTGOING_CALL_KEY, JSON.stringify(payload));
			// res?.socket?.server?.io?.emit(outGoingCallKey, payload);

			res.status(201).json(call);

			// If after 45 seconds the callee does not answer the call, we will update the call status to missed call and emit the missed call event to the caller with conversationId
			setTimeout(async () => {
				// Check if the call is still in progress
				const newCall = await db.call.findUnique({
					where: {
						id: call.id,
					},
				});

				if (
					newCall?.isAccepted ||
					newCall?.isRejected ||
					newCall?.isEnded ||
					newCall?.isCanceled ||
					newCall?.isMissed
				) {
					console.log(
						"🚀 ~ file: index.ts:117 ~ setTimeout ~ newCall",
						newCall,
					);
					return;
				}

				const missedCallKey = `missed-call-${newCall?.calleeId}`;
				const MISSED_CALL_KEY = "MISSED_CALL";

				const payload = {
					calleeId: newCall?.calleeId,
					conversationId: newCall?.conversationId,
					callId: call?.id,
				};
				publisher.publish(MISSED_CALL_KEY, JSON.stringify(payload));

				// res?.socket?.server?.io?.emit(missedCallKey, {
				// 	conversationId: call?.conversationId,
				// });

				await db.call.update({
					where: {
						id: call.id,
					},
					data: {
						isMissed: true,
					},
				});

				console.log(
					"🚀 ~ file: index.ts:117 ~ setTimeout ~ newCall ~ callMissed",
					newCall,
				);

				const missedCallKeyForCaller = `missed-dialled-call-${newCall?.callerId}`;

				const MISSED_DIALLED_CALL_KEY = "MISSED_DIALLED_CALL";

				const data = {
					callerId: newCall?.callerId,
					conversationId: newCall?.conversationId,
					callId: call?.id,
				};

				publisher.publish(MISSED_DIALLED_CALL_KEY, JSON.stringify(data));
				// res?.socket?.server?.io?.emit(missedCallKeyForCaller, {
				// 	conversationId: call?.conversationId,
				// 	callId: call?.id,
				// });

				return;
			}, 45000);

			return;
		}

		if (req.method === "PATCH") {
			const { callId, isAccepted, isRejected, isEnded, isCanceled } = req.body;

			if (!callId && !isAccepted && !isRejected && !isEnded && !isCanceled) {
				return res.status(400).json({ message: "Bad request" });
			}

			let call = await db.call.findUnique({
				where: {
					id: callId as string,
					isEnded: false,
					isCanceled: false,
					isMissed: false,
					isRejected: false,
					isAccepted: isEnded ? true : false,
				},
			});

			if (!call) {
				return res.status(404).json({ message: "Call not found" });
			}

			const callerId = call.callerId;
			const calleeId = call.calleeId;

			if (profile.id !== calleeId && profile.id !== callerId) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			if (isAccepted) {
				console.log("🚀 ~ file: index.ts:210 ~ call-accepted:", call);

				// Emit the accepted call event to the caller with conversationId
				const callKey = `accepted-call-${callerId}`;
				const ACCEPTED_CALL_KEY = "ACCEPTED_CALL";

				const payload = {
					conversationId: call.conversationId,
					callId: call.id,
					callerId,
				};
				publisher.publish(ACCEPTED_CALL_KEY, JSON.stringify(payload));
				// res?.socket?.server?.io?.emit(callKey, {
				// 	conversationId: call.conversationId,
				// 	callId: call.id,
				// });

				call = await db.call.update({
					where: {
						id: callId as string,
					},
					data: {
						isAccepted: true,
					},
				});
			}

			if (isRejected) {
				console.log("🚀 ~ file: index.ts:231 ~ call-rejected:", call);

				// Emit the rejected call event to the caller with conversationId
				const callKey = `rejected-call-${callerId}`;
				const REJECTED_CALL_KEY = "REJECTED_CALL";

				const payload = {
					conversationId: call.conversationId,
					callId: call.id,
					callerId,
				};
				publisher.publish(REJECTED_CALL_KEY, JSON.stringify(payload));

				// res?.socket?.server?.io?.emit(callKey, {
				// 	conversationId: call.conversationId,
				// 	callId: call.id,
				// });

				// Update call status to rejected
				call = await db.call.update({
					where: {
						id: callId as string,
					},
					data: {
						isRejected: true,
					},
				});
			}

			if (isEnded) {
				console.log("🚀 ~ file: index.ts:252 ~ call-ended:", call);

				// Emit the ended call event to the caller with conversationId
				const callKey = `ended-call-${callerId}`;
				const CALL_ENDED_KEY = "CALL_ENDED";

				const payload = {
					conversationId: call.conversationId,
					callId: call.id,
					callerId,
				};
				publisher.publish(CALL_ENDED_KEY, JSON.stringify(payload));

				// res?.socket?.server?.io?.emit(callKey, {
				// 	conversationId: call.conversationId,
				// 	callId: call.id,
				// });

				// Update call status to ended
				call = await db.call.update({
					where: {
						id: callId as string,
					},
					data: {
						isEnded: true,
						endedAt: new Date(),
					},
				});
			}

			if (isCanceled) {
				console.log("🚀 ~ file: index.ts:273 ~ call-canceled:", call);

				// Emit the canceled call event to the caller with conversationId
				const callKey = `missed-call-${calleeId}`;
				const MISSED_CALL_KEY = "MISSED_CALL";

				const payload = {
					calleeId,
					conversationId: call.conversationId,
					callId: call.id,
				};
				publisher.publish(MISSED_CALL_KEY, JSON.stringify(payload));

				// res?.socket?.server?.io?.emit(callKey, {
				// 	conversationId: call.conversationId,
				// 	callId: call.id,
				// });

				// Update call status to canceled
				call = await db.call.update({
					where: {
						id: callId as string,
					},
					data: {
						isCanceled: true,
					},
				});
			}

			return res.status(200).json(call);
		}
	} catch (error) {
		console.error("[CALL: POST/PATCH]", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
