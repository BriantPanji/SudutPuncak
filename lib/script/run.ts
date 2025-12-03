import { fetchDataGunung } from "./scrape";
import { serializeDataGunung } from "./serialize";
import { convertToRdf } from "./toRdf";

async function main() {
    await fetchDataGunung();
    serializeDataGunung('../data/dataGunungList.json');
    convertToRdf('../data/dataGunungSerialized.json', '../data/dataGunungRdf.xml');
}

main();