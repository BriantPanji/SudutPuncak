import type { Gunung } from "@t/gunung";
import { readFileSync, writeFileSync } from "fs";

/**
 * Escapes special XML characters in a string
 */
function escapeXml(str: string | null | undefined): string {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Converts serialized mountain data to RDF/XML format
 * 
 * This function creates an RDF document with the following classes:
 * 1. sdp:Mountain - Main class for mountain entities
 * 2. sdp:Province - Class for Indonesian provinces
 * 3. sdp:Location - Class for geographic coordinates (lat/lon)
 * 4. sdp:VolcanicCategory - Class for MAGMA volcanic categories (A, B, C)
 * 5. sdp:StatusLevel - Class for hiking difficulty/status levels
 * 6. sdp:Restriction - Class for access restrictions (dates)
 */
export function convertToRdf(inputFileName: string, outputFileName: string): void {
    console.log(`Converting data from ${inputFileName} to RDF format...`);
    
    const rawData = readFileSync(inputFileName, "utf-8");
    const gunungList: Gunung[] = JSON.parse(rawData);

    const rdfLines: string[] = [];

    // XML declaration and RDF root element with namespace declarations
    rdfLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    rdfLines.push('<rdf:RDF');
    rdfLines.push('    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"');
    rdfLines.push('    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"');
    rdfLines.push('    xmlns:owl="http://www.w3.org/2002/07/owl#"');
    rdfLines.push('    xmlns:xsd="http://www.w3.org/2001/XMLSchema#"');
    rdfLines.push('    xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"');
    rdfLines.push('    xmlns:sdp="http://sudutpuncak.com/ontology#"');
    rdfLines.push('    xmlns:sdpr="http://sudutpuncak.com/resource/">');
    rdfLines.push('');

    // Define OWL Classes
    rdfLines.push('    <!-- OWL Class Definitions -->');
    rdfLines.push('');
    
    // Class 1: Mountain
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#Mountain">');
    rdfLines.push('        <rdfs:label xml:lang="id">Gunung</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Mountain</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan gunung di Indonesia</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Class 2: Province
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#Province">');
    rdfLines.push('        <rdfs:label xml:lang="id">Provinsi</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Province</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan provinsi di Indonesia</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Class 3: Location
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#Location">');
    rdfLines.push('        <rdfs:label xml:lang="id">Lokasi</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Location</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan koordinat geografis</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Class 4: VolcanicCategory
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#VolcanicCategory">');
    rdfLines.push('        <rdfs:label xml:lang="id">Kategori Vulkanik</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Volcanic Category</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan kategori gunung berapi MAGMA Indonesia</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Class 5: StatusLevel
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#StatusLevel">');
    rdfLines.push('        <rdfs:label xml:lang="id">Tingkat Status</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Status Level</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan tingkat kesulitan pendakian</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Class 6: Restriction
    rdfLines.push('    <owl:Class rdf:about="http://sudutpuncak.com/ontology#Restriction">');
    rdfLines.push('        <rdfs:label xml:lang="id">Pembatasan</rdfs:label>');
    rdfLines.push('        <rdfs:label xml:lang="en">Restriction</rdfs:label>');
    rdfLines.push('        <rdfs:comment xml:lang="id">Kelas untuk merepresentasikan pembatasan akses gunung</rdfs:comment>');
    rdfLines.push('    </owl:Class>');
    rdfLines.push('');

    // Define Object Properties
    rdfLines.push('    <!-- Object Property Definitions -->');
    rdfLines.push('');

    rdfLines.push('    <owl:ObjectProperty rdf:about="http://sudutpuncak.com/ontology#locatedInProvince">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://sudutpuncak.com/ontology#Province"/>');
    rdfLines.push('    </owl:ObjectProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:ObjectProperty rdf:about="http://sudutpuncak.com/ontology#hasLocation">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://sudutpuncak.com/ontology#Location"/>');
    rdfLines.push('    </owl:ObjectProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:ObjectProperty rdf:about="http://sudutpuncak.com/ontology#hasVolcanicCategory">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://sudutpuncak.com/ontology#VolcanicCategory"/>');
    rdfLines.push('    </owl:ObjectProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:ObjectProperty rdf:about="http://sudutpuncak.com/ontology#hasStatusLevel">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://sudutpuncak.com/ontology#StatusLevel"/>');
    rdfLines.push('    </owl:ObjectProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:ObjectProperty rdf:about="http://sudutpuncak.com/ontology#hasRestriction">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://sudutpuncak.com/ontology#Restriction"/>');
    rdfLines.push('    </owl:ObjectProperty>');
    rdfLines.push('');

    // Define Datatype Properties
    rdfLines.push('    <!-- Datatype Property Definitions -->');
    rdfLines.push('');

    rdfLines.push('    <owl:DatatypeProperty rdf:about="http://sudutpuncak.com/ontology#elevation">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#integer"/>');
    rdfLines.push('    </owl:DatatypeProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:DatatypeProperty rdf:about="http://sudutpuncak.com/ontology#description">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>');
    rdfLines.push('    </owl:DatatypeProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:DatatypeProperty rdf:about="http://sudutpuncak.com/ontology#imageUrl">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#anyURI"/>');
    rdfLines.push('    </owl:DatatypeProperty>');
    rdfLines.push('');

    rdfLines.push('    <owl:DatatypeProperty rdf:about="http://sudutpuncak.com/ontology#googleMapsUrl">');
    rdfLines.push('        <rdfs:domain rdf:resource="http://sudutpuncak.com/ontology#Mountain"/>');
    rdfLines.push('        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#anyURI"/>');
    rdfLines.push('    </owl:DatatypeProperty>');
    rdfLines.push('');

    // Collect unique provinces, volcanic categories, and status levels
    const provinces = new Set<string>();
    const volcanicCategories = new Set<string>();
    const statusLevels = new Set<number>();

    for (const gunung of gunungList) {
        if (gunung.province) {
            provinces.add(gunung.province);
        }
        if (gunung.magmaCategory && gunung.magmaCategory.trim() !== "") {
            volcanicCategories.add(gunung.magmaCategory);
        }
        if (gunung.statusLevel !== null && gunung.statusLevel !== undefined) {
            statusLevels.add(gunung.statusLevel);
        }
    }

    // Create Province instances
    rdfLines.push('    <!-- Province Instances -->');
    rdfLines.push('');
    for (const province of provinces) {
        const provinceId = province.replace(/\s+/g, "_");
        rdfLines.push(`    <sdp:Province rdf:about="http://sudutpuncak.com/resource/province/${encodeURIComponent(provinceId)}">`);
        rdfLines.push(`        <rdfs:label xml:lang="id">${escapeXml(province)}</rdfs:label>`);
        rdfLines.push('    </sdp:Province>');
        rdfLines.push('');
    }

    // Create VolcanicCategory instances
    rdfLines.push('    <!-- Volcanic Category Instances -->');
    rdfLines.push('');
    const magmaCategoryDescriptions: { [key: string]: string } = {
        "A": "Memiliki catatan sejarah letusan sejak tahun 1600",
        "B": "Memiliki catatan sejarah letusan sebelum tahun 1600",
        "C": "Tidak memiliki catatan sejarah letusan, tetapi masih memperlihatkan jejak aktivitas vulkanik seperti solfatara atau fumarola"
    };
    for (const category of volcanicCategories) {
        rdfLines.push(`    <sdp:VolcanicCategory rdf:about="http://sudutpuncak.com/resource/volcanic-category/${encodeURIComponent(category)}">`);
        rdfLines.push(`        <rdfs:label>Kategori ${escapeXml(category)}</rdfs:label>`);
        if (magmaCategoryDescriptions[category]) {
            rdfLines.push(`        <sdp:description>${escapeXml(magmaCategoryDescriptions[category])}</sdp:description>`);
        }
        rdfLines.push('    </sdp:VolcanicCategory>');
        rdfLines.push('');
    }

    // Create StatusLevel instances
    rdfLines.push('    <!-- Status Level Instances -->');
    rdfLines.push('');
    const statusLevelNames: { [key: number]: string } = {
        1: "Normal",
        2: "Waspada", 
        3: "Siaga",
        4: "Awas"
    };
    for (const level of statusLevels) {
        const levelName = statusLevelNames[level] || `Level ${level}`;
        rdfLines.push(`    <sdp:StatusLevel rdf:about="http://sudutpuncak.com/resource/status-level/${level}">`);
        rdfLines.push(`        <rdfs:label xml:lang="id">${escapeXml(levelName)}</rdfs:label>`);
        rdfLines.push(`        <sdp:levelValue rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">${level}</sdp:levelValue>`);
        rdfLines.push('    </sdp:StatusLevel>');
        rdfLines.push('');
    }

    // Create Mountain instances with their related resources
    rdfLines.push('    <!-- Mountain Instances -->');
    rdfLines.push('');
    
    for (const gunung of gunungList) {
        const mountainId = gunung.name.replace(/\s+/g, "_");
        const mountainUri = `http://sudutpuncak.com/resource/mountain/${encodeURIComponent(mountainId)}`;
        
        rdfLines.push(`    <sdp:Mountain rdf:about="${mountainUri}">`);
        rdfLines.push(`        <rdfs:label>${escapeXml(gunung.name)}</rdfs:label>`);
        
        // Description
        if (gunung.description) {
            rdfLines.push(`        <sdp:description xml:lang="id">${escapeXml(gunung.description)}</sdp:description>`);
        }
        
        // Elevation
        if (gunung.elevation !== null && gunung.elevation !== undefined) {
            rdfLines.push(`        <sdp:elevation rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">${gunung.elevation}</sdp:elevation>`);
        }
        
        // Image URL
        if (gunung.image && gunung.image !== "/images/default-image.webp") {
            const fullImageUrl = gunung.image.startsWith('http') 
                ? gunung.image 
                : `https://datagunung.com${gunung.image}`;
            rdfLines.push(`        <sdp:imageUrl rdf:datatype="http://www.w3.org/2001/XMLSchema#anyURI">${escapeXml(fullImageUrl)}</sdp:imageUrl>`);
        }
        
        // Google Maps URL
        if (gunung.gloc && gunung.gloc.trim() !== "") {
            rdfLines.push(`        <sdp:googleMapsUrl rdf:datatype="http://www.w3.org/2001/XMLSchema#anyURI">${escapeXml(gunung.gloc)}</sdp:googleMapsUrl>`);
        }
        
        // Province relationship
        if (gunung.province) {
            const provinceId = gunung.province.replace(/\s+/g, "_");
            rdfLines.push(`        <sdp:locatedInProvince rdf:resource="http://sudutpuncak.com/resource/province/${encodeURIComponent(provinceId)}"/>`);
        }
        
        // Volcanic Category relationship
        if (gunung.magmaCategory && gunung.magmaCategory.trim() !== "") {
            rdfLines.push(`        <sdp:hasVolcanicCategory rdf:resource="http://sudutpuncak.com/resource/volcanic-category/${encodeURIComponent(gunung.magmaCategory)}"/>`);
        }
        
        // Status Level relationship
        if (gunung.statusLevel !== null && gunung.statusLevel !== undefined) {
            rdfLines.push(`        <sdp:hasStatusLevel rdf:resource="http://sudutpuncak.com/resource/status-level/${gunung.statusLevel}"/>`);
        }
        
        // Location (if lat/lon available)
        if (gunung.lat !== null && gunung.lon !== null && gunung.lat !== undefined && gunung.lon !== undefined) {
            const locationUri = `http://sudutpuncak.com/resource/location/${encodeURIComponent(mountainId)}`;
            rdfLines.push(`        <sdp:hasLocation rdf:resource="${locationUri}"/>`);
        }
        
        // Restriction (if dates available)
        if (gunung.restrictedFrom || gunung.restrictedUntil) {
            const restrictionUri = `http://sudutpuncak.com/resource/restriction/${encodeURIComponent(mountainId)}`;
            rdfLines.push(`        <sdp:hasRestriction rdf:resource="${restrictionUri}"/>`);
        }
        
        rdfLines.push('    </sdp:Mountain>');
        rdfLines.push('');
        
        // Create Location instance
        if (gunung.lat !== null && gunung.lon !== null && gunung.lat !== undefined && gunung.lon !== undefined) {
            const locationUri = `http://sudutpuncak.com/resource/location/${encodeURIComponent(mountainId)}`;
            rdfLines.push(`    <sdp:Location rdf:about="${locationUri}">`);
            rdfLines.push(`        <rdfs:label>Lokasi ${escapeXml(gunung.name)}</rdfs:label>`);
            rdfLines.push(`        <geo:lat rdf:datatype="http://www.w3.org/2001/XMLSchema#double">${gunung.lat}</geo:lat>`);
            rdfLines.push(`        <geo:long rdf:datatype="http://www.w3.org/2001/XMLSchema#double">${gunung.lon}</geo:long>`);
            rdfLines.push('    </sdp:Location>');
            rdfLines.push('');
        }
        
        // Create Restriction instance
        if (gunung.restrictedFrom || gunung.restrictedUntil) {
            const restrictionUri = `http://sudutpuncak.com/resource/restriction/${encodeURIComponent(mountainId)}`;
            rdfLines.push(`    <sdp:Restriction rdf:about="${restrictionUri}">`);
            rdfLines.push(`        <rdfs:label>Pembatasan ${escapeXml(gunung.name)}</rdfs:label>`);
            if (gunung.restrictedFrom) {
                rdfLines.push(`        <sdp:restrictedFrom rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${escapeXml(gunung.restrictedFrom)}</sdp:restrictedFrom>`);
            }
            if (gunung.restrictedUntil) {
                rdfLines.push(`        <sdp:restrictedUntil rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${escapeXml(gunung.restrictedUntil)}</sdp:restrictedUntil>`);
            }
            rdfLines.push('    </sdp:Restriction>');
            rdfLines.push('');
        }
    }

    // Close RDF root element
    rdfLines.push('</rdf:RDF>');

    const rdfContent = rdfLines.join('\n');
    writeFileSync(outputFileName, rdfContent, 'utf-8');
    
    console.log(`RDF file written to ${outputFileName}`);
    console.log(`Total mountains: ${gunungList.length}`);
    console.log(`Total provinces: ${provinces.size}`);
    console.log(`Total volcanic categories: ${volcanicCategories.size}`);
    console.log(`Total status levels: ${statusLevels.size}`);
}
