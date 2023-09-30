import { Member, Message, Profile, Server } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIoServer } from "socket.io";

export type ServerWithMembersWithProfiles = Server & {
	members: (Member & { profile: Profile })[];
};

export type MessageWithMemberWithProfile = Message & {
	member: Member & { profile: Profile };
};

export type MemberWithProfile = Member & { profile: Profile };

export type NextApiResponseServerIo = NextApiResponse & {
	socket: Socket & {
		server: NetServer & {
			io: SocketIoServer;
		};
	};
};
