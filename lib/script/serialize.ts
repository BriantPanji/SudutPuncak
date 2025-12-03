import type { Gunung } from "@t/gunung";
import { readFileSync, writeFileSync } from "fs";


export function serializeDataGunung(fileName: string) {
    console.log(`Serializing data gunung from ${fileName}...`);
    const rawData = readFileSync(fileName, 'utf-8');
    interface Gunung {
        name: string;
        image: string;
        magmaCategory: string;
        gloc: string;
        giframe: string;
        description: string | null;
        province: string;
        elevation: number | null;
        lat: number | null;
        lon: number | null;
        details: string | null;
        transport: string | null;
        statusLevel: string | null;
        restrictedFrom: string | null;
        restrictedUntil: string | null;
    }

    interface RawGunung {
        id: string;
        image: string;
        magmaCategory: string;
        gloc: string;
        giframe: string;
        description?: string;
        province: string;
        elevation?: number;
        lat?: number;
        lon?: number;
        details?: string;
        transport?: string;
        statusLevel?: string;
        restrictedFrom?: string;
        restrictedUntil?: string;
    }

    const dataGunungList: Gunung[] = JSON.parse(rawData)
    .map((z: RawGunung) => {
        return {
            name: z.id,
            image: z.image,
            magmaCategory: z.magmaCategory,
            gloc: z.gloc,
            giframe: z.giframe,
            description: z.description ?? null,
            province: z.province,
            elevation: z.elevation ?? null,
            lat: z.lat ?? null,
            lon: z.lon ?? null,
            details: z.details ?? null,
            transport: z.transport ?? null,
            statusLevel: z.statusLevel ?? null,
            restrictedFrom: z.restrictedFrom ?? null,
            restrictedUntil: z.restrictedUntil ?? null,
        };
    });
    writeFileSync('../data/dataGunungSerialized.json', JSON.stringify(dataGunungList, null, 2), 'utf-8');
    console.log(`Serialized data gunung written to ../data/dataGunungSerialized.json`);

}
