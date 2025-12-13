"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderHistory } from "./order-history";
import { FavoritesList } from "./favorites-list";
import { AccountSettings } from "./account-settings";
import { SellerMessages } from "./seller-messages";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

export function ProfileTabs() {
	const { data: unreadCount } = api.chat.getUnreadCount.useQuery(undefined, {
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	return (
		<Tabs className="w-full" defaultValue="settings">
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="settings">Settings</TabsTrigger>
				<TabsTrigger value="orders">Orders</TabsTrigger>
				<TabsTrigger value="messages" className="relative">
					Messages
					{unreadCount && unreadCount > 0 ? (
						<Badge
							variant="destructive"
							className="ml-2 h-5 min-w-5 px-1 text-xs">
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					) : null}
				</TabsTrigger>
			</TabsList>

			<TabsContent value="orders" className="mt-6">
				<OrderHistory />
			</TabsContent>

			<TabsContent value="messages" className="mt-6">
				<SellerMessages />
			</TabsContent>

			<TabsContent value="settings" className="mt-6">
				<AccountSettings />
			</TabsContent>
		</Tabs>
	);
}
