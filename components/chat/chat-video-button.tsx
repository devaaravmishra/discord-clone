"use client";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import axios from "@/lib/axios";
import { useCallStore } from "@/store/call-store";
import { MemberWithProfile } from "@/types/server";
import { Video, VideoOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { toast } from "sonner";

interface ChatVideoButtonProps {
	callerId: string;
	callee: MemberWithProfile;
	conversationId: string;
	serverId: string;
}

export const ChatVideoButton = ({
	callee,
	callerId,
	conversationId,
}: ChatVideoButtonProps) => {
	const { onOpen, onClose } = useModal();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const isVideo = searchParams?.get("video");

	const Icon = isVideo ? VideoOff : Video;
	const tooltipLabel = isVideo ? "Turn off video" : "Turn on video";

	const { setOngoingCall } = useCallStore();

	// hit call api to send notification to other user
	const handleOnCall = async () => {
		onOpen("outgoingCall", {
			callee,
		});

		const url = qs.stringifyUrl({
			url: "/api/socket/call",
			query: {
				conversationId,
				callerId,
			},
		});

		axios
			.post(url)
			.then((res) => {
				if (res?.status == 201) {
					setOngoingCall(res?.data);

					if (res?.data?.isMissed) {
						onClose();
						toast.error("Call missed");
					}
				}
			})
			.catch((err) => {
				toast.error(err?.response?.data?.message || "Something went wrong");

				onClose();
			});
	};

	const onCallEnd = () => {
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
	};

	return (
		<ActionTooltip side="bottom" label={tooltipLabel}>
			<button
				onClick={() => {
					if (!isVideo) {
						handleOnCall();
					}

					if (isVideo) {
						onCallEnd();
					}
				}}
				className="hover:opacity-75 transition mr-4"
			>
				<Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
			</button>
		</ActionTooltip>
	);
};
