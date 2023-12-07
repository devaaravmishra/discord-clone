import { currentProfile } from "@/helpers/current-profile";
import { db } from "@/lib/db";
import { publisher } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, res: Response) {
	try {
		const profile = await currentProfile();

		const { isOnline } = await req.json();
		console.log("[PROFILE_STATUS_PATCH]", isOnline, profile?.name);

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (typeof isOnline !== "boolean") {
			return new NextResponse("Bad Request", { status: 400 });
		}

		const updatedProfile = await db.profile.update({
			where: {
				id: profile.id,
			},
			data: {
				isOnline,
			},
		});

		const PROFILE_ACTIVE_STATUS = "PROFILE_ACTIVE_STATUS";
		publisher.publish(PROFILE_ACTIVE_STATUS, JSON.stringify(updatedProfile));

		return NextResponse.json(updatedProfile);
	} catch (error) {
		console.error("[PROFILE_STATUS_PATCH]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
