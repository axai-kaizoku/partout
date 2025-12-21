"use client";

import { useAppForm } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ModelCompatibility,
  modelCompatibilityEntryDefaults,
} from "./form-defaults";
import { ModelCompatibilityForm } from "./model-compatibility-form";
import { ModelCompatibilityList } from "./model-compatibility-list";
import { modelCompatibilityEntrySchema } from "./validations";

export function VehicleDetailsForm({
  vehicleDetailsForm,
}: {
  vehicleDetailsForm: any;
}) {
  const entryForm = useAppForm({
    defaultValues: modelCompatibilityEntryDefaults,
    validators: {
      onChange: modelCompatibilityEntrySchema,
    },
    onSubmit: () => {
      // Form submission is handled by the ModelCompatibilityForm component
    },
  });

  const handleAddCompatibility = (compat: ModelCompatibility) => {
    const currentCompatibilities =
      vehicleDetailsForm.state.values.compatibleModels || [];
    vehicleDetailsForm.setFieldValue("compatibleModels", [
      ...currentCompatibilities,
      compat,
    ]);
  };

  const handleRemoveCompatibility = (id: string) => {
    const currentCompatibilities =
      vehicleDetailsForm.state.values.compatibleModels || [];
    vehicleDetailsForm.setFieldValue(
      "compatibleModels",
      currentCompatibilities.filter((c: ModelCompatibility) => c.id !== id),
    );
  };

  return (
    <div className="space-y-6">
      <vehicleDetailsForm.AppField name="brand">
        {(field) => (
          <field.TextField
            label="Part Brand"
            placeholder="e.g., BMW, Bosch, Brembo"
          />
        )}
      </vehicleDetailsForm.AppField>

      <vehicleDetailsForm.AppField name="compatibleModels">
        {(field) => (
          <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Compatibility*</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Add the vehicles that this part is compatible with. You can
                  add multiple models.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ModelCompatibilityForm
                  entryForm={entryForm}
                  onAdd={handleAddCompatibility}
                  existingCompatibilities={
                    vehicleDetailsForm.state.values.compatibleModels || []
                  }
                />

                <div className="pt-4">
                  <h3 className="mb-3 font-medium text-sm">
                    Compatible Models
                  </h3>
                  <ModelCompatibilityList
                    compatibilities={
                      vehicleDetailsForm.state.values.compatibleModels || []
                    }
                    onRemove={handleRemoveCompatibility}
                  />
                </div>
              </CardContent>
            </Card>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="font-medium text-destructive text-sm">
                  {field.state.meta.errors[0].message}
                </p>
              )}
          </div>
        )}
      </vehicleDetailsForm.AppField>
    </div>
  );
}
