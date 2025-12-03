export interface Gunung {
    name: string;
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
    statusLevel?: number | null;
    restrictedFrom?: string | null;
    restrictedUntil?: string | null;
}