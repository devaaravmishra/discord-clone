"use client";

import { UserButton } from "@clerk/nextjs";
import { useSocket } from "../providers/socket-provider";

const UserProfile = () => {
	const { isConnected } = useSocket();

	return (
		<div className="relative">
			<UserButton
				afterSignOutUrl="/"
				appearance={{
					elements: {
						avatarBox: "h-[48px] w-[48px]",
					},
				}}
			/>
			{isConnected ? (
				<div className="h-3 w-3 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-white"></div>
			) : (
				<div className="h-3 w-3 rounded-full bg-orange-500 absolute bottom-0 right-0 border-2 border-white"></div>
			)}
		</div>
	);
};

export default UserProfile;
