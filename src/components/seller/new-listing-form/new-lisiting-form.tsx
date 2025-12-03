"use client"
import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "@/components/form";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { BasicInfoForm } from "./basic-info-form";
import { CurrentStepIndicator } from "./current-step-indicator";
import { basicInfoDefaults, priceShippingDefaults, steps, vehicleDetailsDefaults } from "./form-defaults";
import { PricingShippingForm } from "./pricing-shipping-form";
import { basicInfoSchema, pricingShippingSchema, vehicleDetailsSchema } from "./validations";
import { VehicleDetailsForm } from "./vehicle-details-form";

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
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createModelForMake } = api.partInfo.createModelForMake.useMutation();

  const { mutateAsync: createPartCompatibility } = api.part.createPartCompatibility.useMutation();

  const { mutateAsync: createPart } = api.part.createPart.useMutation();

  const { mutateAsync: createPartImage } = api.image.createPartImage.useMutation();

  const basicInfoForm = useAppForm({
    defaultValues: basicInfoDefaults,
    validators: {
      onChange: basicInfoSchema,
    },
    onSubmit: () => {
      setCurrentStep(2);
    },
  });

  const vehicleDetailsForm = useAppForm({
    defaultValues: vehicleDetailsDefaults,
    validators: {
      onChange: vehicleDetailsSchema,
    },
    onSubmit: () => {
      setCurrentStep(3);
    },
  })

  const photoForm = useAppForm({
    defaultValues: {
      photos: [],
    },
    validators: {
      onChange: z.object({
        photos: z.array(z.string()).min(1, "At least one photo is required").max(8, "You can only upload up to 8 photos"),
      }),
    },
    onSubmit: () => {
      setCurrentStep(4);
    },
  })

  const pricingShippingForm = useAppForm({
    defaultValues: priceShippingDefaults,
    validators: {
      onChange: pricingShippingSchema,
    },
    onSubmit: async ({ value: pricingShippingFormValues }) => {
      const toastId = toast.loading("Creating part...")

      const { categoryId, condition, description, dimensions, material, oem, partNumber, quantity, title, warranty, weight } = basicInfoForm.state.values

      const { brand, makeId, modelId, yearStart, yearEnd, engine } = vehicleDetailsForm.state.values

      const { price, originalPrice, currency, isNegotiable } = pricingShippingFormValues

      await createPart({
        categoryId,
        condition,
        description,
        title,
        dimensions,
        material,
        oem,
        partNumber,
        quantity: parseInt(quantity),
        warranty,
        weight: weight ? parseInt(weight) : undefined,
        brand,
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : undefined,
        currency,
        isNegotiable,
      }).then(async (partId) => {
        if (makeId && modelId) {
          const createdModelId = await createModelForMake({
            makeId: makeId,
            name: modelId,
            yearEnd: yearEnd ? parseInt(yearEnd) : null,
            yearStart: yearStart ? parseInt(yearStart) : null,
          })

          await createPartCompatibility({
            partId: partId,
            makeId: makeId,
            modelId: createdModelId,
            yearStart: yearStart ? parseInt(yearStart) : null,
            yearEnd: yearEnd ? parseInt(yearEnd) : null,
            engine,
          })
        }

        Array.from(images).forEach(async (img, index) => {
          await createPartImage({
            partId: partId,
            url: img.uploaded?.url,
            sortOrder: index,
            isPrimary: index === 0,
          })
        })


        toast.success("Part created successfully", { id: toastId })
        router.push("/sell")
      }).catch((err) => {
        toast.error("Failed to create part", { id: toastId })
      })


    },
  })

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
            : img
        )
      );
    },
    onError: (error, variables) => {
      console.error("Failed to upload image:", error);
      // Show user-friendly error message
      toast.error(`Failed to upload image: ${error.message || "Unknown error"}`);
      // Remove failed upload from state
      setImages((prev) => prev.filter((img) => img.id !== variables.fileName));
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      // Validate file type
      if (!validImageTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format. Please use JPEG, PNG, WebP, or GIF.`);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large. Please use images smaller than 10MB.`);
        continue;
      }

      // if (Array.from(files).length > 8) {
      //   toast.error("You can only upload up to 8 images.");
      //   return;
      // }

      // // Check if we already have 4 images
      // if (images.length >= 8) {
      //   toast.error("You can only upload up to 8 images.");
      //   return;
      // }
      if (Array.from(files).length > 8 || images.length >= 8 || Array.from(files).length + images.length > 8) {
        toast.error("You can only upload up to 8 images.");
        return;
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
      photoForm.setFieldValue("photos", [...photoForm.state.values.photos, imageId]);

      // Convert to base64 and upload
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        uploadImageMutation.mutateAsync({
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

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (imageId: string) => {
    const filtered = photoForm.state.values.photos.filter((id) => id !== imageId);
    photoForm.setFieldValue("photos", filtered);
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove) {
        // Clean up preview URL to prevent memory leaks
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep === 1) {
      basicInfoForm.handleSubmit()
    }
    if (currentStep === 2) {
      vehicleDetailsForm.handleSubmit();
    }
    if (currentStep === 3) {
      photoForm.handleSubmit()
    }
    if (currentStep === 4) {
      pricingShippingForm.handleSubmit()
    }

  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <CurrentStepIndicator key={step.number} step={step} currentStep={currentStep} setCurrentStep={setCurrentStep} index={index} />
          ))}
        </div>
      </div>

      <form id="partform" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 ? (
              <BasicInfoForm basicInfoForm={basicInfoForm} />
            ) : currentStep === 2 ?
              (<VehicleDetailsForm vehicleDetailsForm={vehicleDetailsForm} />)
              : currentStep === 3 ? <>
                <photoForm.AppField name={"photos"}>
                  {(field) => <field.TextField
                    ref={fileInputRef}
                    type="file"
                    value=""
                    name="photos"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />}
                </photoForm.AppField>


                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="group relative">
                      <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                        <img src={image.preview} alt={`Part ${index + 1}`} width={128} height={128} className="h-full w-full object-cover" />

                        {/* Upload status overlay */}
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}

                        {/* Success indicator */}
                        {image.uploaded && !image.isUploading && (
                          <div className="absolute top-2 left-2 rounded-full bg-green-500 p-1 text-white">
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
                      className="h-32 border-dashed bg-transparent"
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
                  <p className="text-muted-foreground text-sm">
                    Add up to 8 photos. The first photo will be used as the main image.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB per image.
                  </p>
                  {images.length > 0 && (
                    <p className="text-green-600 text-xs">
                      {images.filter((img) => img.uploaded).length} of {images.length} images uploaded successfully
                    </p>
                  )}
                </div>
              </> : currentStep === 4 ?
                (<PricingShippingForm pricingShippingForm={pricingShippingForm} />)
                : null}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          <div className="flex gap-2">

            <LoadingButton disabled={pricingShippingForm.state.isSubmitting}
              loading={pricingShippingForm.state.isSubmitting}
              type="submit" form="partform">
              {currentStep < 4 ? "Next" : "Create Listing"}
            </LoadingButton>
          </div>
        </div>
      </form>

    </div>
  );
}
