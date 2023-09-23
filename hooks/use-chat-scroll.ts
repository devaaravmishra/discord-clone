import { useEffect, useState } from "react";

type ChatScrollProps = {
	chatRef: React.RefObject<HTMLDivElement>;
	bottomRef: React.RefObject<HTMLDivElement>;
	shouldLoadMore: boolean;
	loadMore: () => void;
	count: number;
};

export const useChatScroll = ({
	chatRef,
	bottomRef,
	shouldLoadMore,
	loadMore,
	count,
}: ChatScrollProps) => {
	const [hasInitialized, setHasInitialized] = useState(false);

	// load more messages when chat scroll is at top
	useEffect(() => {
		const topDiv = chatRef?.current;

		const handleScroll = () => {
			const scrollTop = topDiv?.scrollTop;

			if (scrollTop === 0 && shouldLoadMore) {
				loadMore();
			}
		};

		if (topDiv) {
			topDiv.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (topDiv) {
				topDiv.removeEventListener("scroll", handleScroll);
			}
		};
	}, [chatRef, hasInitialized, loadMore, shouldLoadMore]);

	// scroll to bottom when new message is added
	useEffect(() => {
		const bottomDiv = bottomRef?.current;
		const topDiv = chatRef?.current;

		const shouldAutoScroll = () => {
			if (!hasInitialized && bottomDiv) {
				setHasInitialized(true);
				return true;
			}

			if (!topDiv) {
				return false;
			}

			const distanceFromBottom =
				topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

			return distanceFromBottom <= 100;
		};

		if (shouldAutoScroll()) {
			setTimeout(() => {
				bottomDiv?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [bottomRef, chatRef, count, hasInitialized]);
};
