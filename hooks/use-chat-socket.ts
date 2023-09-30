import { useSocket } from "@/components/providers/socket-provider";
import { MessageWithMemberWithProfile } from "@/types/server";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
	addKey: string;
	updateKey: string;
	queryKey: string;
};

export const useChatSocket = ({
	addKey,
	updateKey,
	queryKey,
}: ChatSocketProps) => {
	const { socket } = useSocket();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!socket) {
			return;
		}

		socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				if (!oldData || !oldData.pages || oldData.pages.length === 0) {
					return oldData;
				}

				const newPages = oldData.pages.map((page: any) => {
					return {
						...page,
						items: page.items.map((item: MessageWithMemberWithProfile) => {
							if (item.id === message.id) {
								return message;
							}

							return item;
						}),
					};
				});

				return {
					...oldData,
					pages: newPages,
				};
			});
		});

		socket.on(addKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				if (!oldData || !oldData.pages || oldData.pages.length === 0) {
					return {
						pages: [
							{
								items: [message],
							},
						],
					};
				}

				// create a new array of pages
				const newData = [...oldData.pages];

				// add the new message to the first page
				newData[0] = {
					...newData[0],
					items: [message, ...newData[0].items],
				};

				return {
					...oldData,
					pages: newData,
				};
			});
		});

		return () => {
			socket.off(updateKey, () => {});
			socket.off(addKey, () => {});
		};
	}, [addKey, queryClient, queryKey, socket, updateKey]);
};
