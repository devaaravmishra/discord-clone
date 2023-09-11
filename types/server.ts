import { Membership, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithProfiles = Server & {
  members: (Membership & { profile: Profile })[];
};
