import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const phoneRegex = /^[0-9]{0,10}$/

export const validatePhone = (inputValue: string, onPhoneChange: (value: string) => void) => {
  if (!inputValue || phoneRegex.test(inputValue)) {
    onPhoneChange(inputValue)
  }
}