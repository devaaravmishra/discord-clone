"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import qs from "query-string";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Member, MemberRole, Profile } from "@prisma/client";

import { ActionTooltip } from "@/components/action-tooltip";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/user-avatar";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

interface ChatItemProps {
	id: string;
	content: string;
	member: Member & {
		profile: Profile;
	};
	timeStamp: string;
	fileUrl: string | null;
	deleted: boolean;
	currentMember: Member;
	isUpdated: boolean;
	socketUrl: string;
	socketQuery: Record<string, string>;
}

const roleIcons = {
	GUEST: null,
	MODERATOR: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
	ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

const formSchema = z.object({
	content: z.string().nonempty(),
});

const ChatItem = ({
	id,
	content,
	member,
	timeStamp,
	fileUrl,
	deleted,
	currentMember,
	isUpdated,
	socketUrl,
	socketQuery,
}: ChatItemProps) => {
	const router = useRouter();
	const params = useParams();

	const [isEditiing, setIsEditiing] = useState(false);
	const { onOpen } = useModal();

	const fileType = fileUrl?.split(".").pop();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content,
		},
	});

	const isAdmin = currentMember.role === MemberRole.ADMIN;
	const isModerator = currentMember.role === MemberRole.MODERATOR;
	const isOwner = member.id === currentMember.id;
	const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
	const canEditMessage = !deleted && isOwner && !fileUrl;

	const isPdf = fileType === "pdf" && fileUrl;
	const isImage = !isPdf && fileUrl;

	const isLoading = form.formState.isSubmitting;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			const url = qs.stringifyUrl({
				url: `${socketUrl}/${id}`,
				query: socketQuery,
			});

			await axios.patch(url, values);

			form.reset();
			setIsEditiing(false);
		} catch (error) {
			console.error("[ChatItem] onSubmit error", error);
		}
	};

	const onMemberClick = () => {
		if (member.id === currentMember.id) {
			return;
		}

		router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
	};

	useEffect(() => {
		form.reset({
			content: content,
		});
	}, [content]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" || e.key === "Enter") {
				setIsEditiing(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isEditiing]);

	return (
		<div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
			<div className="group flex gap-x-2 items-center w-full">
				<div
					onClick={onMemberClick}
					className="cursor-pointer hover:drop-shadow-md transition"
				>
					<UserAvatar src={member.profile.imageUrl} />
				</div>
				<div className="flex flex-col w-full">
					<div className="flex items-center gap-x-2">
						<div className="flex items-center">
							<p
								onClick={onMemberClick}
								className="text-sm font-semibold hover:underline cursor-pointer mr-1"
							>
								{member.profile.name}
							</p>
							<ActionTooltip label={member.role}>
								{roleIcons[member.role]}
							</ActionTooltip>
						</div>
						<span className="text-sm text-zinc-500 dark:text-zinc-400">
							{timeStamp}
						</span>
					</div>
					{isImage && (
						<a
							href={fileUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="relative aspect-square rounded-md overflow-hidden border flex items-center bg-secondary h-48 w-48"
						>
							<Image
								src={fileUrl}
								alt="Image"
								className="object-cover object-center"
								width={200}
								height={200}
							/>
						</a>
					)}
					{isPdf && (
						<div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
							<FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
							<a
								href={fileUrl}
								target="_blank"
								rel="noopener norefferrer"
								className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
							>
								PDF File
							</a>
						</div>
					)}
					{!fileUrl && !isEditiing && (
						<p
							className={cn(
								"text-sm text-zinc-600 dark:text-zinc-300",
								deleted &&
									"italic text-zinc-500 dark:text-zinc-400 text-sm mt-1",
							)}
						>
							{content}
							{isUpdated && !deleted && (
								<span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
									(edited)
								</span>
							)}
						</p>
					)}
					{!fileUrl && isEditiing && (
						<Form {...form}>
							<form
								className="flex items-center pt-2 gap-x-2 w-full"
								onSubmit={form.handleSubmit(onSubmit)}
							>
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<FormControl>
											<div className="relative w-full">
												<Input
													disabled={isLoading}
													className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75
                      border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0
                      text-zinc-600 dark:text-zinc-200"
													placeholder="Edit your message"
													{...field}
												/>
											</div>
										</FormControl>
									)}
								/>
								<Button size="sm" variant="primary">
									Save
								</Button>
							</form>
							<span className="text-[10px] mt-1 text-zinc-400">
								Press escape to cancel, Enter to save
							</span>
						</Form>
					)}
				</div>
			</div>
			{canDeleteMessage && (
				<div
					className="hidden group-hover:flex items-center gap-x-2 absolute 
        p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm"
				>
					{canEditMessage && (
						<ActionTooltip label="Edit">
							<Edit
								className="h-4 w-4 text-zinc-500 dark:text-zinc-400
                hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer ml-auto transition"
								onClick={() => setIsEditiing(true)}
							/>
						</ActionTooltip>
					)}
					{canDeleteMessage && (
						<ActionTooltip label="Delete">
							<Trash
								className="h-4 w-4 text-zinc-500 dark:text-zinc-400
                hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer ml-auto transition"
								onClick={() =>
									onOpen("deleteMessage", {
										apiUrl: `${socketUrl}/${id}`,
										query: socketQuery,
									})
								}
							/>
						</ActionTooltip>
					)}
				</div>
			)}
		</div>
	);
};

export default ChatItem;
