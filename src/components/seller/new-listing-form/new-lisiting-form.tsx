import { useAppForm } from "@/components/form";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basicInfoForm = useAppForm({
    defaultValues: basicInfoDefaults,
    validators: {
      onChange: basicInfoSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
      setCurrentStep(2);
    },
  });

  const vehicleDetailsForm = useAppForm({
    defaultValues: vehicleDetailsDefaults,
    validators: {
      onChange: vehicleDetailsSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
      setCurrentStep(3);
    },
  })

  const pricingShippingForm = useAppForm({
    defaultValues: priceShippingDefaults,
    validators: {
      onChange: pricingShippingSchema,
    },
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
    },
  })

  const { mutateAsync: createModelForMake } = api.partInfo.createModelForMake.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep === 1) {
      basicInfoForm.handleSubmit()
    }
    if (currentStep === 2) {
      vehicleDetailsForm.handleSubmit();
    }
    if (currentStep === 3) {
      console.log(fileInputRef.current?.files);
      setCurrentStep(4);
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

            <LoadingButton type="submit" form="partform">
              {currentStep < 4 ? "Next" : "Create Listing"}
            </LoadingButton>
          </div>
        </div>
      </form>

    </div>
  );
}
