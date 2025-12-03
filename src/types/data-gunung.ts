export interface DataGunungRaw {
    id: string;
    image: string;
    magmaCategory: string;
    gloc: string;
    giframe: string;
    description?: string | null;
    province?: string;
    elevation?: number | null;
    lat?: number | null;
    lon?: number | null;
    details?: string;
    transport?: string;
    imageCredits?: string;
    imageCreditsUrl?: string;
    imageLicenseType?: string;
    imageLicenseTypeUrl?: string;
}