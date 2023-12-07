import { ModalProvider } from "@/components/providers/modal-provider";
import QueryProvider from "@/components/providers/query-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { currentProfile } from "@/helpers/current-profile";
import { cn } from "@/utils/cn";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Discord Clone",
	description: "A Discord clone made with Next.js and TailwindCSS",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const profile = await currentProfile();

	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={cn(font.className, "bg-white dark:bg-[#313338] ")}>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						themes={["light", "dark", "system"]}
						storageKey="discord-theme"
					>
						<SocketProvider profileId={profile?.id || ""}>
							<Toaster />
							<ModalProvider />
							<ClerkLoading>
								<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-opacity-50 z-50">
									<div className="relative flex items-center justify-center">
										<div className="w-8 h-8 border-t-2 border-white border-solid rounded-full animate-spin"></div>
										<div className="w-8 h-8 border-t-2 border-white border-solid rounded-full animate-spin absolute"></div>
									</div>
								</div>
							</ClerkLoading>
							<ClerkLoaded>
								<QueryProvider>{children}</QueryProvider>
							</ClerkLoaded>
						</SocketProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
