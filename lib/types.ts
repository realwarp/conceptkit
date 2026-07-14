export type ColorRole = "primary" | "secondary" | "accent" | "neutral" | "background";

export type Color = {
  role: ColorRole;
  hex: string;
  rationale: string;
};

export type FontChoice = {
  family: string;
  rationale: string;
};

export type Typography = {
  heading: FontChoice;
  body: FontChoice;
  pairing: string;
};

export type ReferenceImage = {
  url: string;
  prompt: string;
};

export type ConceptResult = {
  id: string;
  prompt: string;
  brandSummary: string;
  brandPersonality: string[];
  audience: string;
  moodKeywords: string[];
  visualLanguage: string;
  palette: Color[];
  typography: Typography;
  voice: string;
  referenceImages: ReferenceImage[];
};

export type ConceptResultWithShare = ConceptResult & { shareId?: string };
