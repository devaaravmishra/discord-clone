import { db } from "@/lib/db";
import { redirect } from "next/navigation";

import ServerHeader from "@/components/server/server-header";
import ServerSearch from "@/components/server/server-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import ServerChannel from "./server-channel";
import ServerMember from "./server-member";
import ServerSection from "./server-section";

interface ServerSidebarProps {
  serverId: string;
}

const icons = {
  [ChannelType.TEXT]: <Hash className="h-4 w-4 mr-2" />,
  [ChannelType.AUDIO]: <Mic className="h-4 w-4 mr-2" />,
  [ChannelType.VIDEO]: <Video className="h-4 w-4 mr-2" />,
};

const roleIcons = {
  [MemberRole.GUEST]: null,
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
};

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
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: icons[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: icons[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: icons[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIcons[member.role],
                })),
              },
            ]}
          />
          <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
          {!!textChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                label="Text Channels"
                channelType={ChannelType.TEXT}
                role={role}
                server={server}
              />
              <div className="space-y-[2px]">
                {textChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                  />
                ))}
              </div>
            </div>
          )}
          {!!audioChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                label="Voice Channels"
                channelType={ChannelType.AUDIO}
                role={role}
                server={server}
              />
              <div className="space-y-[2px]">
                {audioChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                  />
                ))}
              </div>
            </div>
          )}
          {!!videoChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                label="Video Channels"
                channelType={ChannelType.VIDEO}
                role={role}
                server={server}
              />
              <div className="space-y-[2px]">
                {videoChannels.map((channel) => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    server={server}
                  />
                ))}
              </div>
            </div>
          )}
          {!!members?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="members"
                label="Members"
                role={role}
                server={server}
              />
              <div className="space-y-[2px]">
                {members.map((member) => (
                  <ServerMember
                    key={member.id}
                    member={member}
                    server={server}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
