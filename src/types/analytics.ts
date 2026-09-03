export interface KpiSummary {
  total_responses: number;
  avg_monthly_cost: number;
  avg_green_readiness: number;
}

export interface TransportModeDistribution {
  option_id: string;
  transport_mode: string;
  count: number;
  percentage: number;
}

export interface DistanceDistribution {
  option_id: string;
  distance_range: string;
  count: number;
  percentage: number;
}

export interface ReasonDistribution {
  option_id: string;
  reason: string;
  count: number;
}

export interface RatingDistribution {
  rating_score: number;
  count: number;
}

export interface AnalyticsSummaryData {
  kpis: KpiSummary;
  transport_modes: TransportModeDistribution[];
  daily_distances: DistanceDistribution[];
  reasons: ReasonDistribution[];
  green_readiness: RatingDistribution[];
  last_updated: string;
}
