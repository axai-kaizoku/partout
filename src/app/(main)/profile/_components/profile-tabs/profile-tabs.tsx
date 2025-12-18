"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { AccountSettings } from "./account-settings";
import { OrderHistory } from "./order-history";
import { SellerMessages } from "./seller-messages";

export function ProfileTabs() {
  const { data: unreadCount } = api.chat.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const [activeTab, setActiveTab] = useState("settings");

  return (
    <Tabs
      className="w-full"
      defaultValue="settings"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="hidden w-full md:grid md:grid-cols-3">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="messages" className="relative">
          Messages
          {unreadCount && unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="ml-2 h-5 min-w-5 px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
      </TabsList>

      <Select value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <SelectTrigger className="w-full md:hidden">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="settings">Settings</SelectItem>
          <SelectItem value="messages" className="relative">
            Messages
            {unreadCount && unreadCount > 0 ? (
              <Badge
                variant="destructive"
                className="ml-2 h-5 min-w-5 px-1 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            ) : null}
          </SelectItem>
          <SelectItem value="orders">Orders</SelectItem>
        </SelectContent>
      </Select>

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
