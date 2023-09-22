import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types/server";
import { NextApiRequest } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const profile = await currentProfilePages(req);

		if (!profile) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const { content, fileUrl } = req.body;
		const { serverId, channelId } = req.query;

		if (!serverId || !channelId) {
			return res.status(400).json({ message: "Bad request" });
		}

		if (!content && !fileUrl) {
			return res.status(400).json({ message: "Missing content" });
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
				serverId: server.id,
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

		const message = await db.message.create({
			data: {
				content,
				fileUrl,
				channelId: channel.id,
				memberId: member.id,
			},
			include: {
				member: {
					include: {
						profile: true,
					},
				},
			},
		});

		// Emit the message to the server
		const channelKey = `Chat:${channel.id}:messages`;

		res?.socket?.server?.io?.emit(channelKey, message);

		return res.status(200).json(message);
	} catch (error) {
		console.error("[ERROR] pages/api/socket/messages.ts:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
