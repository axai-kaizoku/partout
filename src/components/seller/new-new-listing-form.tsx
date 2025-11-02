import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// const UserSchema = z.object({
//   name: z
//     .string()
//     .regex(/^[A-Z]/, "Name must start with a capital letter")
//     .min(3, "Name must be at least 3 characters long"),
//   surname: z
//     .string()
//     .min(3, "Surname must be at least 3 characters long")
//     .regex(/^[A-Z]/, "Surname must start with a capital letter"),
//   isAcceptingTerms: z.boolean().refine((val) => val, {
//     message: "You must accept the terms and conditions",
//   }),
//   contact: z.object({
//     email: z.string().email("Invalid email address"),
//     phone: z.string().optional(),
//     preferredContactMethod: ContactMethod,
//   }),
// });
// type User = z.infer<typeof UserSchema>;

// title: "",
// description: "",
// categoryId: "", // References categories.id
// partNumber: "",
// oem: "", // Original Equipment Manufacturer
// brand: "",
// condition: "", // New, Used, Refurbished

// // Pricing (matches parts table)
// price: "",
// originalPrice: "",
// currency: "USD",
// isNegotiable: false,
// quantity: "1",

// // Physical properties (matches parts table)
// weight: "", // in lbs
// dimensions: "", // "12.5 x 5.2 x 0.8 inches"
// warranty: "", // "2 Years", "90 Days", etc.
// material: "", // "Ceramic", "Metal", etc.

// // Vehicle Compatibility (matches partCompatibility table)
// makeId: "", // References vehicleMakes.id
// modelId: "", // References vehicleModels.id
// yearStart: "",
// yearEnd: "",
// engine: "", // "2.5L", "3.0L V6", etc.
// trim: "", // "Base", "Sport", "M3", etc.

// // Shipping (matches shippingProfiles table)
// shippingCost: "",
// freeShippingThreshold: "",
// estimatedDaysMin: "",
// estimatedDaysMax: "",
// carrier: "", // "UPS", "FedEx", "USPS"

// // Additional specifications as JSON (matches parts.specifications)
// specifications: {} as Record<string, string>,

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

  const steps = [
    { number: 1, title: "Basic Info", icon: Package },
    { number: 2, title: "Vehicle Details", icon: Car },
    { number: 3, title: "Photos", icon: Camera },
    { number: 4, title: "Pricing & Shipping", icon: DollarSign },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex items-center cursor-pointer"
              onClick={() => {
                setCurrentStep(index + 1);
                toast.success("loading toast this is");
              }}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Step {step.number}
                </p>
                <p className={`text-xs ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., BMW E46 Brake Pads - Front Set"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the part condition, compatibility, and any important details..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Load categories from API - categories table */}
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number</Label>
                  <Input
                    id="partNumber"
                    placeholder="e.g., 34116761280"
                    value={formData.partNumber}
                    onChange={(e) => handleChange("partNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oem">OEM Brand</Label>
                  <Input
                    id="oem"
                    placeholder="e.g., BMW OEM, Bosch"
                    value={formData.oem}
                    onChange={(e) => handleChange("oem", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select value={formData.material} onValueChange={(value) => handleChange("material", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Select value={formData.warranty} onValueChange={(value) => handleChange("warranty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warranty" />
                    </SelectTrigger>
                    <SelectContent>
                      {warranties.map((warranty) => (
                        <SelectItem key={warranty} value={warranty}>
                          {warranty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    placeholder="e.g., 12.5 x 5.2 x 0.8 inches"
                    value={formData.dimensions}
                    onChange={(e) => handleChange("dimensions", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="makeId">Vehicle Make *</Label>
                  <Select value={formData.makeId} onValueChange={(value) => handleChange("makeId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Load makes from API - vehicleMakes table */}
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelId">Vehicle Model *</Label>
                  <Select value={formData.modelId} onValueChange={(value) => handleChange("modelId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Load models from API based on selected make - vehicleModels table */}
                      <SelectItem value="e46">E46 3 Series</SelectItem>
                      <SelectItem value="e90">E90 3 Series</SelectItem>
                      <SelectItem value="e39">E39 5 Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearStart">Year Start *</Label>
                  <Input
                    id="yearStart"
                    type="number"
                    min="1900"
                    max="2030"
                    placeholder="1999"
                    value={formData.yearStart}
                    onChange={(e) => handleChange("yearStart", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearEnd">Year End *</Label>
                  <Input
                    id="yearEnd"
                    type="number"
                    min="1900"
                    max="2030"
                    placeholder="2006"
                    value={formData.yearEnd}
                    onChange={(e) => handleChange("yearEnd", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engine">Engine</Label>
                  <Input
                    id="engine"
                    placeholder="e.g., 2.5L, 3.0L V6"
                    value={formData.engine}
                    onChange={(e) => handleChange("engine", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trim">Trim Level</Label>
                  <Input
                    id="trim"
                    placeholder="e.g., Base, Sport, M3"
                    value={formData.trim}
                    onChange={(e) => handleChange("trim", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Part Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., BMW, Bosch, Brembo"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="relative w-full h-32 rounded-md overflow-hidden bg-gray-100">
                      <img src={image.preview} alt={`Part image ${index + 1}`} className="w-full h-full object-cover" />

                      {/* Upload status overlay */}
                      {image.isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}

                      {/* Success indicator */}
                      {image.uploaded && !image.isUploading && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Primary image indicator */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      onClick={() => removeImage(image.id)}
                      disabled={image.isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Add photo button */}
                {images.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 border-dashed bg-transparent hover:bg-gray-50"
                    onClick={addImage}
                    disabled={uploadImageMutation.isPending}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploadImageMutation.isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                      <span className="text-sm">{uploadImageMutation.isPending ? "Uploading..." : "Add Photo"}</span>
                    </div>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Add up to 8 photos. The first photo will be used as the main image.
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB per image.
                </p>
                {images.length > 0 && (
                  <p className="text-xs text-green-600">
                    {images.filter((img) => img.uploaded).length} of {images.length} images uploaded successfully
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Pricing & Shipping */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="89.99"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={formData.originalPrice}
                    onChange={(e) => handleChange("originalPrice", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNegotiable"
                  checked={formData.isNegotiable}
                  onCheckedChange={(checked) => handleChange("isNegotiable", checked as boolean)}
                />
                <Label htmlFor="isNegotiable">Price is negotiable</Label>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost *</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={formData.shippingCost}
                    onChange={(e) => handleChange("shippingCost", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.freeShippingThreshold}
                    onChange={(e) => handleChange("freeShippingThreshold", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDaysMin">Min Delivery Days</Label>
                  <Input
                    id="estimatedDaysMin"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={formData.estimatedDaysMin}
                    onChange={(e) => handleChange("estimatedDaysMin", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDaysMax">Max Delivery Days</Label>
                  <Input
                    id="estimatedDaysMax"
                    type="number"
                    min="1"
                    placeholder="5"
                    value={formData.estimatedDaysMax}
                    onChange={(e) => handleChange("estimatedDaysMax", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrier">Shipping Carrier</Label>
                  <Select value={formData.carrier} onValueChange={(value) => handleChange("carrier", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Listing..." : "Create Listing"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
