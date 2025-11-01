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

import type React from "react";

import { useState } from "react";
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

export function NewListingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
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
  const materials = ["Ceramic", "Metal", "Plastic", "Rubber", "Carbon Fiber", "Aluminum", "Steel"];
  const warranties = ["No Warranty", "30 Days", "90 Days", "6 Months", "1 Year", "2 Years", "3 Years", "Lifetime"];

  const uploadMutation = api.image.uploadPartImageToBucket.useMutation({
    onSuccess: (data) => {
      console.log("Image uploaded successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to upload image:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement API call to create part listing
      // This should call a tRPC mutation that:
      // 1. Creates the part record in the parts table
      // 2. Creates part images in partImages table
      // 3. Creates compatibility records in partCompatibility table
      // 4. Creates or links to shipping profile in shippingProfiles table
      // 5. Updates seller stats if needed

      // Mock API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));
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

  const addImage = () => {
    // TODO: Implement real image upload
    // This should:
    // 1. Open file picker
    // 2. Upload to cloud storage (S3, Cloudinary, etc.)
    // 3. Store URLs for later insertion into partImages table
    // 4. Handle image optimization and multiple sizes

    // Mock image upload for now
    const newImage = `/placeholder.svg?height=200&width=200&text=Part+Image+${images.length + 1}`;
    setImages((prev) => [...prev, newImage]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Part image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {images.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 border-dashed bg-transparent"
                    onClick={addImage}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Add Photo</span>
                    </div>
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Add up to 8 photos. The first photo will be used as the main image.
              </p>
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
