"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/components/form";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { carriers } from "@/lib/constants/dropdown-data";
import type { ShippingProfile } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { shippingProfilesSchema } from "./validations";

interface Props {
  profile?: ShippingProfile | null;
  onSuccess?: () => void;
}

export const ShippingProfilesForm = ({ profile = null, onSuccess }: Props) => {
  const router = useRouter();

  const utils = api.useUtils();

  const { mutateAsync: createShippingProfile } =
    api.shipping.createShippingProfile.useMutation();

  const { mutateAsync: updateShippingProfile } =
    api.shipping.updateShippingProfile.useMutation();

  const shippingForm = useAppForm({
    defaultValues: {
      name: profile?.name || "",
      baseCost: profile?.baseCost || "",
      freeShippingThreshold: profile?.freeShippingThreshold || "",
      estimatedDaysMin: profile?.estimatedDaysMin || "3",
      estimatedDaysMax: profile?.estimatedDaysMax || "10",
      carrier: profile?.carrier || "",
      isDefault: profile?.isDefault || false,
      isActive: profile?.isActive || true,
    },
    validators: {
      onChange: shippingProfilesSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(
        profile
          ? "Updating shipping profile..."
          : "Creating shipping profile...",
      );
      // console.log(value)
      if (profile) {
        await updateShippingProfile({
          id: profile.id,
          shippingProfile: { ...value },
        })
          .then(() => {
            toast.success("Shipping profile updated successfully !", {
              id: toastId,
            });
            utils.shipping.getAllShippingProfiles.invalidate();
            onSuccess?.();
          })
          .catch(() => {
            toast.error("Failed to update shipping profile !", { id: toastId });
          });
      } else {
        await createShippingProfile(value)
          .then(() => {
            toast.success("Shipping profile created successfully !", {
              id: toastId,
            });
            utils.shipping.getAllShippingProfiles.invalidate();
            onSuccess?.();
          })
          .catch(() => {
            toast.error("Failed to create shipping profile !", { id: toastId });
          });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    shippingForm.handleSubmit();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form id="shippingform" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <shippingForm.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name *"
                    placeholder="e.g., Standard,Express "
                    required
                    maxLength={100}
                  />
                )}
              </shippingForm.AppField>
              <shippingForm.AppField name="carrier">
                {(field) => (
                  <field.SelectField
                    label="Carrier *"
                    placeholder="Select carrier"
                    options={carriers.map((carrier) => ({
                      label: carrier,
                      value: carrier,
                    }))}
                  />
                )}
              </shippingForm.AppField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <shippingForm.AppField name="baseCost">
                {(field) => (
                  <field.TextField
                    label="Base Cost *"
                    placeholder="e.g., 10"
                    type="number"
                    min={0}
                    max={1000000}
                    required
                    maxLength={100}
                  />
                )}
              </shippingForm.AppField>
              <shippingForm.AppField name="freeShippingThreshold">
                {(field) => (
                  <field.TextField
                    label="Free Shipping Threshold"
                    placeholder="e.g., 100"
                    type="number"
                    min={0}
                    max={1000000}
                    maxLength={100}
                  />
                )}
              </shippingForm.AppField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <shippingForm.AppField name="estimatedDaysMin">
                {(field) => (
                  <field.TextField
                    label="Estimated Days Min *"
                    placeholder="e.g., 10"
                    type="number"
                    min={0}
                    max={1000000}
                    required
                  />
                )}
              </shippingForm.AppField>
              <shippingForm.AppField name="estimatedDaysMax">
                {(field) => (
                  <field.TextField
                    label="Estimated Days Max *"
                    placeholder="e.g., 100"
                    type="number"
                    min={0}
                    max={1000000}
                    required
                  />
                )}
              </shippingForm.AppField>
            </div>

            <shippingForm.AppField name="isActive">
              {(field) => <field.CheckboxField label="Active" />}
            </shippingForm.AppField>

            <shippingForm.AppField name="isDefault">
              {(field) => <field.CheckboxField label="Set as default" />}
            </shippingForm.AppField>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>

          <div className="flex gap-2">
            <LoadingButton
              disabled={shippingForm.state.isSubmitting}
              loading={shippingForm.state.isSubmitting}
              type="submit"
              form="shippingform"
            >
              Create Shipping Profile
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
};
