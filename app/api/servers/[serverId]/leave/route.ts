import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  params: {
    serverId: string;
  },
) {
  try {
    const profile = await currentProfile();
    const { serverId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Bad request", { status: 400 });
    }

    await db.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SERVER_LEAVE_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
