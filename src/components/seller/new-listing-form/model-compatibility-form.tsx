"use client";

import { nanoid } from "nanoid";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import type { ModelCompatibility } from "./form-defaults";

type ModelCompatibilityFormProps = {
  entryForm: any;
  onAdd: (compat: ModelCompatibility) => void;
  existingCompatibilities: ModelCompatibility[];
};

export function ModelCompatibilityForm({
  entryForm,
  onAdd,
  existingCompatibilities,
}: ModelCompatibilityFormProps) {
  const { data: makesOptions } = api.partInfo.getMakesForDropdown.useQuery();

  const makes = useMemo(
    () =>
      makesOptions?.map((make) => ({
        value: make.id,
        label: make.name,
      })) ?? [],
    [makesOptions],
  );
  console.log({ makes });

  const [selectedMakeId, setSelectedMakeId] = useState<string>("");
  const [pendingModels, setPendingModels] = useState<
    Array<{ id: string; name: string; makeId: string }>
  >([]);

  const { data: models, isLoading: modelsLoading } =
    api.partInfo.getModelsByMake.useQuery(
      { makeId: selectedMakeId },
      { enabled: !!selectedMakeId },
    );

  // Combine API models with pending (newly created) models
  const allModels = [
    ...(models || []),
    ...pendingModels.filter((pm) => pm.makeId === selectedMakeId),
  ];

  const handleMakeChange = (makeId: string) => {
    setSelectedMakeId(makeId);
    entryForm.setFieldValue("makeId", makeId);
    entryForm.setFieldValue("modelId", "");
    entryForm.setFieldValue("modelName", "");
  };

  const handleModelSelect = (modelId: string) => {
    const selectedModel = allModels?.find((m) => m.id === modelId);
    if (selectedModel) {
      entryForm.setFieldValue("modelId", modelId);
      entryForm.setFieldValue("modelName", selectedModel.name);
    }
  };

  const handleModelCreate = (modelName: string) => {
    // Create a temporary ID for the pending model
    const tempModelId = `temp_${nanoid()}`;

    // Add to pending models so it appears in the dropdown
    setPendingModels((prev) => [
      ...prev,
      { id: tempModelId, name: modelName, makeId: selectedMakeId },
    ]);

    // Set form values
    entryForm.setFieldValue("modelId", tempModelId);
    entryForm.setFieldValue("modelName", modelName);
  };

  const handleAddModel = () => {
    const values = entryForm.state.values;

    // Validate required fields
    if (!values.makeId || !values.modelName) {
      toast.error("Make and Model are required");
      return;
    }

    // Validate year range
    if (values.yearStart && values.yearEnd) {
      const yearStart = parseInt(values.yearStart, 10);
      const yearEnd = parseInt(values.yearEnd, 10);
      if (yearStart > yearEnd) {
        toast.error("Year start must be before or equal to year end");
        return;
      }
    }

    // Check for duplicates
    const selectedMake = makes?.find((m) => m.value === values.makeId);
    const isDuplicate = existingCompatibilities.some(
      (compat) =>
        compat.makeId === values.makeId &&
        compat.modelName.toLowerCase() === values.modelName.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error("This model is already in your compatibility list");
      return;
    }

    // Check if this is a new model (temp ID or no ID)
    const isNewModel = !values.modelId || values.modelId.startsWith("temp_");

    // Create compatibility entry
    const newCompatibility: ModelCompatibility = {
      id: nanoid(),
      makeId: values.makeId,
      makeName: selectedMake?.name || "",
      modelId: isNewModel ? null : values.modelId,
      modelName: values.modelName,
      yearStart: values.yearStart || "",
      yearEnd: values.yearEnd || "",
      engine: values.engine || "",
      trim: values.trim || "",
      isNewModel,
    };

    onAdd(newCompatibility);

    // Reset form
    entryForm.reset();
    setSelectedMakeId("");
    toast.success("Model added to compatibility list");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <entryForm.AppField name="makeId">
            {(field) => {
              const originalOnChange = field.handleChange;
              field.handleChange = (value: string) => {
                originalOnChange(value);
                handleMakeChange(value);
              };
              return (
                <field.SelectField
                  label="Vehicle Make*"
                  placeholder="Select a vehicle make"
                  options={makes}
                />
              );
            }}
          </entryForm.AppField>
        </div>

        <div>
          <entryForm.AppField name="modelName">
            {(field) => (
              <field.ComboboxField
                label="Vehicle Model*"
                placeholder={
                  selectedMakeId
                    ? "Select or create a model"
                    : "Select a make first"
                }
                searchPlaceholder="Search models..."
                emptyText="No models found for this make"
                options={
                  allModels?.map((model) => ({
                    value: model.id,
                    label: model.name,
                  })) ?? []
                }
                isLoading={modelsLoading}
                allowCreate={!!selectedMakeId}
                onCreateNew={(modelName: string) => {
                  field.handleChange(modelName);
                  handleModelCreate(modelName);
                }}
                onSelect={(modelId: string, modelName: string) => {
                  field.handleChange(modelName);
                  handleModelSelect(modelId);
                }}
              />
            )}
          </entryForm.AppField>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <entryForm.AppField name="yearStart">
          {(field) => (
            <field.TextField
              label="Year Start"
              placeholder="1999"
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          )}
        </entryForm.AppField>

        <entryForm.AppField name="yearEnd">
          {(field) => (
            <field.TextField
              label="Year End"
              placeholder="2024"
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          )}
        </entryForm.AppField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <entryForm.AppField name="engine">
          {(field) => (
            <field.TextField label="Engine" placeholder="e.g., 2.5L, 3.0L V6" />
          )}
        </entryForm.AppField>

        <entryForm.AppField name="trim">
          {(field) => (
            <field.TextField
              label="Trim Level"
              placeholder="e.g., Base, Sport, M3"
            />
          )}
        </entryForm.AppField>
      </div>

      <Button type="button" onClick={handleAddModel} className="w-full">
        Add Model to Compatibility List
      </Button>
    </div>
  );
}
