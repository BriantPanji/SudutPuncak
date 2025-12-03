import { NextRequest, NextResponse } from "next/server";

// Jena Fuseki endpoint configuration
const FUSEKI_ENDPOINT = process.env.FUSEKI_ENDPOINT || "http://localhost:3030/gunung/query";

interface SparqlBinding {
  [key: string]: {
    type: string;
    value: string;
  };
}

interface SparqlResults {
  results: {
    bindings: SparqlBinding[];
  };
}

/**
 * Sanitizes user input for safe use in SPARQL queries
 * Escapes special characters that could be used for SPARQL injection
 */
function sanitizeSparqlInput(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Generate abbreviation patterns from a name
 * e.g., "Semeru" -> ["se", "sem", "seme", "semer", "smr", "smru"]
 */
function generateAbbreviations(name: string): string[] {
  const lower = name.toLowerCase();
  const abbrevs: string[] = [];
  
  // Progressive prefixes (starting from 2 characters to avoid single char matches)
  for (let i = 2; i <= lower.length; i++) {
    abbrevs.push(lower.substring(0, i));
  }
  
  // Consonant-only abbreviation (smr for semeru)
  const consonants = lower.replace(/[aeiou]/g, '');
  if (consonants.length >= 2) {
    abbrevs.push(consonants);
    // Also add progressive consonant prefixes
    for (let i = 2; i <= consonants.length; i++) {
      abbrevs.push(consonants.substring(0, i));
    }
  }
  
  // First letter + consonants after vowels
  const firstAndConsonants = lower[0] + lower.slice(1).replace(/[aeiou]/g, '');
  if (firstAndConsonants.length >= 2) {
    abbrevs.push(firstAndConsonants);
  }
  
  return [...new Set(abbrevs)];
}

/**
 * Calculate similarity between two strings using character-based matching
 * Returns a score between 0 and 1
 */
function calculateSimilarity(query: string, name: string): number {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  
  // Exact match
  if (n === q) return 1.0;
  
  // Name starts with query
  if (n.startsWith(q)) return 0.95;
  
  // Query is an abbreviation of name
  const abbrevs = generateAbbreviations(n);
  if (abbrevs.includes(q)) return 0.85;
  
  // Check if q contains all characters of name's abbreviation in order (fuzzy match)
  let j = 0;
  for (let i = 0; i < n.length && j < q.length; i++) {
    if (n[i] === q[j]) {
      j++;
    }
  }
  if (j === q.length) {
    return 0.7 * (q.length / n.length);
  }
  
  // Check for substring match
  if (n.includes(q)) {
    return 0.6;
  }
  
  // Check for partial character match
  let matchCount = 0;
  for (const char of q) {
    if (n.includes(char)) {
      matchCount++;
    }
  }
  
  return (matchCount / Math.max(q.length, n.length)) * 0.4;
}

/**
 * Check if query is a "best match" (high similarity with name)
 */
function isBestMatch(name: string, query: string): boolean {
  const similarity = calculateSimilarity(query, name);
  return similarity >= 0.7;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const mountainName = searchParams.get("name") || "";
  const province = searchParams.get("province") || "";
  const minElevation = searchParams.get("minElevation") || "";
  const sortBy = searchParams.get("sortBy") || "name"; // name, province, elevation
  const sortOrder = searchParams.get("sortOrder") || "asc"; // asc, desc
  const relatedTo = searchParams.get("relatedTo") || ""; // For related mountains

  // If requesting specific mountain by name
  if (mountainName) {
    return await getMountainByName(mountainName);
  }

  // If requesting related mountains
  if (relatedTo) {
    return await getRelatedMountains(relatedTo);
  }

  // If requesting provinces list
  if (searchParams.get("provinces") === "true") {
    return await getProvinces();
  }

  if (!query.trim() && !province && !minElevation) {
    return NextResponse.json({ bestMatches: [], otherMatches: [], provinces: [] });
  }

  // SPARQL query to get all mountains (we'll filter client-side for fuzzy matching)
  const sparqlQuery = `
    PREFIX sdp: <http://sudutpuncak.com/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?mountain ?name ?description ?elevation ?imageUrl ?province ?lat ?lon ?statusLevel ?volcanicCategory ?googleMapsUrl ?restrictedFrom ?restrictedUntil
    WHERE {
      ?mountain a sdp:Mountain ;
                rdfs:label ?name .
      
      OPTIONAL { ?mountain sdp:description ?description . }
      OPTIONAL { ?mountain sdp:elevation ?elevation . }
      OPTIONAL { ?mountain sdp:imageUrl ?imageUrl . }
      OPTIONAL { ?mountain sdp:googleMapsUrl ?googleMapsUrl . }
      
      OPTIONAL {
        ?mountain sdp:locatedInProvince ?provinceUri .
        ?provinceUri rdfs:label ?province .
      }
      
      OPTIONAL {
        ?mountain sdp:hasLocation ?location .
        ?location geo:lat ?lat ;
                  geo:long ?lon .
      }
      
      OPTIONAL {
        ?mountain sdp:hasStatusLevel ?statusLevelUri .
        ?statusLevelUri rdfs:label ?statusLevel .
      }
      
      OPTIONAL {
        ?mountain sdp:hasVolcanicCategory ?volcanicCategoryUri .
        ?volcanicCategoryUri rdfs:label ?volcanicCategory .
      }
      
      OPTIONAL {
        ?mountain sdp:hasRestriction ?restriction .
        ?restriction sdp:restrictedFrom ?restrictedFrom .
        ?restriction sdp:restrictedUntil ?restrictedUntil .
      }
    }
    ORDER BY ?name
  `;

  try {
    const response = await fetch(FUSEKI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(sparqlQuery)}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fuseki error:", errorText);
      return NextResponse.json(
        { error: "Failed to query SPARQL endpoint", details: errorText },
        { status: 500 }
      );
    }

    const data: SparqlResults = await response.json();

    // Transform results
    let allResults = data.results.bindings.map((binding) => ({
      uri: binding.mountain?.value || "",
      name: binding.name?.value || "",
      description: binding.description?.value || null,
      elevation: binding.elevation?.value ? parseInt(binding.elevation.value) : null,
      imageUrl: binding.imageUrl?.value || null,
      province: binding.province?.value || null,
      lat: binding.lat?.value ? parseFloat(binding.lat.value) : null,
      lon: binding.lon?.value ? parseFloat(binding.lon.value) : null,
      statusLevel: binding.statusLevel?.value || null,
      volcanicCategory: binding.volcanicCategory?.value || null,
      googleMapsUrl: binding.googleMapsUrl?.value || null,
      restrictedFrom: binding.restrictedFrom?.value || null,
      restrictedUntil: binding.restrictedUntil?.value || null,
    }));

    // Apply province filter
    if (province) {
      allResults = allResults.filter(
        (r) => r.province?.toLowerCase() === province.toLowerCase()
      );
    }

    // Apply minimum elevation filter
    if (minElevation) {
      const minElev = parseInt(minElevation);
      if (!isNaN(minElev)) {
        allResults = allResults.filter(
          (r) => r.elevation !== null && r.elevation >= minElev
        );
      }
    }

    // Filter and categorize results by query
    const bestMatches: typeof allResults = [];
    const otherMatches: { result: typeof allResults[0]; score: number }[] = [];

    if (query.trim()) {
      const queryLower = query.trim().toLowerCase();

      for (const result of allResults) {
        const provinceLower = result.province?.toLowerCase() || "";
        const descriptionLower = result.description?.toLowerCase() || "";

        // Calculate similarity score for name
        const nameScore = calculateSimilarity(queryLower, result.name);
        
        // Check for best match (high similarity with name)
        if (isBestMatch(result.name, query)) {
          bestMatches.push(result);
        } else {
          // Calculate other scores
          const provinceScore = provinceLower.includes(queryLower) ? 0.5 : calculateSimilarity(queryLower, provinceLower) * 0.4;
          const descriptionScore = descriptionLower.includes(queryLower) ? 0.4 : 0;
          
          const maxScore = Math.max(nameScore, provinceScore, descriptionScore);
          
          // Include if score is above threshold
          if (maxScore > 0.15) {
            otherMatches.push({ result, score: maxScore });
          }
        }
      }

      // Sort best matches by similarity
      bestMatches.sort((a, b) => {
        const scoreA = calculateSimilarity(queryLower, a.name);
        const scoreB = calculateSimilarity(queryLower, b.name);
        return scoreB - scoreA;
      });

      // Sort other matches by score
      otherMatches.sort((a, b) => b.score - a.score);
    } else {
      // No query, just filters - all results go to otherMatches
      for (const result of allResults) {
        otherMatches.push({ result, score: 0.5 });
      }
    }

    // Apply sorting to final results
    const sortResults = (results: typeof allResults) => {
      return results.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "province":
            comparison = (a.province || "").localeCompare(b.province || "");
            break;
          case "elevation":
            comparison = (a.elevation || 0) - (b.elevation || 0);
            break;
          default:
            comparison = 0;
        }
        return sortOrder === "desc" ? -comparison : comparison;
      });
    };

    // Only apply sorting if explicitly requested (not during fuzzy search)
    const finalBestMatches = query.trim() ? bestMatches : sortResults(bestMatches);
    const finalOtherMatches = query.trim() 
      ? otherMatches.map((m) => m.result)
      : sortResults(otherMatches.map((m) => m.result));

    return NextResponse.json({
      bestMatches: finalBestMatches.slice(0, 15),
      otherMatches: finalOtherMatches.slice(0, 30),
    });
  } catch (error) {
    console.error("Error querying Fuseki:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to SPARQL endpoint",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getProvinces() {
  const sparqlQuery = `
    PREFIX sdp: <http://sudutpuncak.com/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?province
    WHERE {
      ?mountain a sdp:Mountain ;
                sdp:locatedInProvince ?provinceUri .
      ?provinceUri rdfs:label ?province .
    }
    ORDER BY ?province
  `;

  try {
    const response = await fetch(FUSEKI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(sparqlQuery)}`,
    });

    if (!response.ok) {
      return NextResponse.json({ provinces: [] });
    }

    const data: SparqlResults = await response.json();
    const provinces = data.results.bindings.map((b) => b.province?.value || "").filter(Boolean);

    return NextResponse.json({ provinces });
  } catch {
    return NextResponse.json({ provinces: [] });
  }
}

async function getRelatedMountains(mountainName: string) {
  const sanitizedName = sanitizeSparqlInput(mountainName);

  // First, get the mountain's province and elevation
  const getMountainQuery = `
    PREFIX sdp: <http://sudutpuncak.com/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?province ?elevation
    WHERE {
      ?mountain a sdp:Mountain ;
                rdfs:label ?name .
      FILTER(LCASE(?name) = LCASE("${sanitizedName}"))
      
      OPTIONAL {
        ?mountain sdp:locatedInProvince ?provinceUri .
        ?provinceUri rdfs:label ?province .
      }
      OPTIONAL { ?mountain sdp:elevation ?elevation . }
    }
    LIMIT 1
  `;

  try {
    const mountainResponse = await fetch(FUSEKI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(getMountainQuery)}`,
    });

    if (!mountainResponse.ok) {
      return NextResponse.json({ relatedMountains: [] });
    }

    const mountainData: SparqlResults = await mountainResponse.json();
    if (mountainData.results.bindings.length === 0) {
      return NextResponse.json({ relatedMountains: [] });
    }

    const binding = mountainData.results.bindings[0];
    const province = binding.province?.value || "";
    const elevation = binding.elevation?.value ? parseInt(binding.elevation.value) : 0;

    // Build the SPARQL filter for related mountains
    const elevationMin = elevation - 500;
    const elevationMax = elevation + 500;
    const elevationFilter = `BOUND(?elevation) && ?elevation >= ${elevationMin} && ?elevation <= ${elevationMax}`;
    const relatedFilter = province 
      ? `FILTER(?province = "${province}" || (${elevationFilter}))`
      : `FILTER(${elevationFilter})`;

    // Get related mountains (same province OR similar elevation ±500m)
    const relatedQuery = `
      PREFIX sdp: <http://sudutpuncak.com/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

      SELECT ?mountain ?name ?elevation ?imageUrl ?province
      WHERE {
        ?mountain a sdp:Mountain ;
                  rdfs:label ?name .
        
        FILTER(LCASE(?name) != LCASE("${sanitizedName}"))
        
        OPTIONAL { ?mountain sdp:elevation ?elevation . }
        OPTIONAL { ?mountain sdp:imageUrl ?imageUrl . }
        
        OPTIONAL {
          ?mountain sdp:locatedInProvince ?provinceUri .
          ?provinceUri rdfs:label ?province .
        }
        
        ${relatedFilter}
      }
      ORDER BY DESC(?province = "${province}") ?name
      LIMIT 6
    `;

    const relatedResponse = await fetch(FUSEKI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(relatedQuery)}`,
    });

    if (!relatedResponse.ok) {
      return NextResponse.json({ relatedMountains: [] });
    }

    const relatedData: SparqlResults = await relatedResponse.json();
    const relatedMountains = relatedData.results.bindings.map((b) => ({
      uri: b.mountain?.value || "",
      name: b.name?.value || "",
      elevation: b.elevation?.value ? parseInt(b.elevation.value) : null,
      imageUrl: b.imageUrl?.value || null,
      province: b.province?.value || null,
    }));

    return NextResponse.json({ relatedMountains });
  } catch {
    return NextResponse.json({ relatedMountains: [] });
  }
}

async function getMountainByName(name: string) {
  const sanitizedName = sanitizeSparqlInput(name);

  const sparqlQuery = `
    PREFIX sdp: <http://sudutpuncak.com/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?mountain ?name ?description ?elevation ?imageUrl ?province ?lat ?lon ?statusLevel ?volcanicCategory ?googleMapsUrl ?restrictedFrom ?restrictedUntil
    WHERE {
      ?mountain a sdp:Mountain ;
                rdfs:label ?name .
      
      FILTER(LCASE(?name) = LCASE("${sanitizedName}"))
      
      OPTIONAL { ?mountain sdp:description ?description . }
      OPTIONAL { ?mountain sdp:elevation ?elevation . }
      OPTIONAL { ?mountain sdp:imageUrl ?imageUrl . }
      OPTIONAL { ?mountain sdp:googleMapsUrl ?googleMapsUrl . }
      
      OPTIONAL {
        ?mountain sdp:locatedInProvince ?provinceUri .
        ?provinceUri rdfs:label ?province .
      }
      
      OPTIONAL {
        ?mountain sdp:hasLocation ?location .
        ?location geo:lat ?lat ;
                  geo:long ?lon .
      }
      
      OPTIONAL {
        ?mountain sdp:hasStatusLevel ?statusLevelUri .
        ?statusLevelUri rdfs:label ?statusLevel .
      }
      
      OPTIONAL {
        ?mountain sdp:hasVolcanicCategory ?volcanicCategoryUri .
        ?volcanicCategoryUri rdfs:label ?volcanicCategory .
      }
      
      OPTIONAL {
        ?mountain sdp:hasRestriction ?restriction .
        ?restriction sdp:restrictedFrom ?restrictedFrom .
        ?restriction sdp:restrictedUntil ?restrictedUntil .
      }
    }
    LIMIT 1
  `;

  try {
    const response = await fetch(FUSEKI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(sparqlQuery)}`,
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Mountain not found" }, { status: 404 });
    }

    const data: SparqlResults = await response.json();

    if (data.results.bindings.length === 0) {
      return NextResponse.json({ error: "Mountain not found" }, { status: 404 });
    }

    const binding = data.results.bindings[0];
    const result = {
      uri: binding.mountain?.value || "",
      name: binding.name?.value || "",
      description: binding.description?.value || null,
      elevation: binding.elevation?.value ? parseInt(binding.elevation.value) : null,
      imageUrl: binding.imageUrl?.value || null,
      province: binding.province?.value || null,
      lat: binding.lat?.value ? parseFloat(binding.lat.value) : null,
      lon: binding.lon?.value ? parseFloat(binding.lon.value) : null,
      statusLevel: binding.statusLevel?.value || null,
      volcanicCategory: binding.volcanicCategory?.value || null,
      googleMapsUrl: binding.googleMapsUrl?.value || null,
      restrictedFrom: binding.restrictedFrom?.value || null,
      restrictedUntil: binding.restrictedUntil?.value || null,
    };

    return NextResponse.json({ mountain: result });
  } catch (error) {
    console.error("Error fetching mountain:", error);
    return NextResponse.json({ error: "Failed to fetch mountain" }, { status: 500 });
  }
}
