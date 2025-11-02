export interface PriceHistoryEntry {
  date: string;
  price: number;
}

export interface PriceEntry {
  platform: string;
  price: string;
  link: string;
}

export interface AnalysisResult {
  productName: string;
  verdict: string;
  reasoning: string;
  customerSentiment: string;
  bestDeal: PriceEntry;
  priceList: PriceEntry[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface AnalyzedData {
  result: AnalysisResult;
  sources: GroundingChunk[];
}
