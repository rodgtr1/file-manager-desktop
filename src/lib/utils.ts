import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface FileSystemItem {
  name: string
  path: string
  size: number
  isDirectory: boolean
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  if (bytes < 1024) return `${bytes} Bytes`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / (1024 ** 2)).toFixed(2)} MB`
  return `${(bytes / (1024 ** 3)).toFixed(2)} GB`
}
