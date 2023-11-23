import { hasOngoingCall } from "@/lib/calls";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const profile = await currentProfilePages(req);

		if (!profile) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const ongoingCall = await hasOngoingCall(req);

		return res.status(200).json({ ongoingCall });
	} catch (error) {
		console.error("[Ongoing Call] Error: ", error);
	}
}
