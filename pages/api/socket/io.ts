import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIo } from "socket.io";

import { NextApiResponseServerIo } from "@/types/server";

export const config = {
	api: {
		bodyParser: false,
	},
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
	if (!res.socket.server.io) {
		const path = "/api/socket/io";
		const httpServer: NetServer = res.socket.server as any;
		const io = new ServerIo(httpServer, {
			path,
			// @ts-ignore
			addTrailingSlash: false,
		});

		io.on("connection", (socket) => {
			console.log("socket connected");

			// Typing event
			socket.on("typing", (data) => {
				socket.broadcast.emit("typing", data);
			});
		});

		res.socket.server.io = io;
	}

	res.end();
};

export default ioHandler;
