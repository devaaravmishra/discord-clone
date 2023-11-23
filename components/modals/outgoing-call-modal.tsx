"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import { useCallStore } from "@/store/call-store";
import qs from "query-string";
import { useEffect, useState } from "react";
import CancelCallDialog from "../call/cancel-call-dialog";

const OutgoingCallModal = () => {
	const {
		isOpen,
		onClose,
		type,
		data: { callee },
	} = useModal();

	const { ongoingCall } = useCallStore();

	const isModalOpen = isOpen && type === "outgoingCall";
	const [showCancelledDialog, setShowCancelledDialog] = useState(false);

	const handleCallCancel = () => {
		setShowCancelledDialog(false);
		onClose();

		if (!ongoingCall?.id) {
			return;
		}

		const url = qs.stringifyUrl({
			url: "/api/socket/call",
		});

		const payload = {
			callId: ongoingCall?.id,
			isCanceled: true,
		};

		axios.patch(url, payload);
	};

	const handleClose = () => {
		setShowCancelledDialog(true);
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
				"You have an outgoing call. Are you sure you want to leave?";
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
						<Avatar className="mx-auto h-20 w-20">
							<AvatarImage src={callee?.profile?.imageUrl} alt="avatar" />
						</Avatar>
						<DialogTitle className="text-2xl font-bold text-center">
							Outgoing Call
						</DialogTitle>
						<DialogDescription className="text-center text-gray-600 dark:text-gray-400">
							Calling {callee?.profile?.name}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="px-6 py-4 bg-gray-100 dark:bg-[#313338] justify-center items-center">
						<Button
							onClick={handleCallCancel}
							className="w-full bg-red-500 hover:bg-red-600 text-white"
						>
							Cancel
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

export default OutgoingCallModal;
