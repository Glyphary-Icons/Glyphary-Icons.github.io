export type IconStyle = "stroke" | "solid";

export interface SetSummary {
  id: string;
  name: string;
  description: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  attribution?: string;
  style: IconStyle;
  categories: string[];
  count: number;
  preview: string[];
  filterCategories?: string[];
  browseCategories?: string[];
  categoryPreviews?: Record<string, string>;
  categoryCounts?: Record<string, number>;
}

export interface IconEntry {
  name: string;
  tags: string[];
  category?: string;
  svg: string;
}

export interface IconManifest {
  id: string;
  name: string;
  description: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  attribution?: string;
  style: IconStyle;
  categories: string[];
  count: number;
  icons: IconEntry[];
}
