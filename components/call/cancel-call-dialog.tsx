"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CancelCallDialogProps {
	onCancel: () => void;
	onClose: () => void;
	isOpen: boolean;
}

const CancelCallDialog = ({
	onCancel,
	onClose,
	isOpen,
}: CancelCallDialogProps) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogTrigger>
				<button
					onClick={onCancel}
					className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
				>
					Cancel Call
				</button>
			</AlertDialogTrigger>

			<AlertDialogContent className="bg-white dark:bg-[#313338] text-black dark:text-white">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-2xl font-bold text-center">
						Confirm Cancellation
					</AlertDialogTitle>
				</AlertDialogHeader>

				<AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400">
					Are you sure you want to cancel this call?
				</AlertDialogDescription>

				<AlertDialogFooter className="flex justify-center items-center">
					<AlertDialogAction
						onClick={onCancel}
						className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
					>
						Yes, Cancel Call
					</AlertDialogAction>

					<AlertDialogCancel
						onClick={onClose}
						className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ml-2"
					>
						No, Keep Call
					</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default CancelCallDialog;
