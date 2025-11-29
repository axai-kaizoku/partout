import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Package, DollarSign, Car, Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useAppForm } from "../form";
import z from "zod";
import { cn } from "@/lib/utils";
import { carriers, conditions, currencies, materials, warranties } from "@/lib/constants/dropdown-data";
import Image from "next/image";

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  uploaded?: {
    url: string;
    reducedUrl: string;
    key: string;
  };
  isUploading?: boolean;
}

const PartSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  categoryId: z.string().min(1, "Category is required"),
  partNumber: z.string().min(1, "Part number is required"),
  oem: z.string().min(1, "OEM is required"),
  brand: z.string().min(1, "Brand is required"),
  condition: z.string().min(1, "Condition is required"),
  //
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  isNegotiable: z.boolean().optional(),
  quantity: z.string().min(1, "Quantity is required"),

  //
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  warranty: z.string().optional(),
  material: z.string().optional(),

  //
  makeId: z.string().optional(),
  modelId: z.string().optional(),
  yearStart: z.string().optional(),
  yearEnd: z.string().optional(),
  engine: z.string().optional(),
  trim: z.string().optional(),

  //
  shippingCost: z.string().optional(),
  freeShippingThreshold: z.string().optional(),
  estimatedDaysMin: z.string().optional(),
  estimatedDaysMax: z.string().optional(),
  carrier: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
});

type Part = z.infer<typeof PartSchema>;

const defaultPart = {
  title: "",
  description: "",
  categoryId: "", // References categories.id
  partNumber: "",
  oem: "", // Original Equipment Manufacturer
  brand: "",
  condition: "", // New, Used, Refurbished

  // Pricing (matches parts table)
  price: "",
  originalPrice: "",
  currency: "USD",
  isNegotiable: false,
  quantity: "1",

  // Physical properties (matches parts table)
  weight: "", // in lbs
  dimensions: "", // "12.5 x 5.2 x 0.8 inches"
  warranty: "", // "2 Years", "90 Days", etc.
  material: "", // "Ceramic", "Metal", etc.

  // Vehicle Compatibility (matches partCompatibility table)
  makeId: "", // References vehicleMakes.id
  modelId: "", // References vehicleModels.id
  yearStart: "",
  yearEnd: "",
  engine: "", // "2.5L", "3.0L V6", etc.
  trim: "", // "Base", "Sport", "M3", etc.

  // Shipping (matches shippingProfiles table)
  shippingCost: "",
  freeShippingThreshold: "",
  estimatedDaysMin: "",
  estimatedDaysMax: "",
  carrier: "", // "UPS", "FedEx", "USPS"

  // Additional specifications as JSON (matches parts.specifications)
  specifications: {} as Record<string, string>,
};

