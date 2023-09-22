"use client";

import qs from "query-string";
import { useState } from "react";

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
import axios from "axios";

const DeleteMessageModal = () => {
	const { isOpen, onClose, type, data } = useModal();

	const isModalOpen = isOpen && type === "deleteMessage";
	const { apiUrl, query } = data;

	const [isLoading, setIsLoading] = useState(false);

	const onDelete = async () => {
		try {
			setIsLoading(true);

			const url = qs.stringifyUrl({
				url: apiUrl || "",
				query,
			});

			await axios.delete(url);

			onClose();
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className="bg-white text-black p-0 overflow-hidden">
				<DialogHeader className="pt-6 px-6">
					<DialogTitle className="text-2xl font-bold text-center">
						Delete Message
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-500">
						Are you sure you want to do this <br />
						The message will be permanently deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="bg-gray-100 px-6 py-4">
					<div className="flex items-center justify-between w-full">
						<Button disabled={isLoading} onClick={onClose} variant="ghost">
							Cancel
						</Button>
						<Button variant="primary" disabled={isLoading} onClick={onDelete}>
							Delete
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteMessageModal;
