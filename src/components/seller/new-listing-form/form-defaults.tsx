import { Camera, Car, DollarSign, Package } from "lucide-react";

export type ModelCompatibility = {
  id: string;
  makeId: string;
  makeName: string;
  modelId: string | null;
  modelName: string;
  yearStart: string;
  yearEnd: string;
  engine?: string;
  trim?: string;
  isNewModel: boolean;
};

export const priceShippingDefaults = {
  price: "",
  originalPrice: "",
  currency: "USD",
  isNegotiable: false,
  partShippingId: "",
};

export const vehicleDetailsDefaults = {
  brand: "",
  compatibleModels: [] as ModelCompatibility[],
};

export const modelCompatibilityEntryDefaults = {
  makeId: "",
  modelId: "",
  modelName: "",
  yearStart: "",
  yearEnd: "",
  engine: "",
  trim: "",
};

export const basicInfoDefaults = {
  title: "",
  description: "",
  categoryId: "",
  condition: "",
  partNumber: "",
  oem: "",
  material: "",
  warranty: "",
  quantity: "1",
  weight: "",
  dimensions: "",
};

export const steps = [
  { number: 1, title: "Basic Info", icon: Package },
  { number: 2, title: "Vehicle Details", icon: Car },
  { number: 3, title: "Photos", icon: Camera },
  { number: 4, title: "Pricing & Shipping", icon: DollarSign },
];
