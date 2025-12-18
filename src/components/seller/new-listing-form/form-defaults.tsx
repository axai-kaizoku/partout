import { Camera, Car, DollarSign, Package } from "lucide-react";

export const priceShippingDefaults = {
  price: "",
  originalPrice: "",
  currency: "USD",
  isNegotiable: false,
  partShippingId: "",
};

export const vehicleDetailsDefaults = {
  makeId: "",
  modelId: "",
  yearStart: "",
  yearEnd: "",
  engine: "",
  trim: "",
  brand: "",
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
