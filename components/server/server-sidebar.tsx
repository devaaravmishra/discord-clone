import { db } from "@/lib/db";
import { redirect } from "next/navigation";

import ServerHeader from "@/components/server/server-header";
import { currentProfile } from "@/lib/current-profile";

interface ServerSidebarProps {
  serverId: string;
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
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

  const textChannels = server?.channels.filter(
    (channel) => channel.type === "TEXT",
  );

  const audioChannels = server?.channels.filter(
    (channel) => channel.type === "AUDIO",
  );

  const videoChannels = server?.channels.filter(
    (channel) => channel.type === "VIDEO",
  );

  const members = server?.members?.filter(
    (member) => member.profileId !== profile.id,
  );

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find(
    (member) => member.profileId === profile.id,
  )?.role;

  return (
    <div className="flex flex-col text-primary h-full w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role || ""} />
    </div>
  );
};

export default ServerSidebar;
