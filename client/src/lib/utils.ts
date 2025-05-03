import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

type Result<T> = [data: T, error: null] | [data: null, error: Error];

export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err as Error];
  }
}
