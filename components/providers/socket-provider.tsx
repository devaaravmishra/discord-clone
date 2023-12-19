"use client";

import { useModal } from "@/hooks/use-modal-store";
import axios from "@/lib/axios";
import { useCallStore } from "@/store/call-store";
import { CallData, CallDataWithoutMember } from "@/types/call";
import { MemberWithProfile } from "@/types/server";
import { Call } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import qs from "query-string";
import { createContext, useContext, useEffect, useState } from "react";

import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://0.0.0.0:3002";

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

	const { setOngoingCall, ongoingCall } = useCallStore();

	const { onOpen, onClose } = useModal();

	const fetchAnyIncomingCall = async () => {
		const url = qs.stringifyUrl(
			{ url: `/api/socket/call/ongoing-call` },
			{ skipNull: true },
		);

		try {
			const { data, status } = await axios.get(url);

			const { call, callData } = data as { call: Call; callData: CallData };

			if (status === 200) {
				setOngoingCall(call);
				onOpen("incomingCall", {
					callData: {
						caller: callData?.caller,
						callId: callData?.callId,
						conversationId: callData?.conversationId,
						serverId: callData?.serverId,
						callerMemberId: callData?.callerMemberId,
						calleeMemberId: callData?.calleeMemberId,
					},
				});
			}
		} catch (error) {}
	};

	const handleOnlineOfflineStatus = async (isOnline: boolean) => {
		const url = qs.stringifyUrl(
			{ url: `/api/profile/update-status` },
			{ skipNull: true },
		);

		try {
			await axios.patch(url, { isOnline });
		} catch (error) {}
	};

	useEffect(() => {
		fetchAnyIncomingCall();
	}, []);

	useEffect(() => {
		const handleBeforeUnload = async () => {
			await handleOnlineOfflineStatus(false);
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("unload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("unload", handleBeforeUnload);
		};
	}, []);

	useEffect(() => {
		handleOnlineOfflineStatus(true);

		const socketInstance = io(SOCKET_URL, {
			addTrailingSlash: true,
			transports: ["websocket", "polling"],
			upgrade: true,
		});

		socketInstance.on("connect", () => {
			setIsConnected(true);
		});

		socketInstance.on(
			`outgoing-call-${profileId}`,
			(data: {
				call: Call;
				caller: MemberWithProfile;
				callId: string;
				conversationId: string;
				serverId: string;
				callerMemberId: string;
				calleeMemberId: string;
			}) => {
				onOpen("incomingCall", {
					callData: {
						caller: data?.caller,
						callId: data?.callId,
						conversationId: data?.conversationId,
						serverId: data?.serverId,
						callerMemberId: data?.callerMemberId,
						calleeMemberId: data?.calleeMemberId,
					},
				});

				setOngoingCall(data?.call);
			},
		);

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

				const path = `/servers/${data?.serverId}/conversations/${data?.calleeMemberId}`;
				const url = qs.stringifyUrl(
					{
						url: path || "",
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

				setOngoingCall(null);

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

				if (!ongoingCall) {
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

					setOngoingCall(null);

					toast.message("Call Ended");
				}
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

				setOngoingCall(null);

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

				setOngoingCall(null);

				toast.message("Unanswered call");
			},
		);

		socketInstance.on("disconnect", () => {
			setIsConnected(false);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
			setSocket(null);
		};
	}, []);

	return (
		<SocketContext.Provider value={{ isConnected, socket }}>
			{children}
		</SocketContext.Provider>
	);
};
