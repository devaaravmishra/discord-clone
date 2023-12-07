import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";

interface UserAvatarProps {
	src?: string;
	className?: string;
	isOnline?: boolean;
}

const UserAvatar = ({ className, src, isOnline }: UserAvatarProps) => {
	return (
		<div className="relative">
			<Avatar className={cn("relative", className)}>
				<AvatarImage src={src} alt="avatar" />
			</Avatar>
			<span
				className={cn(
					"absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
					{
						"bg-green-500": isOnline,
						"bg-orange-500": !isOnline,
					},
				)}
			/>
		</div>
	);
};
export default UserAvatar;
