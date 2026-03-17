export interface Layer {
  label: string;
  emoji: string;
}

export interface LayerSuggestion {
  layers: Layer[];
  personalFeelsLike: number; // effective temp after sensitivity offset
  showUmbrellaTip: boolean;
}
