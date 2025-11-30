import { conditions, materials, warranties } from "@/lib/constants/dropdown-data";
import { api } from "@/trpc/react";


export function BasicInfoForm({ basicInfoForm }: { basicInfoForm: any }) {
  const { data: categories } = api.partInfo.getCategoriesForDropdown.useQuery();

  return (
    <>
      <basicInfoForm.AppField name="title" >
        {(field) => <field.TextField label="Title *" placeholder="e.g., BMW E46 Brake Pads - Front Set" required />}
      </basicInfoForm.AppField>
      <basicInfoForm.AppField name="description" >
        {(field) => <field.TextAreaField label="Description *" placeholder="Describe the part condition, compatibility, and any important details..."
          required
        />}
      </basicInfoForm.AppField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="categoryId" >
          {(field) => <field.SelectField label="Category *" placeholder="Select a category" options={categories?.map((category) => ({
            value: category.id,
            label: category.name,
          })) ?? []} />}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="condition" >
          {(field) => <field.SelectField label="Condition *" placeholder="Select a condition" options={conditions.map((condition) => ({
            value: condition,
            label: condition,
          }))} />}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="partNumber" >
          {(field) => <field.TextField label="Part Number *" placeholder="e.g., 34116761280" />}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="oem" >
          {(field) => <field.TextField label="OEM *" placeholder="e.g., BMW OEM, Bosch" />}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <basicInfoForm.AppField name="material" >
          {(field) => <field.SelectField label="Material " placeholder="Select a material" options={materials.map((material) => ({
            value: material,
            label: material,
          }))} />}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="warranty" >
          {(field) => <field.SelectField label="Warranty " placeholder="Select a warranty" options={warranties.map((warranty) => ({
            value: warranty,
            label: warranty,
          }))} />}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="quantity" >
          {(field) => <field.TextField label="Quantity " placeholder="Enter the quantity" defaultValue={1} type="number" min={1} max={100} />}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="weight">
          {(field) => <field.TextField label="Weight (lbs)" placeholder="2.5" min={0} max={100} type="number" />}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="dimensions">
          {(field) => <field.TextField label="Dimensions" placeholder="e.g., 12.5 x 5.2 x 0.8 inches" />}
        </basicInfoForm.AppField>
      </div>
    </>
  )
}
