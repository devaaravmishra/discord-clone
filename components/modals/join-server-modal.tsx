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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "../ui/input";

const JoinServerModal = () => {
	const router = useRouter();

	const { isOpen, onClose, type, onOpen } = useModal();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const inviteCodeRef = useRef("");

	const isModalOpen = isOpen && type === "joinServer";

	const handleClose = () => {
		setError("");
		onClose();
	};

	const urlRegex = new RegExp(
		`^${location.origin}/invite/([a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8})$`,
	);

	const inviteCodeRegex = new RegExp(
		`^([a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8})$`,
	);

	const handleJoinServer = () => {
		setIsLoading(true);

		if (inviteCodeRef.current) {
			const inviteCode = inviteCodeRef.current;

			if (inviteCodeRegex.test(inviteCode)) {
				router.push(`${location.origin}/invite/${inviteCode}`);
				onClose();
			}

			if (urlRegex.test(inviteCode)) {
				router.push(inviteCode);
				onClose();
			}

			if (!urlRegex.test(inviteCode) && !inviteCodeRegex.test(inviteCode)) {
				setError("Invalid invite code.");
			}
		}

		if (!inviteCodeRef.current) {
			setError("Invite code is required.");
		}

		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={handleClose}>
			<DialogContent className="bg-white text-black p-0 overflow-hidden">
				<DialogHeader className="pt-6 px-6">
					<DialogTitle className="text-2xl font-bold text-center">
						Join a Server
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-500">
						Enter an invite below to join an existing server.
					</DialogDescription>
				</DialogHeader>

				<div className="px-6 py-3">
					<div className="flex">
						<p
							className={cn(
								"uppercase font-bold text-xs  text-zinc-500 mr-2",
								error && "text-red-500",
								"transition-colors duration-200 ease-in-out",
							)}
						>
							Invite Link <span className="text-red-500">*</span>
						</p>
						{error && (
							<span className="text-red-500 text-xs italic font-medium">
								- {error}
							</span>
						)}
					</div>
					<div className="flex items-center justify-center mt-1">
						<Input
							onChange={(e) => {
								inviteCodeRef.current = e.target.value;
								setError("");
							}}
							placeholder={location.origin + "/invite/invite-code"}
							className="bg-zinc-400/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 placeholder:text-zinc-500"
						/>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 bg-gray-100">
					<div className="flex flex-1 justify-between">
						<button
							type="button"
							onClick={() => {
								setError("");
								onOpen("createServer");
							}}
						>
							<p className="text-black text-sm font-medium">Back</p>
						</button>
						<Button
							variant="primary"
							disabled={isLoading}
							onClick={handleJoinServer}
						>
							Join Server
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default JoinServerModal;
