export type ColorRole = "primary" | "secondary" | "accent" | "neutral" | "background";

export type Color = {
  hex: string;
  role: ColorRole;
};

export type Typography = {
  heading: string;
  body: string;
  rationale: string;
};

export type ReferenceImage = {
  url: string;
  prompt: string;
  id: string;
};

export type ConceptResult = {
  id: string;
  shareId?: string;
  createdAt: string;
  prompt: string;
  summary: string;
  brandPersonality: string[];
  audience: string;
  moodKeywords: string[];
  visualLanguage: string;
  palette: Color[];
  typography: Typography;
  voice: string;
  referenceImages: ReferenceImage[];
};
