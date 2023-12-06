"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import axios from "@/lib/axios";
import { MemberWithProfile } from "@/types/server";
import { Profile } from "@prisma/client";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CancelCallDialog from "../call/cancel-call-dialog";
import { Avatar, AvatarImage } from "../ui/avatar";

const IncomingCallModal = () => {
	const {
		isOpen,
		onClose,
		type,
		data: { callData },
	} = useModal();

	const { caller } = callData || {};
	const router = useRouter();

	const isModalOpen = isOpen && type === "incomingCall";
	const [showCancelledDialog, setShowCancelledDialog] = useState(false);

	const handleClose = () => {
		setShowCancelledDialog(true);
	};

	const handleCallCancel = () => {
		setShowCancelledDialog(false);
		onClose();
	};

	const handleCallAccepted = () => {
		onClose();

		const url = qs.stringifyUrl({
			url: "/api/socket/call",
		});

		const payload = {
			callId: callData?.callId,
			isAccepted: true,
			serverId: callData?.serverId,
			callerMemberId: callData?.callerMemberId,
			calleeMemberId: callData?.calleeMemberId,
		};

		const path = `/servers/${callData?.serverId}/conversations/${callData?.callerMemberId}`;

		const pathname = qs.stringifyUrl(
			{
				url: path || "",
				query: {
					video: true,
				},
			},
			{ skipNull: true },
		);

		router.push(pathname);

		axios
			.patch(url, payload)
			.then((res) => {})
			.catch((err) => {
				toast.error(err?.response?.data?.message || "Something went wrong");
			});
	};

	const handleCallRejected = () => {
		const url = qs.stringifyUrl({
			url: "/api/socket/call",
		});

		const payload = {
			callId: callData?.callId,
			isRejected: true,
			serverId: callData?.serverId,
		};

		axios
			.patch(url, payload)
			.then((res) => {
				console.log(
					"🚀 ~ file: incoming-call-modal.tsx:83 ~ .then ~ res:",
					res,
				);
			})
			.catch((err) => {
				console.log(
					"🚀 ~ file: incoming-call-modal.tsx:89 ~ handleCallRejected ~ err:",
					err,
				);

				toast.error(err?.response?.data?.message || "Something went wrong");
			})
			.finally(() => {
				onClose();
			});
	};

	useEffect(() => {
		if (showCancelledDialog) {
			window.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					handleClose();
				}
			});
		}

		return () => {
			window.removeEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					handleClose();
				}
			});
		};
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue =
				"You have an incoming call. Are you sure you want to leave?";
		};

		if (isModalOpen) {
			window.addEventListener("beforeunload", handleBeforeUnload);
		}

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isModalOpen]);

	return (
		<>
			<Dialog onOpenChange={handleClose} open={isModalOpen}>
				<DialogContent className="bg-white dark:bg-[#313338] text-black dark:text-white p-0 items-center">
					<DialogHeader className="pt-6 px-6">
						<Avatar className="mx-auto mt-6 h-20 w-20">
							<AvatarImage
								src={
									(caller as MemberWithProfile)?.profile?.imageUrl ||
									(caller as Profile)?.imageUrl
								}
								alt="avatar"
							/>
						</Avatar>
						<DialogTitle className="text-2xl font-bold text-center">
							Incoming Call
						</DialogTitle>
						<DialogDescription className="text-center text-gray-600 dark:text-gray-400">
							You have an incoming call from{" "}
							{(caller as MemberWithProfile)?.profile?.name ||
								(caller as Profile)?.name}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="px-6 py-4 bg-gray-100 dark:bg-[#313338] justify-center items-center">
						<Button
							onClick={handleCallRejected}
							className="w-full bg-red-500 hover:bg-red-600 text-white"
						>
							Reject
						</Button>
						<Button
							onClick={handleCallAccepted}
							className="w-full bg-green-500 hover:bg-green-600 text-white"
						>
							Accept
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{showCancelledDialog && (
				<CancelCallDialog
					isOpen={showCancelledDialog}
					onCancel={handleCallCancel}
					onClose={() => setShowCancelledDialog(false)}
				/>
			)}
		</>
	);
};

export default IncomingCallModal;