export function NewNewListingForm() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useAppForm({
    defaultValues: defaultPart,
    validators: {
      onChange: PartSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  const { data: categories } = api.partInfo.getCategoriesForDropdown.useQuery();
  const { data: makes } = api.partInfo.getMakesForDropdown.useQuery();
  const { mutateAsync: createModelForMake } = api.partInfo.createModelForMake.useMutation();

  const handleSubmit = () => {
    //
  }

  const nextStep = () => {
    // TODO: Add validation for each step before proceeding
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: Package },
    { number: 2, title: "Vehicle Details", icon: Car },
    { number: 3, title: "Photos", icon: Camera },
    { number: 4, title: "Pricing & Shipping", icon: DollarSign },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <button
              key={step.number}
              className="flex cursor-pointer items-center"
              onClick={() => {
                setCurrentStep(index + 1);
                toast.success("loading toast this is");
              }}
            >
              <div
                className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", currentStep >= step.number
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background text-muted-foreground")}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p
                  className={cn("font-medium text-sm", currentStep >= step.number ? "text-foreground" : "text-muted-foreground")}
                >
                  Step {step.number}
                </p>
                <p className={cn("text-xs", currentStep >= step.number ? "text-foreground" : "text-muted-foreground")}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("mx-4 h-0.5 flex-1", currentStep > step.number ? "bg-accent" : "bg-border")} />
              )}
            </button>
          ))}
        </div>
      </div>

      <form id="basic-info" onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submitted");
      }}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 ? (
              <>
                <form.AppField name="title" >
                  {(field) => <field.TextField label="Title *" placeholder="e.g., BMW E46 Brake Pads - Front Set" required />}
                </form.AppField>
                <form.AppField name="description" >
                  {(field) => <field.TextAreaField label="Description *" placeholder="Describe the part condition, compatibility, and any important details..."
                    required
                  />}
                </form.AppField>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="categoryId" >
                    {(field) => <field.SelectField label="Category *" placeholder="Select a category" options={categories?.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })) ?? []} />}
                  </form.AppField>
                  <form.AppField name="condition" >
                    {(field) => <field.SelectField label="Condition *" placeholder="Select a condition" options={conditions.map((condition) => ({
                      value: condition,
                      label: condition,
                    }))} />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="partNumber" >
                    {(field) => <field.TextField label="Part Number *" placeholder="e.g., 34116761280" />}
                  </form.AppField>
                  <form.AppField name="oem" >
                    {(field) => <field.TextField label="OEM *" placeholder="e.g., BMW OEM, Bosch" />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <form.AppField name="material" >
                    {(field) => <field.SelectField label="Material " placeholder="Select a material" options={materials.map((material) => ({
                      value: material,
                      label: material,
                    }))} />}
                  </form.AppField>
                  <form.AppField name="warranty" >
                    {(field) => <field.SelectField label="Warranty " placeholder="Select a warranty" options={warranties.map((warranty) => ({
                      value: warranty,
                      label: warranty,
                    }))} />}
                  </form.AppField>
                  <form.AppField name="quantity" >
                    {(field) => <field.TextField label="Quantity " placeholder="Enter the quantity" defaultValue={1} type="number" min={1} max={100} />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="weight">
                    {(field) => <field.TextField label="Weight (lbs)" placeholder="2.5" min={0} max={100} type="number" />}
                  </form.AppField>
                  <form.AppField name="dimensions">
                    {(field) => <field.TextField label="Dimensions" placeholder="e.g., 12.5 x 5.2 x 0.8 inches" />}
                  </form.AppField>
                </div>
              </>
            ) : currentStep === 2 ?
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="makeId" >
                    {(field) => <field.SelectField label="Vehicle Make*" placeholder="Select a vehicle make" options={makes?.map((make) => ({
                      value: make.id,
                      label: make.name,
                    })) ?? []} />}
                  </form.AppField>
                  <form.AppField name="modelId" >
                    {(field) => <field.TextField label="Vehicle Model*" placeholder="Enter the model" />}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="yearStart" >
                    {(field) => <field.TextField label="Year Start *" placeholder="1999" type="number" min={0} max={new Date().getFullYear()} />}
                  </form.AppField>
                  <form.AppField name="yearEnd" >
                    {(field) => <field.TextField label="Year End *" placeholder="2024" type="number" min={0} max={new Date().getFullYear()} />}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="engine" >
                    {(field) => <field.TextField label="Engine "
                      placeholder="e.g., 2.5L, 3.0L V6"

                    />}
                  </form.AppField>
                  <form.AppField name="trim" >
                    {(field) => <field.TextField label="Trim Level"

                      placeholder="e.g., Base, Sport, M3"
                    />}
                  </form.AppField>
                </div>

                <form.AppField name="brand" >
                  {(field) => <field.TextField label="Part Brand "
                    placeholder="e.g., BMW, Bosch, Brembo"
                  />}
                </form.AppField>

              </> : currentStep === 3 ? <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                // onChange={handleFileSelect}
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[].map((image, index) => (
                    <div key={index} className="group relative">
                      <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                        <Image src={image.preview} alt={`Part ${index + 1}`} className="h-full w-full object-cover" />

                        {/* Upload status overlay */}
                        {/* {image.isUploading && ( */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                        {/* )} */}

                        {/* Success indicator */}
                        {/* {image.uploaded && !image.isUploading && ( */}
                        <div className="absolute top-2 left-2 rounded-full bg-green-500 p-1 text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {/* )} */}

                        {/* Primary image indicator */}
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 rounded bg-blue-500 px-2 py-1 text-white text-xs">
                            Primary
                          </div>
                        )}
                      </div>

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      // onClick={() => removeImage(image.id)}
                      // disabled={image.isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Add photo button */}
                  {[].length < 8 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-32 border-dashed bg-transparent hover:bg-gray-50"
                    // onClick={addImage}
                    // disabled={uploadImageMutation.isPending}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {/* {uploadImageMutation.isPending ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6" />
                        )} */}
                        {/* <span className="text-sm">{uploadImageMutation.isPending ? "Uploading..." : "Add Photo"}</span> */}
                        <span className="text-sm">Add Photo</span>
                      </div>
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    Add up to 8 photos. The first photo will be used as the main image.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB per image.
                  </p>
                  {[].length > 0 && (
                    <p className="text-green-600 text-xs">
                      {/* {images.filter((img) => img.uploaded).length} of {images.length} images uploaded successfully */}
                    </p>
                  )}
                </div>
              </> : currentStep === 4 ? <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <form.AppField name="price" >
                    {(field) => <field.TextField label="Price *" placeholder="89.99" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                  <form.AppField name="originalPrice" >
                    {(field) => <field.TextField label="Original Price " placeholder="120.00" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                  <form.AppField name="currency" >
                    {(field) => <field.SelectField label="Currency *" placeholder="Select a currency" options={currencies.map((currency) => ({
                      value: currency,
                      label: currency,
                    }))} />}
                  </form.AppField>
                </div>

                <div className="flex items-center space-x-2">
                  <form.AppField name="isNegotiable">
                    {(field) => <field.CheckboxField label="Price is negotiable" />}
                  </form.AppField>
                </div>

                <Separator />



                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <form.AppField name="shippingCost" >
                    {(field) => <field.TextField label="Shipping Cost *" placeholder="12.90" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                  <form.AppField name="freeShippingThreshold" >
                    {(field) => <field.TextField label="Free Shipping Threshold *" placeholder="100.00" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <form.AppField name="estimatedDaysMin" >
                    {(field) => <field.TextField label="Estimated Days Min " placeholder="Enter the estimated days min" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                  <form.AppField name="estimatedDaysMax" >
                    {(field) => <field.TextField label="Estimated Days Max " placeholder="Enter the estimated days max" type="number" min={0} max={1000000} required />}
                  </form.AppField>
                  <form.AppField name="carrier" >
                    {(field) => <field.SelectField label="Carrier " placeholder="Enter the carrier" options={carriers.map((carrier) => ({
                      value: carrier,
                      label: carrier,
                    }))} />}
                  </form.AppField>
                </div>

              </> : null}

          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <LoadingButton type="submit" form="basic-info">
                Create Listing
              </LoadingButton>
            )}
          </div>
        </div>
      </form>

    </div>
  );
}
