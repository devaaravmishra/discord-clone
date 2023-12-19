"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { Profile } from "@prisma/client";
import UserAvatar from "./user-avatar";

interface UserAvatarWrapperProps {
	profile: Profile;
}

const UserAvatarWrapper = ({ profile }: UserAvatarWrapperProps) => {
	const { isUserOnline } = useOnlineStatus(profile || ({} as Profile));

	return <UserAvatar src={profile?.imageUrl} isOnline={isUserOnline} />;
};

export default UserAvatarWrapper;
