export interface MountainResult {
  uri: string;
  name: string;
  description: string | null;
  elevation: number | null;
  imageUrl: string | null;
  province: string | null;
  lat: number | null;
  lon: number | null;
  statusLevel: string | null;
  volcanicCategory: string | null;
  googleMapsUrl: string | null;
  restrictedFrom: string | null;
  restrictedUntil: string | null;
}

export interface RelatedMountain {
  uri: string;
  name: string;
  elevation: number | null;
  imageUrl: string | null;
  province: string | null;
}

export interface SearchResponse {
  bestMatches: MountainResult[];
  otherMatches: MountainResult[];
  error?: string;
  message?: string;
}

export interface RelatedResponse {
  relatedMountains: RelatedMountain[];
}

export interface ProvincesResponse {
  provinces: string[];
}

export const DEFAULT_IMAGE_URL = 'https://datagunung.com/images/default-image.webp';

export function getImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return DEFAULT_IMAGE_URL;
  return imageUrl;
}
