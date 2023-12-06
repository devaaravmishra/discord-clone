"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { Profile } from "@prisma/client";
import UserAvatar from "./user-avatar";

interface UserAvatarWraperProps {
	imageUrl: string;
	profile: Profile;
}

const UserAvatarWraper = ({ imageUrl, profile }: UserAvatarWraperProps) => {
	const { isUserOnline } = useOnlineStatus(profile || ({} as Profile));

	return <UserAvatar src={imageUrl} isOnline={isUserOnline} />;
};

export default UserAvatarWraper;
