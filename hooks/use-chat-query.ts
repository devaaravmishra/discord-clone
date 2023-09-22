import { useSocket } from "@/components/providers/socket-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import ms from "ms";
import qs from "query-string";

interface ChatQueryProps {
	queryKey: string;
	apiUrl: string;
	paramKey: "channelId" | "conversationId";
	paramValue: string;
}

export const useChatQuery = ({
	queryKey,
	apiUrl,
	paramKey,
	paramValue,
}: ChatQueryProps) => {
	const { isConnected } = useSocket();

	const fetchMessages = async ({ pageParam = undefined }) => {
		const url = qs.stringifyUrl(
			{
				url: apiUrl,
				query: {
					[paramKey]: paramValue,
					cursor: pageParam,
				},
			},
			{ skipNull: true },
		);

		const res = await axios.get(url);

		return res.data;
	};

	const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: [queryKey, [paramKey]],
			queryFn: fetchMessages,
			getNextPageParam: (lastPage) => lastPage?.nextCursor,
			enabled: isConnected,
			refetchInterval: isConnected ? false : ms("1s"),
		});

	return {
		data,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		status,
	};
};
