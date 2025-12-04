import { currencies } from "@/lib/constants/dropdown-data";
import { api } from "@/trpc/react";

export function PricingShippingForm({ pricingShippingForm }: { pricingShippingForm: any }) {
  const { data: shipping } = api.shipping.getAllShippingProfiles.useQuery()
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <pricingShippingForm.AppField name="price" >
          {(field) => <field.TextField label="Price *" placeholder="89.99" type="number" min={0} max={1000000} required />}
        </pricingShippingForm.AppField>
        <pricingShippingForm.AppField name="originalPrice" >
          {(field) => <field.TextField label="Original Price " placeholder="120.00" type="number" min={0} max={1000000} />}
        </pricingShippingForm.AppField>
        <pricingShippingForm.AppField name="currency" >
          {(field) => <field.SelectField label="Currency *" placeholder="Select a currency" options={currencies.map((currency) => ({
            value: currency,
            label: currency,
          }))} />}
        </pricingShippingForm.AppField>
      </div>
      <pricingShippingForm.AppField name="partShippingId">
        {(field) => <field.SelectField label="Shipping *" placeholder="Select a shipping" options={shipping?.map((shipping) => ({
          value: shipping.id,
          label: shipping.name,
        })) ?? []} />}
      </pricingShippingForm.AppField>
      <p className="text-xs text-muted-foreground">Add your shipping profile</p>
      <div className="flex items-center space-x-2">
        <pricingShippingForm.AppField name="isNegotiable">
          {(field) => <field.CheckboxField label="Price is negotiable" />}
        </pricingShippingForm.AppField>
      </div>
    </>
  )
}
