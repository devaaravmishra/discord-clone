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
import createServerIcon from "@/public/create-server.svg";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const CreateServerModal = () => {
	const { isOpen, onClose, type, onOpen } = useModal();

	const isModalOpen = isOpen && type === "createServer";

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={handleClose}>
			<DialogContent className="bg-white text-black p-0 overflow-hidden">
				<DialogHeader className="pt-6 px-6">
					<DialogTitle className="text-2xl font-bold text-center">
						Create a server
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-500">
						Your server is where you and your friends hang out. Make yours and
						start talking.
					</DialogDescription>
				</DialogHeader>

				<div className="px-6 py-3">
					<button
						onClick={() => onOpen("customizeServer")}
						className="flex justify-center items-center w-full mt-2 hover:bg-gray-200 border-[1px] border-gray-200 rounded-md px-2 py-2"
					>
						<Image
							src={createServerIcon}
							width={48}
							height={48}
							className="object-cover object-center rounded-xl"
							alt="create-server"
						/>
						<p className="ml-4 text-black text-md font-bold">Create My Own</p>
						<ChevronRight className="ml-auto" />
					</button>
				</div>

				<DialogFooter className="px-6 py-4 bg-gray-100">
					<div className="flex flex-1 justify-center items-center flex-col">
						<p className="text-black text-xl font-semibold">
							Have an invite already?
						</p>
						<Button
							onClick={() => onOpen("joinServer")}
							type="submit"
							className="w-full mt-2 bg-zinc-500 hover:bg-zinc-600 text-white"
							variant="default"
						>
							Join a Server
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateServerModal;
