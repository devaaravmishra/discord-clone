import { db } from "@/lib/db";
import { redirect } from "next/navigation";

import { ModeToggle } from "@/components/mode-toggle";
import { NavigationAction } from "@/components/navigation/navigation-action";
import { NavigationItem } from "@/components/navigation/navigation-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import UserProfile from "../user-profile";

export const NavigationSidebar = async () => {
	const profile = await currentProfile();

	if (!profile) {
		redirect("/");
	}

	const servers = await db.server.findMany({
		where: {
			members: {
				some: {
					profileId: profile.id,
				},
			},
		},
	});

	if (!servers) {
		return null;
	}

	return (
		<div className="space-y-4 flex flex-col items-center text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3 h-full">
			<NavigationAction />
			<Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
			<ScrollArea className="flex-1 w-full">
				{servers.map((server) => (
					<div key={server.id} className="mb-4">
						<NavigationItem
							id={server.id}
							imageUrl={server.imageUrl}
							name={server.name}
						/>
					</div>
				))}
			</ScrollArea>
			<div className="pb-3 mt-auto flex flex-col items-center gap-y-4">
				<ModeToggle />
				<UserProfile />
			</div>
		</div>
	);
};
