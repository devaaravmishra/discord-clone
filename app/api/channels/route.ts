import { currentProfile } from "@/helpers/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const profile = await currentProfile();
		const { name, type } = await req.json();
		const { searchParams } = new URL(req.url);

		const serverId = searchParams.get("serverId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!name || !type || !serverId) {
			return new NextResponse("Bad request", { status: 400 });
		}

		if (type === "general") {
			return new NextResponse("Channel name can't be 'General'", {
				status: 400,
			});
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							in: [MemberRole.ADMIN, MemberRole.MODERATOR],
						},
					},
				},
			},
			data: {
				channels: {
					create: {
						name,
						type,
						profileId: profile.id,
					},
				},
			},
			include: {
				channels: true,
			},
		});

		return NextResponse.json(server);
	} catch (error) {
		console.error("[CHANNELS_POST]", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
}
