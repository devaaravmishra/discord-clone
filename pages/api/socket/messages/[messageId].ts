import { currentProfilePages } from "@/helpers/current-profile-pages";
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
		const { serverId, channelId, messageId } = req.query;
		const { content } = req.body;

		if (!profile) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		if (!serverId || !channelId || !messageId) {
			return res.status(400).json({ message: "Bad request" });
		}

		const server = await db.server.findFirst({
			where: {
				id: serverId as string,
				members: {
					some: {
						profileId: profile.id,
					},
				},
			},
			include: {
				members: true,
			},
		});

		if (!server) {
			return res.status(404).json({ message: "Server not found" });
		}

		const channel = await db.channel.findFirst({
			where: {
				id: channelId as string,
				serverId: serverId as string,
			},
		});

		if (!channel) {
			return res.status(404).json({ message: "Channel not found" });
		}

		const member = server.members.find(
			(member) => member.profileId === profile.id,
		);

		if (!member) {
			return res.status(404).json({ message: "Member not found" });
		}

		let message = await db.message.findFirst({
			where: {
				id: messageId as string,
				channelId: channelId as string,
			},
			include: {
				member: {
					include: {
						profile: true,
					},
				},
			},
		});

		if (!message || message.deleted) {
			return res.status(404).json({ message: "Message not found" });
		}

		const isAuthor = message.memberId === member.id;
		const isModerator = member.role === MemberRole.MODERATOR;
		const isAdmin = member.role === MemberRole.ADMIN;
		const canModify = isAuthor || isModerator || isAdmin;

		if (!canModify) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		if (req.method === "DELETE") {
			message = await db.message.update({
				// soft delete
				where: {
					id: messageId as string,
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

			message = await db.message.update({
				where: {
					id: messageId as string,
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
		const updateKey = `chat:${channelId}:messages:update`;
		const CHANNEL_MESSAGE_UPDATE_KEY = "CHANNEL_MESSAGE_UPDATE";

		const payload = {
			channelId,
			message,
		};

		publisher.publish(CHANNEL_MESSAGE_UPDATE_KEY, JSON.stringify(payload));
		// res?.socket?.server?.io?.emit(updateKey, message);

		return res.status(200).json(message);
	} catch (error) {
		console.error("[MESSAGE_ID] ERROR", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
