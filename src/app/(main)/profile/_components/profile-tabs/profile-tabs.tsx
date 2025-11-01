"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderHistory } from "./order-history";
import { FavoritesList } from "./favorites-list";
import { AccountSettings } from "./account-settings";
// import { OrderHistory } from "./order-history"
// import { FavoritesList } from "./favorites-list"
// import { AccountSettings } from "./account-settings"

export function ProfileTabs() {
  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="mt-6">
        <OrderHistory />
      </TabsContent>

      <TabsContent value="favorites" className="mt-6">
        <FavoritesList />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <AccountSettings />
      </TabsContent>
    </Tabs>
  );
}
