import { Separator } from "@/components/ui/separator";
import { carriers, currencies } from "@/lib/constants/dropdown-data";

export function PricingShippingForm({ pricingShippingForm }: { pricingShippingForm: any }) {
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

      <div className="flex items-center space-x-2">
        <pricingShippingForm.AppField name="isNegotiable">
          {(field) => <field.CheckboxField label="Price is negotiable" />}
        </pricingShippingForm.AppField>
      </div>

      <Separator />



      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <pricingShippingForm.AppField name="shippingCost" >
          {(field) => <field.TextField label="Shipping Cost *" placeholder="12.90" type="number" min={0} max={1000000} />}
        </pricingShippingForm.AppField>
        <pricingShippingForm.AppField name="freeShippingThreshold" >
          {(field) => <field.TextField label="Free Shipping Threshold *" placeholder="100.00" type="number" min={0} max={1000000} />}
        </pricingShippingForm.AppField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <pricingShippingForm.AppField name="estimatedDaysMin" >
          {(field) => <field.TextField label="Estimated Days Min " placeholder="Enter the estimated days min" type="number" min={0} max={1000000} />}
        </pricingShippingForm.AppField>
        <pricingShippingForm.AppField name="estimatedDaysMax" >
          {(field) => <field.TextField label="Estimated Days Max " placeholder="Enter the estimated days max" type="number" min={0} max={1000000} />}
        </pricingShippingForm.AppField>
        <pricingShippingForm.AppField name="carrier" >
          {(field) => <field.SelectField label="Carrier " placeholder="Enter the carrier" options={carriers.map((carrier) => ({
            value: carrier,
            label: carrier,
          }))} />}
        </pricingShippingForm.AppField>
      </div>

    </>
  )
}
