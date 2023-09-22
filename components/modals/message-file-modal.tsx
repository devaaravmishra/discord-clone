"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

import FileUpload from "@/components/file-upload";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";

const formSchema = z.object({
	fileUrl: z.string().min(1, {
		message: "Attachement is required.",
	}),
});

const MessageFileModal = () => {
	const { data, isOpen, onClose, onOpen, type } = useModal();
	const router = useRouter();

	const { apiUrl, query } = data;

	const isModalOpen = isOpen && type === "messageFile";

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fileUrl: "",
		},
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};

	const isLoading = form.formState.isSubmitting;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const url = qs.stringifyUrl({
				url: apiUrl || "",
				query,
			});
			await axios.post("/api/servers", {
				...values,
				fileUrl: values.fileUrl,
			});

			form.reset();
			router.refresh();
			handleClose();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog onOpenChange={handleClose} open={isModalOpen}>
			<DialogContent className="bg-white text-black p-0 overflow-hidden">
				<DialogHeader className="pt-6 px-6">
					<DialogTitle className="text-2xl font-bold text-center">
						Add an attachment
					</DialogTitle>
					<DialogDescription className="text-center text-zinc-500">
						Upload a file to share with your friends
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<div className="space-y-8 px-6">
							<div className="flex items-center justify-center text-center">
								<FormField
									control={form.control}
									name="fileUrl"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<FileUpload
													endpoint="messageFile"
													value={field.value}
													onChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								></FormField>
							</div>
						</div>
						<DialogFooter className="px-6 py-4 bg-gray-100">
							<Button
								disabled={isLoading}
								type="submit"
								className="w-full"
								variant="primary"
							>
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default MessageFileModal;
