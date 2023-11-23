import { useCallback, useEffect } from "react";
import { toast } from "sonner";

const useNetworkStatus = () => {
	const handleOnline = useCallback(() => {
		toast.success("You are now online");
	}, []);

	const handleOffline = useCallback(() => {
		toast.error("You are now offline");
	}, []);

	useEffect(() => {
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);
};

export default useNetworkStatus;
