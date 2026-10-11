export interface Format {
  id: string;
  name: string;
  ratio: string;
  w: number;
  h: number;
}

export const FORMATS: Format[] = [
  { id: 'story', name: 'Story / Reel', ratio: '9:16', w: 1080, h: 1920 },
  { id: 'portrait', name: 'Portrait Post', ratio: '4:5', w: 1080, h: 1350 },
  { id: 'square', name: 'Square', ratio: '1:1', w: 1080, h: 1080 },
  { id: 'pin', name: 'Pinterest Pin', ratio: '2:3', w: 1000, h: 1500 },
  { id: 'landscape', name: 'Landscape', ratio: '16:9', w: 1920, h: 1080 },
];

export const getFormat = (id: string) => FORMATS.find((f) => f.id === id) ?? FORMATS[0];
