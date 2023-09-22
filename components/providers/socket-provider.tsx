"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io";

import { io as ClientIo } from "socket.io-client";

type SocketContextType = {
	socket: Socket | null;
	isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
});

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [isConnected, setIsConnected] = useState(false);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		const socketInstance = new (ClientIo as any)(
			process.env.NEXT_PUBLIC_SOCKET_URL!,
			{
				path: "/api/socket/io",
				addTrailingSlash: false,
			},
		);

		socketInstance.on("connect", () => {
			setIsConnected(true);
		});

		socketInstance.on("disconnect", () => {
			setIsConnected(false);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ isConnected, socket }}>
			{children}
		</SocketContext.Provider>
	);
};
