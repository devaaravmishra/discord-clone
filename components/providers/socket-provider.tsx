"use client";

import { useModal } from "@/hooks/use-modal-store";
import { CallData, CallDataWithoutMember } from "@/types/call";
import { usePathname, useRouter } from "next/navigation";
import qs from "query-string";
import { createContext, useContext, useEffect, useState } from "react";

import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = "http://0.0.0.0:3002";

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

export const SocketProvider = ({
	children,
	profileId,
}: {
	children: React.ReactNode;
	profileId: string;
}) => {
	const [isConnected, setIsConnected] = useState(false);
	const [socket, setSocket] = useState<Socket | null>(null);

	const router = useRouter();
	const pathname = usePathname();

	const { onOpen, onClose } = useModal();

	useEffect(() => {
		const socketInstance = io(SOCKET_URL, {
			addTrailingSlash: true,
			transports: ["websocket", "polling"],
			upgrade: true,
			reconnection: true,
		});

		socketInstance.on("connect", () => {
			setIsConnected(true);
		});

		socketInstance.on(`outgoing-call-${profileId}`, (data: CallData) => {
			onOpen("incomingCall", {
				callData: {
					caller: data?.caller,
					callId: data?.callId,
					conversationId: data?.conversationId,
				},
			});
		});

		socketInstance.on(
			`ongoing-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:73 ~ useEffect ~ data:",
					data,
				);

				onClose();

				toast.message("Line is busy");
			},
		);

		socketInstance.on(
			`accepted-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:82 ~ useEffect ~ data:",
					data,
				);

				onClose();

				const url = qs.stringifyUrl(
					{
						url: pathname || "",
						query: {
							video: true,
						},
					},
					{ skipNull: true },
				);

				router.push(url);
			},
		);

		socketInstance.on(
			`rejected-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:101 ~ useEffect ~ data:",
					data,
				);

				onClose();

				toast.message("Call Declined");
			},
		);

		socketInstance.on(
			`ended-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:120 ~ useEffect ~ data:",
					data,
				);

				onClose();

				const url = qs.stringifyUrl(
					{
						url: pathname || "",
						query: {
							video: undefined,
						},
					},
					{ skipNull: true },
				);

				router.push(url);

				toast.message("Call Ended");
			},
		);

		socketInstance.on(
			`missed-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:131 ~ useEffect ~ data:",
					data,
				);

				onClose();

				toast.message("Missed call");
			},
		);

		socketInstance.on(
			`missed-dialled-call-${profileId}`,
			(data: CallDataWithoutMember) => {
				console.log(
					"🚀 ~ file: socket-provider.tsx:140 ~ useEffect ~ data:",
					data,
				);

				onClose();

				toast.message("Unanswered call");
			},
		);

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
