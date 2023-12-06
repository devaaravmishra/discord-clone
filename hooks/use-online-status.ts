"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Profile } from "@prisma/client";
import { useEffect, useState } from "react";

export const useOnlineStatus = (profile: Profile) => {
	const { socket } = useSocket();
	const [isUserOnline, setIsUserOnline] = useState(profile?.isOnline);

	useEffect(() => {
		if (!profile?.id || !socket) {
			return;
		}

		socket.on(`active-status-${profile?.id}`, (data: Profile) => {
			console.log("[useOnlineStatus] data: ", data);
			const { isOnline } = data;
			setIsUserOnline(isOnline);
		});

		return () => {
			socket?.off(`active-status-${profile?.id}`);
		};
	}, [profile?.id]);

	return {
		isUserOnline,
	};
};
