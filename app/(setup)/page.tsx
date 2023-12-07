import InitialModal from "@/components/modals/initial-modal";
import { initialProfile } from "@/helpers/initial-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const SetupPage = async () => {
	const profile = await initialProfile();

	// find this prfoile if it is a member of a server
	const server = await db.server.findFirst({
		where: {
			members: {
				some: {
					profileId: profile?.id,
				},
			},
		},
	});

	if (server) {
		// redirect to the server
		return redirect(`/servers/${server.id}`);
	}

	return <InitialModal />;
};

export default SetupPage;
