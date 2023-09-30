import Image from "next/image";
import React from "react";

import dots from "@/public/typing-indicator.gif";

interface ChatTypingIndicatorProps {
	members: string[];
}

const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({
	members,
}) => {
	const renderTypingText = () => {
		if (members.length === 1) {
			return `${members[0]} is typing...`;
		} else if (members.length === 2) {
			return `${members[0]} and ${members[1]} are typing...`;
		} else if (members.length > 2) {
			return `${members[0]}, ${members[1]}, and ${
				members.length - 2
			} others are typing...`;
		} else {
			return "";
		}
	};

	return (
		<div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
			{members.length > 0 && (
				<div className="flex items-center">
					<Image src={dots} alt="dots" width={40} height={40} />
					<p className="text-sm">{renderTypingText()}</p>
				</div>
			)}
		</div>
	);
};

export default ChatTypingIndicator;
