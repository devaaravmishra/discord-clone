import { currentUser, redirectToSignIn } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const initialProfile = async () => {
	const user = await currentUser();

	if (!user) {
		redirectToSignIn();
		return;
	}

	const profile = await db.profile.findUnique({
		where: { userId: user.id },
	});

	if (profile) {
		return profile;
	}

	const fullName = `${user?.firstName} ${user?.lastName ?? ""}`.trim();

	const newProfile = await db.profile.create({
		data: {
			userId: user.id,
			name: fullName,
			email: user.emailAddresses[0].emailAddress,
			imageUrl: user?.imageUrl,
		},
	});

	return newProfile;
};
