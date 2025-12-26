import { Loader2, Search } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  conditions as conditionsOptions,
  materials as materialsOptions,
  warranties as warrantiesOptions,
} from "@/lib/constants/dropdown-data";
import { api } from "@/trpc/react";

export function BasicInfoForm({
  basicInfoForm,
  onVinDecoded,
}: {
  basicInfoForm: any;
  onVinDecoded?: (data: {
    makeId: string;
    makeName: string;
    modelId: string;
    modelName: string;
    year: number;
    yearStart: number;
    yearEnd: number;
    engine?: string | null;
    trim?: string | null;
  }) => void;
}) {
  const { data: rawCategories } =
    api.partInfo.getCategoriesForDropdown.useQuery();

  const categories = useMemo(
    () =>
      rawCategories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? [],
    [rawCategories],
  );

  const conditions = useMemo(
    () =>
      conditionsOptions.map((condition) => ({
        value: condition,
        label: condition,
      })),
    [],
  );

  const materials = useMemo(
    () =>
      materialsOptions.map((material) => ({
        value: material,
        label: material,
      })),
    [],
  );

  const warranties = useMemo(
    () =>
      warrantiesOptions.map((warranty) => ({
        value: warranty,
        label: warranty,
      })),
    [],
  );

  // VIN decoder mutation
  const vinDecoderMutation = api.partInfo.decodeVinAndFetchModels.useMutation({
    onSuccess: (data) => {
      if (data.success && data.data) {
        toast.success(
          `VIN decoded successfully: ${data.data.makeName} ${data.data.modelName} (${data.data.year})`,
        );
        if (onVinDecoded) {
          onVinDecoded(data.data);
        }
      }
    },
    onError: (error) => {
      toast.error(`Failed to decode VIN: ${error.message}`);
    },
  });

  const handleDecodeVin = () => {
    const vin = basicInfoForm.state.values.partNumber?.trim();

    if (!vin) {
      toast.error("Please enter a VIN number");
      return;
    }

    if (vin.length !== 17) {
      toast.error("VIN must be exactly 17 characters");
      return;
    }

    vinDecoderMutation.mutate({ vin });
  };

  return (
    <>
      <basicInfoForm.AppField name="title">
        {(field) => (
          <field.TextField
            label="Title *"
            placeholder="e.g., BMW E46 Brake Pads - Front Set"
            required
          />
        )}
      </basicInfoForm.AppField>
      <basicInfoForm.AppField name="description">
        {(field) => (
          <field.TextAreaField
            label="Description *"
            placeholder="Describe the part condition, compatibility, and any important details..."
            required
          />
        )}
      </basicInfoForm.AppField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="categoryId">
          {(field) => (
            <field.SelectField
              label="Category *"
              placeholder="Select a category"
              options={categories}
            />
          )}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="condition">
          {(field) => (
            <field.SelectField
              label="Condition *"
              placeholder="Select a condition"
              options={conditions}
            />
          )}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="partNumber">
          {(field) => (
            <div className="space-y-2">
              <label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                VIN Number *
              </label>
              <div className="flex items-center gap-2">
                <field.TextField
                  placeholder="e.g., 1HGBH41JXMN109186"
                  maxLength={17}
                  className="flex-1"
                />
                <Button
                  type="button"
                  className="mt-2"
                  variant="outline"
                  onClick={handleDecodeVin}
                  disabled={
                    vinDecoderMutation.isPending ||
                    !basicInfoForm.state.values.partNumber ||
                    basicInfoForm.state.values.partNumber.length !== 17
                  }
                >
                  {vinDecoderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Enter the 17-character VIN to auto-fill vehicle compatibility
              </p>
            </div>
          )}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="oem">
          {(field) => (
            <field.TextField label="OEM *" placeholder="e.g., BMW OEM, Bosch" />
          )}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <basicInfoForm.AppField name="material">
          {(field) => (
            <field.SelectField
              label="Material "
              placeholder="Select a material"
              options={materials}
            />
          )}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="warranty">
          {(field) => (
            <field.SelectField
              label="Warranty "
              placeholder="Select a warranty"
              options={warranties}
            />
          )}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="quantity">
          {(field) => (
            <field.TextField
              label="Quantity "
              placeholder="Enter the quantity"
              type="number"
              min={1}
              max={100}
            />
          )}
        </basicInfoForm.AppField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <basicInfoForm.AppField name="weight">
          {(field) => (
            <field.TextField
              label="Weight (lbs)"
              placeholder="2.5"
              min={0}
              max={100}
              type="number"
            />
          )}
        </basicInfoForm.AppField>
        <basicInfoForm.AppField name="dimensions">
          {(field) => (
            <field.TextField
              label="Dimensions"
              placeholder="e.g., 12.5 x 5.2 x 0.8 inches"
            />
          )}
        </basicInfoForm.AppField>
      </div>
    </>
  );
}
