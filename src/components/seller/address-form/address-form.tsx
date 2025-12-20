"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/components/form";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Address } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { addressSchema } from "./validations";

export const AddressForm = ({
  address = null,
  onSuccess,
}: {
  address?: Address | null;
  onSuccess?: () => void;
}) => {
  const router = useRouter();

  const utils = api.useUtils();

  const { mutateAsync: createAddress } =
    api.address.createAddress.useMutation();

  const { mutateAsync: updateAddress } =
    api.address.updateAddress.useMutation();

  const addressForm = useAppForm({
    defaultValues: {
      fullName: address?.fullName || "",
      company: address?.company || "",
      line1: address?.line1 || "",
      line2: address?.line2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      country: "US",
      phone: address?.phone || "",
      isDefault: address?.isDefault || false,
    },
    validators: {
      onChange: addressSchema,
    },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading(
        address ? "Updating address..." : "Creating address...",
      );
      if (address) {
        await updateAddress({ id: address.id, address: { ...value } })
          .then(() => {
            toast.success("Address updated successfully !", { id: toastId });
            utils.address.getAllAddresses.invalidate();
            // router.back()
            onSuccess?.();
          })
          .catch(() => {
            toast.error("Failed to update address !", { id: toastId });
          });
      } else {
        await createAddress(value)
          .then(() => {
            toast.success("Address created successfully !", { id: toastId });
            utils.address.getAllAddresses.invalidate();
            onSuccess?.();
          })
          .catch(() => {
            toast.error("Failed to create address !", { id: toastId });
          });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addressForm.handleSubmit();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <form id="addressform" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <addressForm.AppField name="fullName">
                {(field) => (
                  <field.TextField
                    label="Full Name *"
                    placeholder="e.g., Peter "
                    required
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
              <addressForm.AppField name="phone">
                {(field) => (
                  <field.PhoneField
                    label="Phone *"
                    placeholder="e.g., 123-456-7890"
                    required
                    {...field.state}
                  />
                )}
              </addressForm.AppField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <addressForm.AppField name="line1">
                {(field) => (
                  <field.TextField
                    label="Line 1 *"
                    placeholder="e.g., 123 Main St"
                    required
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
              <addressForm.AppField name="line2">
                {(field) => (
                  <field.TextField
                    label="Line 2"
                    placeholder="e.g., Suite 100"
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <addressForm.AppField name="city">
                {(field) => (
                  <field.TextField
                    label="City *"
                    placeholder="e.g., San Francisco"
                    required
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
              <addressForm.AppField name="state">
                {(field) => (
                  <field.TextField
                    label="State *"
                    placeholder="e.g., CA"
                    required
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
              <addressForm.AppField name="postalCode">
                {(field) => (
                  <field.TextField
                    label="Postal Code *"
                    placeholder="e.g., 94102"
                    required
                    maxLength={100}
                  />
                )}
              </addressForm.AppField>
            </div>

            <addressForm.AppField name="isDefault">
              {(field) => <field.CheckboxField label="Set as default" />}
            </addressForm.AppField>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>

          <div className="flex gap-2">
            <LoadingButton
              disabled={addressForm.state.isSubmitting}
              loading={addressForm.state.isSubmitting}
              type="submit"
              form="addressform"
            >
              {address ? "Update Address" : "Create Address"}
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
};
