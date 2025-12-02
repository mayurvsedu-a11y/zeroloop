export interface WasteItem {
  category: string;
  weightGrams: number;
  recyclableStatus: string; // "Yes", "No", "Compost"
  notes: string;
}

export interface FinancialImpact {
  cogsRate: number;
  estimatedLoss: number;
}

export interface ManagerReport {
  biggestLossCategory: string;
  recommendations: string[];
}

export interface AnalysisResult {
  wasteBreakdown: WasteItem[];
  totalWeightGrams: number;
  financialImpact: FinancialImpact;
  managerReport: ManagerReport;
}

export enum AppState {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR,
}