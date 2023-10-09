"use client";

import { Smile } from "lucide-react";
import { useTheme } from "next-themes";

const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import dynamic from "next/dynamic";

interface EmojiPickerProps {
	onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
	const { resolvedTheme } = useTheme();

	<div className="hidden">
		<Picker />
	</div>;

	return (
		<Popover>
			<PopoverTrigger>
				<Smile
					className=" text-zinc-500 dark:text-zinc-400
         hover:text-zinc-600 dark:hover:text-zinc-300 transition"
				/>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				sideOffset={40}
				className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
			>
				<Picker
					theme={resolvedTheme}
					data={async () => {
						const response = await fetch(
							"https://cdn.jsdelivr.net/npm/@emoji-mart/data/sets/14/native.json",
						);

						return response.json();
					}}
					onEmojiSelect={(emoji: any) => onChange(emoji.native)}
				/>
			</PopoverContent>
		</Popover>
	);
};

export default EmojiPicker;
