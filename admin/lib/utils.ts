import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateFormatter({date}:{date:string}){
  const readable = new Date(date).toLocaleString('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  });
  return readable
}

export const formatToLocalDatetime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/" : ""