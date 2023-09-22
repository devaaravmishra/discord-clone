"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useForm } from "react-hook-form";
import * as z from "zod";

import EmojiPicker from "@/components/emoji-picker";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";

interface ChatInputProps {
	apiUrl: string;
	query: Record<string, string>;
	name: string;
	type: "conversation" | "channel";
}

const formSchema = z.object({
	content: z.string().nonempty(),
});

const ChatInput = ({ apiUrl, name, query, type }: ChatInputProps) => {
	const router = useRouter();
	const { onOpen } = useModal();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	});

	const isLoading = form.formState.isSubmitting;

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			const url = qs.stringifyUrl({ url: apiUrl, query });

			await axios.post(url, data);
			form.reset();
			router.refresh();
		} catch (error) {
			console.error("[ChatInput onSubmit]", error);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="relative p-4 pb-6">
									<button
										onClick={() => onOpen("messageFile", { apiUrl, query })}
										type="button"
										className="absolute top-7 left-8 h-[24px] w-[24px]
                    bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-400 dark:hover:bg-zinc-300
                    transition rounded-full flex items-center justify-center p-1"
									>
										<Plus className="w-5 h-5 text-white dark:text-[#313338]" />
									</button>
									<Input
										disabled={isLoading}
										className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0
                      focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
										placeholder={`Message ${
											type === "channel" ? "#" : ""
										}${name}`}
										{...field}
									/>
									<div className="absolute top-7 right-8">
										<EmojiPicker
											onChange={(emoji: string) =>
												field.onChange(`${field.value} ${emoji}`)
											}
										/>
									</div>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};

export default ChatInput;
