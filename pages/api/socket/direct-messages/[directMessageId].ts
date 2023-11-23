import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { publisher } from "@/lib/redis";
import { NextApiResponseServerIo } from "@/types/server";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo,
) {
	if (req.method !== "DELETE" && req.method !== "PATCH") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const profile = await currentProfilePages(req);
		const { conversationId, directMessageId } = req.query;
		const { content } = req.body;

		if (!profile) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		if (!conversationId || !directMessageId) {
			return res.status(400).json({ message: "Bad request" });
		}

		const conversation = await db.conversation.findFirst({
			where: {
				id: conversationId as string,
				OR: [
					{
						memberOne: {
							profileId: profile.id,
						},
					},
					{
						memberTwo: {
							profileId: profile.id,
						},
					},
				],
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		});

		if (!conversation) {
			return res.status(404).json({ message: "Conversation not found" });
		}

		const member =
			conversation.memberOne.profileId === profile.id
				? conversation.memberOne
				: conversation.memberTwo;

		if (!member) {
			return res.status(404).json({ message: "Member not found" });
		}

		let directMessage = await db.directMessage.findFirst({
			where: {
				id: directMessageId as string,
				conversationId: conversationId as string,
			},
			include: {
				member: {
					include: {
						profile: true,
					},
				},
			},
		});

		if (!directMessage || directMessage.deleted) {
			return res.status(404).json({ message: "Message not found" });
		}

		const isAuthor = directMessage.memberId === member.id;
		const isModerator = member.role === MemberRole.MODERATOR;
		const isAdmin = member.role === MemberRole.ADMIN;
		const canModify = isAuthor || isModerator || isAdmin;

		if (!canModify) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (req.method === "DELETE") {
			directMessage = await db.directMessage.update({
				// soft delete
				where: {
					id: directMessageId as string,
				},
				data: {
					deleted: true,
					fileUrl: null,
					content: "This message has been deleted.",
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
			});
		}

		if (req.method === "PATCH") {
			if (!isAuthor) {
				return res.status(401).json({ message: "Unauthorized" });
			}

			if (!content) {
				return res.status(400).json({ message: "Bad request" });
			}

			directMessage = await db.directMessage.update({
				where: {
					id: directMessageId as string,
				},
				data: {
					content,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
			});
		}

		// Emit the message to all clients in the channel
		const updateKey = `chat:${conversationId}:messages:update`;
		const CONVERSATION_MESSAGE_UPDATE_KEY = "CONVERSATION_MESSAGE_UPDATE";

		const payload = {
			conversationId,
			directMessage,
		};

		publisher.publish(CONVERSATION_MESSAGE_UPDATE_KEY, JSON.stringify(payload));
		// res?.socket?.server?.io.emit(updateKey, directMessage);

		return res.status(200).json(directMessage);
	} catch (error) {
		console.error("[MESSAGE_ID] ERROR", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
