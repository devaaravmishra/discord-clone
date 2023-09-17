import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      channelId: string;
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

    if (!serverId) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MembershipRole.ADMIN, MembershipRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
      include: {
        channels: true,
      },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      channelId: string;
    };
  },
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { name, type } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId || !name || !type) {
      return new NextResponse("Bad request", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name can't be 'general'", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MembershipRole.ADMIN, MembershipRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
      include: {
        channels: true,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
