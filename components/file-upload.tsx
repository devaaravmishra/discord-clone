"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";

import "@uploadthing/react/styles.css";

interface FileUploadProps {
	onChange: (url: string) => void;
	value: string;
	endpoint: "messageFile" | "serverImage";
}

const FileUpload = ({ endpoint, onChange, value }: FileUploadProps) => {
	const fileType = value?.split(".").pop();

	if (value && fileType !== "pdf") {
		return (
			<div className="relative h-20 w-20">
				<Image
					src={value}
					layout="fill"
					objectFit="cover"
					alt="Uploaded image"
					className="rounded-full"
				/>
				<button
					className="absolute top-0 right-0 p-1 bg-rose-500 text-white rounded-full shadow-sm"
					type="button"
					onClick={() => onChange("")}
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		);
	}

	if (value && fileType === "pdf") {
		return (
			<div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
				<FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
				<a
					href={value}
					target="_blank"
					rel="noopener norefferrer"
					className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
				>
					{value}
				</a>
				<button
					className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-sm"
					type="button"
					onClick={() => onChange("")}
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		);
	}

	return (
		<div>
			<UploadDropzone
				endpoint={endpoint}
				onClientUploadComplete={(res) => {
					onChange(res?.[0]?.url as string);
				}}
				onUploadError={(err) => {
					console.error(err);
				}}
			/>
		</div>
	);
};

export default FileUpload;
