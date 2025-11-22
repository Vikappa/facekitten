import {postImgIndexes} from "@/../../public/storedcatphotos/imgs/postImgIndexes"
import {coverPhotoIndexes} from "@/../../public/storedcatcoverphotos/coverPhotoIndexes"
import {marketplaceImgIndexes} from "@/../../public/storedcatmarketplacephotos/marketplacesImgIndexes"
import {picIndexes} from "@/../../public/storedcatprofilepictures/imgs/fileindexer"
/**
 * Combines multiple class names into a single string
 * @param classes - Variable number of class names
 * @returns Combined class name string
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Delays execution for a specified amount of time
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


/**
 * Checks if a value is empty
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Merges multiple objects
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function merge<T extends Record<string, unknown>>(
  ...objects: T[]
): T {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T)
}

export function getRandomImageFromFacekittenLibrary(width: number, height: number): string {
    return postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)];
}

export function getRandomProfilePictureFromFacekittenLibrary(): string {
    return picIndexes[Math.floor(Math.random() * picIndexes.length)];
}

export function getRandomCoverPhotoFromFacekittenLibrary(): string {
    return coverPhotoIndexes[Math.floor(Math.random() * coverPhotoIndexes.length)];
}

export function getRandomMarketplaceImageFromFacekittenLibrary(): string {
    return marketplaceImgIndexes[Math.floor(Math.random() * marketplaceImgIndexes.length)];
}

// Source - https://stackoverflow.com/a
// Posted by Hai Alaluf, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-22, License - CC BY-SA 4.0

export const imageUrlToBase64 = async (url: string) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
    reader.onerror = reject;
  });
};

