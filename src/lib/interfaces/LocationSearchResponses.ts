export interface LocationSearchResponse {
    type:     string;
    features: Feature[];
    query:    Query;
}

export interface Feature {
    type:       string;
    properties: Properties;
    geometry:   Geometry;
    bbox:       number[];
}

export interface Geometry {
    type:        string;
    coordinates: number[];
}

export interface Properties {
    datasource:         Datasource;
    other_names?:       OtherNames;
    country:            string;
    country_code:       string;
    state:              string;
    county:             string;
    city:               string;
    iso3166_2:          string;
    iso3166_2_sublevel: string;
    lon:                number;
    lat:                number;
    state_code:         string;
    result_type:        string;
    county_code:        string;
    NUTS_3:             string;
    formatted:          string;
    address_line1:      string;
    address_line2:      string;
    category:           string;
    timezone:           Timezone;
    plus_code:          string;
    plus_code_short:    string;
    rank:               Rank;
    place_id:           string;
    village?:           string;
    postcode?:          string;
}

export interface Datasource {
    sourcename:  string;
    attribution: string;
    license:     string;
    url:         string;
}

export interface OtherNames {
    "name:la":      string;
    "name:el":      string;
    "name:eo":      string;
    "name:ko":      string;
    "name:ml":      string;
    "name:ru":      string;
    "name:uk":      string;
    "name:zh":      string;
    "name:zh-Hant": string;
}

export interface Rank {
    importance:            number;
    popularity:            number;
    confidence:            number;
    confidence_city_level: number;
    match_type:            string;
}

export interface Timezone {
    name:               string;
    offset_STD:         string;
    offset_STD_seconds: number;
    offset_DST:         string;
    offset_DST_seconds: number;
    abbreviation_STD:   string;
    abbreviation_DST:   string;
}

export interface Query {
    text:   string;
    parsed: Parsed;
}

export interface Parsed {
    city:          string;
    expected_type: string;
}
