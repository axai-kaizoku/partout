"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
	Dialog as Alert,
	DialogDescription as AlertDescription,
} from "@/components/ui/dialog";
import { User, Lock, Bell, Shield, Trash2 } from "lucide-react";
// import { useAuth } from "@/hooks/use-auth"

export function AccountSettings() {
	// const { user } = useAuth()
	const [isEditing, setIsEditing] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		location: "Los Angeles, CA",
	});
	const [notifications, setNotifications] = useState({
		orderUpdates: true,
		promotions: false,
		newMessages: true,
		priceAlerts: true,
	});

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		setIsEditing(false);
		setShowSuccess(true);
		setTimeout(() => setShowSuccess(false), 3000);
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNotificationChange = (field: string, value: boolean) => {
		setNotifications((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="space-y-6">
			{showSuccess && (
				<Alert>
					<Shield className="h-4 w-4" />
					<AlertDescription>
						Your settings have been saved successfully.
					</AlertDescription>
				</Alert>
			)}

			{/* Personal Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Personal Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSave} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									disabled={!isEditing}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleChange("email", e.target.value)}
									disabled={!isEditing}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => handleChange("phone", e.target.value)}
									disabled={!isEditing}
									placeholder="(555) 123-4567"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									value={formData.location}
									onChange={(e) => handleChange("location", e.target.value)}
									disabled={!isEditing}
								/>
							</div>
						</div>

						<div className="flex gap-2">
							{isEditing ? (
								<>
									<Button type="submit">Save Changes</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsEditing(false)}>
										Cancel
									</Button>
								</>
							) : (
								<Button type="button" onClick={() => setIsEditing(true)}>
									Edit Profile
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Security */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Security
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Password</p>
							<p className="text-sm text-muted-foreground">
								Last changed 3 months ago
							</p>
						</div>
						<Button variant="outline">Change Password</Button>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Two-Factor Authentication</p>
							<p className="text-sm text-muted-foreground">
								Add an extra layer of security
							</p>
						</div>
						<Button variant="outline">Enable 2FA</Button>
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notification Preferences
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Order Updates</p>
							<p className="text-sm text-muted-foreground">
								Get notified about order status changes
							</p>
						</div>
						<Switch
							checked={notifications.orderUpdates}
							onCheckedChange={(checked) =>
								handleNotificationChange("orderUpdates", checked)
							}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Promotions & Deals</p>
							<p className="text-sm text-muted-foreground">
								Receive emails about special offers
							</p>
						</div>
						<Switch
							checked={notifications.promotions}
							onCheckedChange={(checked) =>
								handleNotificationChange("promotions", checked)
							}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">New Messages</p>
							<p className="text-sm text-muted-foreground">
								Get notified when sellers message you
							</p>
						</div>
						<Switch
							checked={notifications.newMessages}
							onCheckedChange={(checked) =>
								handleNotificationChange("newMessages", checked)
							}
						/>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Price Alerts</p>
							<p className="text-sm text-muted-foreground">
								Get notified when favorited items go on sale
							</p>
						</div>
						<Switch
							checked={notifications.priceAlerts}
							onCheckedChange={(checked) =>
								handleNotificationChange("priceAlerts", checked)
							}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-destructive/20 w-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<Trash2 className="h-5 w-5" />
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Delete Account</p>
							<p className="text-sm text-muted-foreground">
								Permanently delete your account and all associated data
							</p>
						</div>
						{/* <Button variant="destructive" className="bg-transparent">
							Delete Account
						</Button> */}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
