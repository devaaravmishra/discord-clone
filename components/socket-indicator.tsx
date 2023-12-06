"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "@/components/ui/badge";
import { LucideSignalHigh, LucideSignalMedium } from "lucide-react";

const SocketIndicator = () => {
	const { isConnected } = useSocket();

	if (!isConnected) {
		return (
			<Badge variant="outline" className="bg-yellow-600 text-white border-none">
				<LucideSignalMedium className="w-4 h-4 mr-1" />
				Connecting
			</Badge>
		);
	}

	return (
		<Badge
			variant="outline"
			className="bg-emerald-600 text-white flex border-none"
		>
			<LucideSignalHigh className="w-4 h-4 mr-1" />
			<span className="text-xs uppercase font-semibold">Connected</span>
		</Badge>
	);
};

export default SocketIndicator;
