import { currentProfile } from "@/helpers/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH_SIZE = 10;

export async function GET(req: Request) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(req.url);

		const cursor = searchParams.get("cursor");
		const conversationId = searchParams.get("conversationId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!conversationId) {
			return new NextResponse("Bad request", { status: 400 });
		}

		let messages: DirectMessage[] = [];

		if (cursor) {
			messages = await db.directMessage.findMany({
				take: MESSAGES_BATCH_SIZE,
				skip: 1,
				cursor: {
					id: cursor,
				},
				where: {
					conversationId,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		} else {
			messages = await db.directMessage.findMany({
				take: MESSAGES_BATCH_SIZE,
				where: {
					conversationId,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		}

		let nextCursor = null;

		if (messages.length === MESSAGES_BATCH_SIZE) {
			nextCursor = messages[messages.length - 1].id;
		}

		return NextResponse.json({
			items: messages,
			nextCursor,
		});
	} catch (error) {
		console.error("[DIRECT_MESSAGES_GET] error:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
}
