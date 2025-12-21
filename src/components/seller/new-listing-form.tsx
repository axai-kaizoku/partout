"use client";

/**
 * New Listing Form Component
 *
 * This form creates new part listings and requires the following API endpoints:
 *
 * 1. GET /api/categories - Fetch categories for dropdown (categories table)
 * 2. GET /api/vehicle-makes - Fetch vehicle makes (vehicleMakes table)
 * 3. GET /api/vehicle-models?makeId=X - Fetch models by make (vehicleModels table)
 * 4. POST /api/parts - Create new part listing with:
 *    - Part record (parts table)
 *    - Part images (partImages table)
 *    - Compatibility records (partCompatibility table)
 *    - Shipping profile (shippingProfiles table)
 * 5. POST /api/upload - Handle image uploads to cloud storage
 *
 * Form data maps to schema as follows:
 * - Basic info → parts table
 * - Vehicle compatibility → partCompatibility table
 * - Images → partImages table
 * - Shipping → shippingProfiles table
 */

import {
  Camera,
  Car,
  DollarSign,
  Loader2,
  Package,
  Upload,
  X,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

// Types for image handling
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

export function NewListingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);
  const [formData, setFormData] = useState({
    // Basic Info (matches parts table)
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
  });

  const categories = [
    "Engine Parts",
    "Brake System",
    "Electrical",
    "Body Parts",
    "Suspension",
    "Exhaust",
    "Interior",
    "Exterior",
    "Tools",
    "Accessories",
  ];

  const brands = [
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Hyundai",
    "Volkswagen",
    "Jeep",
    "Subaru",
  ];

  const conditions = ["New", "Used", "Refurbished"];
  const currencies = ["USD", "CAD", "EUR", "GBP"];
  const carriers = ["UPS", "FedEx", "USPS", "DHL"];
  const materials = [
    "Ceramic",
    "Metal",
    "Plastic",
    "Rubber",
    "Carbon Fiber",
    "Aluminum",
    "Steel",
  ];
  const warranties = [
    "No Warranty",
    "30 Days",
    "90 Days",
    "6 Months",
    "1 Year",
    "2 Years",
    "3 Years",
    "Lifetime",
  ];

  // Image upload mutation
  const uploadImageMutation = api.image.uploadTempImage.useMutation({
    onSuccess: (data, variables) => {
      // Update the image in state with upload result
      setImages((prev) =>
        prev.map((img) =>
          img.id === variables.fileName
            ? {
                ...img,
                uploaded: data,
                isUploading: false,
              }
            : img,
        ),
      );
    },
    onError: (error, variables) => {
      console.error("Failed to upload image:", error);
      // Show user-friendly error message
      alert(`Failed to upload image: ${error.message || "Unknown error"}`);
      // Remove failed upload from state
      setImages((prev) => prev.filter((img) => img.id !== variables.fileName));
    },
  });

  // VIN decoder mutation
  const vinDecoderMutation = api.partInfo.decodeVinAndFetchModels.useMutation({
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Auto-populate the vehicle compatibility fields
        setFormData((prev) => ({
          ...prev,
          makeId: data.data.makeId,
          modelId: data.data.modelId,
          yearStart: data.data.yearStart.toString(),
          yearEnd: data.data.yearEnd.toString(),
          engine: data.data.engine ?? prev.engine,
          trim: data.data.trim ?? prev.trim,
        }));

        toast.success(
          `VIN decoded successfully: ${data.data.makeName} ${data.data.modelName} (${data.data.year})`,
        );
      }
    },
    onError: (error) => {
      console.error("Failed to decode VIN:", error);
      toast.error(`Failed to decode VIN: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate that all images are uploaded
      const uploadedImages = images.filter(
        (img) => img.uploaded && !img.isUploading,
      );
      if (images.length > 0 && uploadedImages.length !== images.length) {
        alert(
          "Please wait for all images to finish uploading before submitting.",
        );
        setIsLoading(false);
        return;
      }

      // TODO: Implement API call to create part listing
      // Example API payload structure with uploaded images:
      const apiPayload = {
        // Parts table data
        part: {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          partNumber: formData.partNumber,
          oem: formData.oem,
          brand: formData.brand,
          condition: formData.condition,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice
            ? parseFloat(formData.originalPrice)
            : null,
          currency: formData.currency,
          isNegotiable: formData.isNegotiable,
          quantity: parseInt(formData.quantity, 10),
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dimensions: formData.dimensions,
          warranty: formData.warranty,
          material: formData.material,
          specifications: formData.specifications,
        },
        // Part images data (from uploaded images)
        images: uploadedImages.map((img, index) => ({
          url: img.uploaded?.url,
          sortOrder: index,
          isPrimary: index === 0,
          altText: `${formData.title} - Image ${index + 1}`,
        })),
        // Part compatibility data
        compatibility: {
          makeId: formData.makeId,
          modelId: formData.modelId,
          yearStart: parseInt(formData.yearStart, 10),
          yearEnd: parseInt(formData.yearEnd, 10),
          engine: formData.engine,
          trim: formData.trim,
        },
        // Shipping profile data
        shipping: {
          baseCost: parseFloat(formData.shippingCost),
          freeShippingThreshold: formData.freeShippingThreshold
            ? parseFloat(formData.freeShippingThreshold)
            : null,
          estimatedDaysMin: formData.estimatedDaysMin
            ? parseInt(formData.estimatedDaysMin, 10)
            : null,
          estimatedDaysMax: formData.estimatedDaysMax
            ? parseInt(formData.estimatedDaysMax, 10)
            : null,
          carrier: formData.carrier,
        },
      };

      // This should call a tRPC mutation like:
      // await api.parts.create.mutate(apiPayload);

      // Mock API call for now
      console.log("API Payload:", apiPayload);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clean up image preview URLs
      images.forEach((img) => URL.revokeObjectURL(img.preview));

      router.push("/sell");
    } catch (error) {
      console.error("Failed to create listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDecodeVin = () => {
    const vin = formData.partNumber.trim();

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

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      // Validate file type
      if (!validImageTypes.includes(file.type)) {
        alert(
          `${file.name} is not a valid image format. Please use JPEG, PNG, WebP, or GIF.`,
        );
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        alert(
          `${file.name} is too large. Please use images smaller than 10MB.`,
        );
        continue;
      }

      // Check if we already have 4 images
      if (images.length >= 4) {
        alert("You can only upload up to 4 images.");
        break;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const imageId = `${Date.now()}-${file.name}`;

      const newImage: ImagePreview = {
        id: imageId,
        file,
        preview,
        isUploading: true,
      };

      // Add to state immediately for preview
      setImages((prev) => [...prev, newImage]);

      // Convert to base64 and upload
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        uploadImageMutation.mutate({
          imageData: base64Data,
          fileName: imageId,
          contentType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        // Clean up preview URL to prevent memory leaks
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

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
            <div
              key={step.number}
              className="flex cursor-pointer items-center"
              onClick={() => {
                setCurrentStep(index + 1);
                toast.success("loading toast this is");
              }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStep >= step.number
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p
                  className={`font-medium text-sm ${
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Step {step.number}
                </p>
                <p
                  className={`text-xs ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 flex-1 ${currentStep > step.number ? "bg-accent" : "bg-border"}`}
                />
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
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
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleChange("condition", value)}
                  >
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partNumber">VIN Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="partNumber"
                      placeholder="e.g., 1HGBH41JXMN109186"
                      value={formData.partNumber}
                      onChange={(e) => handleChange("partNumber", e.target.value)}
                      maxLength={17}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDecodeVin}
                      disabled={vinDecoderMutation.isPending || formData.partNumber.length !== 17}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => handleChange("material", value)}
                  >
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
                  <Select
                    value={formData.warranty}
                    onValueChange={(value) => handleChange("warranty", value)}
                  >
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              {formData.makeId && formData.modelId && (
                <p className="text-muted-foreground text-sm">
                  Vehicle information has been auto-populated from VIN
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="makeId">Vehicle Make *</Label>
                  <Select
                    value={formData.makeId}
                    onValueChange={(value) => handleChange("makeId", value)}
                  >
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
                  <Select
                    value={formData.modelId}
                    onValueChange={(value) => handleChange("modelId", value)}
                  >
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div key={image.id} className="group relative">
                    <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Part image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Upload status overlay */}
                      {image.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Success indicator */}
                      {image.uploaded && !image.isUploading && (
                        <div className="absolute top-2 left-2 rounded-full bg-green-500 p-1 text-white">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
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
                      <span className="text-sm">
                        {uploadImageMutation.isPending
                          ? "Uploading..."
                          : "Add Photo"}
                      </span>
                    </div>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Add up to 8 photos. The first photo will be used as the main
                  image.
                </p>
                <p className="text-muted-foreground text-xs">
                  Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB per
                  image.
                </p>
                {images.length > 0 && (
                  <p className="text-green-600 text-xs">
                    {images.filter((img) => img.uploaded).length} of{" "}
                    {images.length} images uploaded successfully
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    onChange={(e) =>
                      handleChange("originalPrice", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
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
                  onCheckedChange={(checked) =>
                    handleChange("isNegotiable", checked as boolean)
                  }
                />
                <Label htmlFor="isNegotiable">Price is negotiable</Label>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost *</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={formData.shippingCost}
                    onChange={(e) =>
                      handleChange("shippingCost", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">
                    Free Shipping Threshold
                  </Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.freeShippingThreshold}
                    onChange={(e) =>
                      handleChange("freeShippingThreshold", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDaysMin">Min Delivery Days</Label>
                  <Input
                    id="estimatedDaysMin"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={formData.estimatedDaysMin}
                    onChange={(e) =>
                      handleChange("estimatedDaysMin", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleChange("estimatedDaysMax", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrier">Shipping Carrier</Label>
                  <Select
                    value={formData.carrier}
                    onValueChange={(value) => handleChange("carrier", value)}
                  >
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
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
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
