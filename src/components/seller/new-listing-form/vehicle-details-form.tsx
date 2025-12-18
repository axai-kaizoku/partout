import { api } from "@/trpc/react";

export function VehicleDetailsForm({
  vehicleDetailsForm,
}: {
  vehicleDetailsForm: any;
}) {
  const { data: makes } = api.partInfo.getMakesForDropdown.useQuery();
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <vehicleDetailsForm.AppField name="makeId">
          {(field) => (
            <field.SelectField
              label="Vehicle Make*"
              placeholder="Select a vehicle make"
              options={
                makes?.map((make) => ({
                  value: make.id,
                  label: make.name,
                })) ?? []
              }
            />
          )}
        </vehicleDetailsForm.AppField>
        <vehicleDetailsForm.AppField name="modelId">
          {(field) => (
            <field.TextField
              label="Vehicle Model*"
              placeholder="Enter the model"
            />
          )}
        </vehicleDetailsForm.AppField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <vehicleDetailsForm.AppField name="yearStart">
          {(field) => (
            <field.TextField
              label="Year Start *"
              placeholder="1999"
              type="number"
              min={0}
              max={new Date().getFullYear()}
            />
          )}
        </vehicleDetailsForm.AppField>
        <vehicleDetailsForm.AppField name="yearEnd">
          {(field) => (
            <field.TextField
              label="Year End *"
              placeholder="2024"
              type="number"
              min={0}
              max={new Date().getFullYear()}
            />
          )}
        </vehicleDetailsForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <vehicleDetailsForm.AppField name="engine">
          {(field) => (
            <field.TextField
              label="Engine "
              placeholder="e.g., 2.5L, 3.0L V6"
            />
          )}
        </vehicleDetailsForm.AppField>
        <vehicleDetailsForm.AppField name="trim">
          {(field) => (
            <field.TextField
              label="Trim Level"
              placeholder="e.g., Base, Sport, M3"
            />
          )}
        </vehicleDetailsForm.AppField>
      </div>

      <vehicleDetailsForm.AppField name="brand">
        {(field) => (
          <field.TextField
            label="Part Brand "
            placeholder="e.g., BMW, Bosch, Brembo"
          />
        )}
      </vehicleDetailsForm.AppField>
    </>
  );
}
