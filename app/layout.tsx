import { ModalProvider } from "@/components/providers/modal-provider";
import QueryProvider from "@/components/providers/query-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { currentProfile } from "@/lib/current-profile";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
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
							<QueryProvider>{children}</QueryProvider>
						</SocketProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
