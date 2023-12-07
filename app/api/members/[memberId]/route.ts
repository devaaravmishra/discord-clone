import { currentProfile } from "@/helpers/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
	req: Request,
	{
		params,
	}: {
		params: {
			memberId: string;
		};
	},
) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(req.url);
		const { role } = await req.json();

		const serverId = searchParams.get("serverId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!serverId || !params.memberId || !role) {
			return new NextResponse("Bad request", { status: 400 });
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id,
			},
			data: {
				members: {
					update: {
						where: {
							id: params.memberId,
							profileId: {
								not: profile.id,
							},
						},
						data: {
							role,
						},
					},
				},
			},
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		});

		if (!server) {
			return new NextResponse("Not found", { status: 404 });
		}

		return NextResponse.json(server);
	} catch (error) {
		console.error("[MEMBERS_ID_PATCH]", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{
		params,
	}: {
		params: {
			memberId: string;
		};
	},
) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(req.url);

		const serverId = searchParams.get("serverId");

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!serverId || !params.memberId) {
			return new NextResponse("Bad request", { status: 400 });
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id,
			},
			data: {
				members: {
					deleteMany: {
						id: params.memberId,
						profileId: {
							not: profile.id,
						},
					},
				},
			},
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		});

		if (!server) {
			return new NextResponse("Not found", { status: 404 });
		}

		return NextResponse.json(server);
	} catch (error) {
		console.error("[MEMBERS_ID_DELETE]", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
}
