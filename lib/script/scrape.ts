import { DataGunungRaw } from '@t/data-gunung';
import { writeFileSync } from 'fs';
type dataVal = string | number[] | number | null;
interface dataEntry {
    [key: string]: string;
}

const valueKey = ["id", "magmaCategory", "image", "name", "gloc", "giframe", "gplaceid", "alias", "description", "province", "elevation", "lat", "lon", "details", "transport", "imageCredits", "imageCreditsUrl", "imageLicenseType", "imageLicenseTypeUrl", "statusLevel", "statusDate", "createdAt", "updatedAt", "restrictedFrom", "restrictedUntil"];
const unneededData = ['name', 'alias', "createdAt", "updatedAt"];

function parseKeyValue(listKey: string[]) {
    if (listKey.length < 25) throw new Error('Not enough keys to parse');
    if (listKey.length > 25) throw new Error('Too many keys to parse');
    const parsed: dataEntry = {};
    for (let i = 0; i < listKey.length; i++) {
        if (unneededData.includes(valueKey[i])) continue;
        parsed[listKey[i]] = valueKey[i];
    }
    return parsed;
}

export async function fetchDataGunung() {
    console.log('--Starting to fetch data from datagunung.com--');
    const dataGunungList: DataGunungRaw[] = [];
    const banyakHalaman = 21;

    for (let i = 1; i <= banyakHalaman; i++) {
        console.log(`*Fetching page ${i} of ${banyakHalaman}`);
        const res = await fetch(`https://datagunung.com/gunung.data?_routes=routes%2Fgunung._index&halaman=${i}`);
        const data: unknown[] = await res.json();

        let isFirstDataObjFound = false;

        const gunungMap = new Map<string, dataVal>();
        let keyValue: dataEntry = {};

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (!isFirstDataObjFound) {
                if (typeof item !== 'object' || item === null) continue;
                if ('_8' in item) {
                    keyValue = parseKeyValue(Object.keys(item) as string[]);
                    isFirstDataObjFound = true;
                } else continue;
            }

            if (typeof item === 'object' && item !== null && '_8' in item) {
                if (gunungMap.size > 0) {
                    const gunungData = Object.fromEntries(gunungMap) as unknown as DataGunungRaw;
                    dataGunungList.push(gunungData);
                }
                gunungMap.clear();

                const objItem = item as { [key: string]: number };
                for (const [key, valueRef] of Object.entries(objItem)) {
                    if (valueRef === -5) continue;

                    if (typeof valueRef !== 'number' || valueRef < 0 || valueRef >= data.length) continue;

                    const fieldName = keyValue[key];
                    if (fieldName === undefined) continue;

                    const actualValue = data[valueRef];

                    if (Array.isArray(actualValue)) {
                        gunungMap.set(fieldName, null);
                    } else {
                        gunungMap.set(fieldName, actualValue as dataVal);
                    }
                }

            }

        }
        if (gunungMap.size > 0) {
            dataGunungList.push(Object.fromEntries(gunungMap) as unknown as DataGunungRaw);
        }
        console.log(`*Completed fetching page ${i}`);
    }
    console.log(`+Total mountains fetched: ${dataGunungList.length}`);

    dataGunungList.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });

    writeFileSync('../data/dataGunungList.json', JSON.stringify(dataGunungList, null, 2));
}
