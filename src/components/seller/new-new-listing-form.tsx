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

  const handleSubmit = () => {
    //
  }

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
              className="flex items-center cursor-pointer"
              onClick={() => {
                setCurrentStep(index + 1);
                toast.success("loading toast this is");
              }}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-muted-foreground border-border"
                  }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
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

      <form id="basic-info">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="title" >
              {(field) => <field.TextField label="Title *" placeholder="e.g., BMW E46 Brake Pads - Front Set" required />}
            </form.AppField>
            <form.AppField name="description" >
              {(field) => <field.TextAreaField label="Description *" placeholder="Describe the part condition, compatibility, and any important details..."
                required
              />}
            </form.AppField>
            <form.AppField name="categoryId" >
              {(field) => <field.SelectField label="Category *" placeholder="Select a category" options={categories.map((category) => ({ value: category.id, label: category.name }))} />}
            </form.AppField>

          </CardContent>
        </Card>
      </form>

    </div>
  );
}
