"use client";

import { MoreHorizontal, Plus, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Address, ShippingProfile } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ActiveListings } from "./active-listings";
import { AddressForm } from "./address-form/address-form";
import { SalesHistory } from "./sales-history";
import { SellerStats } from "./seller-stats";
import { ShippingProfilesForm } from "./shipping-profiles-form/shipping-profiles-form";
import { Skeleton } from "../ui/skeleton";

export function SellerDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold font-playfair text-2xl text-foreground md:text-3xl">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings and track your sales</p>
        </div>

        <Button onClick={() => router.push("/sell/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          List New Part
        </Button>
      </div>

      {/* Stats Overview */}
      <SellerStats />

      {/* Main Content */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings">Active Listings</TabsTrigger>
          <TabsTrigger value="addresses-shipping">Addresses & Shipping</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <ActiveListings />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesHistory />
        </TabsContent>

        <TabsContent value="addresses-shipping" className="mt-6">
          <div className="space-y-4">
            <Addresses />
            <Shipping />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export function Addresses() {
  const addresses = api.address.getAllAddresses.useQuery()
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: deleteAddress, isPending: deleteAddressPending } = api.address.deleteAddress.useMutation()

  const [currentAddress, setCurrentAddress] = useState<Address | null>(null)
  const [currentDeleteAddress, setCurrentDeleteAddress] = useState<Address | null>(null)
  return <Card>
    {/*  */}
    <Dialog open={currentAddress !== null} onOpenChange={() => setCurrentAddress(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
          <DialogDescription>
            Edit your address.
          </DialogDescription>
        </DialogHeader>
        <AddressForm address={currentAddress} onSuccess={() => setCurrentAddress(null)} />
      </DialogContent>
    </Dialog>
    {/*  */}
    <Dialog open={currentDeleteAddress !== null} onOpenChange={() => setCurrentDeleteAddress(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Address</DialogTitle>
          <DialogDescription>
            Delete your address.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this address?</p>
          <p>{currentDeleteAddress?.fullName}</p>
          <p>{currentDeleteAddress?.city}, {currentDeleteAddress?.state}, {currentDeleteAddress?.phone}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCurrentDeleteAddress(null)}>
            Cancel
          </Button>
          <LoadingButton loading={deleteAddressPending} onClick={() => deleteAddress({ id: currentDeleteAddress?.id ?? "", isDefault: currentDeleteAddress?.isDefault ?? false }, { onSuccess: () => { setCurrentDeleteAddress(null); utils.address.getAllAddresses.invalidate() } })} disabled={deleteAddressPending}>
            Delete
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
    {/*  */}
    <CardHeader className="flex items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Addresses
        </CardTitle>
        <CardDescription>
          Manage your addresses.
        </CardDescription>
      </div>
      <Button onClick={() => router.push("/sell/addresses")} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        Add Address
      </Button>
    </CardHeader>


    <CardContent>

      {addresses?.isPending ? <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div> : null}

      {addresses.data?.map((address) => (
        <div className="flex border p-3 rounded-md my-2 items-center justify-between space-y-2" key={address.id}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground line-clamp-2">{address.fullName}
                {address.isDefault && <Badge className="ml-2">Default</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">{address.city}, {address.state}, {address.phone}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setCurrentAddress(address)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCurrentDeleteAddress(address)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </CardContent>
  </Card>
}

export function Shipping() {
  const shippingProfiles = api.shipping.getAllShippingProfiles.useQuery()
  const utils = api.useUtils()
  const router = useRouter()

  const { mutateAsync: deleteShippingProfile, isPending: deleteShippingProfilePending } = api.shipping.deleteShippingProfile.useMutation()

  const [currentShippingProfile, setCurrentShippingProfile] = useState<ShippingProfile | null>(null)
  const [currentDeleteShippingProfile, setCurrentDeleteShippingProfile] = useState<ShippingProfile | null>(null)
  return <Card>

    {/*  */}
    <Dialog open={currentShippingProfile !== null} onOpenChange={() => setCurrentShippingProfile(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shipping Profile</DialogTitle>
          <DialogDescription>
            Edit your shipping profile.
          </DialogDescription>
        </DialogHeader>
        <ShippingProfilesForm profile={currentShippingProfile} onSuccess={() => setCurrentShippingProfile(null)} />
      </DialogContent>
    </Dialog>
    {/*  */}
    <Dialog open={currentDeleteShippingProfile !== null} onOpenChange={() => setCurrentDeleteShippingProfile(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Shipping Profile</DialogTitle>
          <DialogDescription>
            Delete your shipping profile.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>Are you sure you want to delete this shipping profile?</p>
          <p>{currentDeleteShippingProfile?.name}</p>
          <p>{currentDeleteShippingProfile?.baseCost}, {currentDeleteShippingProfile?.freeShippingThreshold}, {currentDeleteShippingProfile?.estimatedDaysMin}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setCurrentDeleteShippingProfile(null)}>
            Cancel
          </Button>
          <LoadingButton loading={deleteShippingProfilePending} onClick={() => deleteShippingProfile({ id: currentDeleteShippingProfile?.id ?? "", isDefault: currentDeleteShippingProfile?.isDefault ?? false }, { onSuccess: () => { setCurrentDeleteShippingProfile(null); utils.shipping.getAllShippingProfiles.invalidate() } })} disabled={deleteShippingProfilePending}>
            Delete
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
    {/*  */}

    <CardHeader className="flex items-center justify-between">
      <div>

        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping
        </CardTitle>
        <CardDescription>
          Manage your shipping profiles.
        </CardDescription>
      </div>
      <Button onClick={() => router.push("/sell/shipping")} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        Add Shipping Profile
      </Button>
    </CardHeader>
    <CardContent>

      {shippingProfiles?.isPending ? <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div> : null}

      {shippingProfiles.data?.map((profile) => (
        <div className="flex border p-3 rounded-md my-2 items-center justify-between space-y-2" key={profile.id}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground line-clamp-2">{profile.name}
                {profile.isDefault && <Badge className="ml-2">Default</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.baseCost}, {profile.carrier}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setCurrentShippingProfile(profile)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCurrentDeleteShippingProfile(profile)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </CardContent>
  </Card>
}