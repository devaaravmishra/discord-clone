// archive all below code in this file
/**
 * @template
 *  This file is a template for socket.io server.
 */

// import { Server as NetServer } from "http";
// import { NextApiRequest } from "next";
// import { Server as ServerIo } from "socket.io";

// import { NextApiResponseServerIo } from "@/types/server";

// export const config = {
// 	api: {
// 		bodyParser: false,
// 	},
// };

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
// 	if (!res.socket.server.io) {
// 		const path = "/api/socket/io";
// 		const httpServer: NetServer = res.socket.server as any;

// 		const io = new ServerIo(httpServer, {
// 			path,
// 			// @ts-ignore
// 			addTrailingSlash: false,
// 			cors: {
// 				origin: ["https://admin.socket.io", "http://localhost:3000"],
// 				credentials: true,
// 			},
// 			allowUpgrades: true,
// 			transports: ["websocket", "polling"],
// 		});

// 		io.engine.on("connection_error", (err) => {
// 			console.log(err.req);
// 			console.log(err.code);
// 			console.log(err.message);
// 			console.log(err.context);
// 		});

// 		io.on("connection", (socket) => {
// 			console.log("socket connected");

// 			/* This event is triggered when a user starts typing. */
// 			socket.on("typing", (data) => {
// 				socket.broadcast.emit("typing", data);
// 			});
// 		});

// 		res.socket.server.io = io;
// 	}

// 	res.end();
// };

// export default ioHandler;
