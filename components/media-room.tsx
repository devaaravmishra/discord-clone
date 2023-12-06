"use client";

import axios from "@/lib/axios";
import { useCallStore } from "@/store/call-store";
import { useUser } from "@clerk/nextjs";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";

interface MediaRoomProps {
	chatId: string;
	audio: boolean;
	video: boolean;
	apiUrl: string;
	type: "channel" | "conversation";
	profileId: string;
}

const MediaRoom = ({
	chatId,
	audio,
	video,
	type,
	profileId,
}: MediaRoomProps) => {
	const { user } = useUser();
	const [token, setToken] = useState("");

	const router = useRouter();

	const { ongoingCall } = useCallStore();

	const handleOnDisconnected = () => {
		router.back();

		if (type === "conversation") {
			const url = qs.stringifyUrl({
				url: "/api/socket/call",
			});

			const payload = {
				callId: ongoingCall?.id,
				isEnded: true,
				endedBy: profileId,
			};

			axios.patch(url, payload);

			return;
		}
	};

	useEffect(() => {
		if (!user?.fullName) {
			return;
		}

		const name = user?.fullName?.trim();
		(async () => {
			try {
				const res = await fetch(`/api/livekit?room=${chatId}&username=${name}`);
				const data = await res.json();

				setToken(data.token);
			} catch (error) {
				console.error("[MediaRoom]", error);
			}
		})();
	}, [chatId, user]);

	if (token === "") {
		return (
			<div className="flex flex-col flex-1 justify-center items-center">
				<Loader2
					className="animate-spin h-7 w-7 text-zinc-500 my-4"
					size={48}
				/>
				<p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading...</p>
			</div>
		);
	}

	return (
		<LiveKitRoom
			data-lk-theme="default"
			serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
			token={token}
			connect={true}
			video={video}
			audio={audio}
			onDisconnected={handleOnDisconnected}
		>
			<VideoConference />
		</LiveKitRoom>
	);
};

export default MediaRoom;
