import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
  }).format(amount)
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("ar-DZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat("ar-DZ", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(date))
}
