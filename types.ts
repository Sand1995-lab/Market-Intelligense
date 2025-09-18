export enum View {
  OVERVIEW = 'OVERVIEW',
  POWER = 'POWER',
  GAS = 'GAS',
  RENEWABLES = 'RENEWABLES',
  CAPACITY = 'CAPACITY',
  ANCILLARY = 'ANCILLARY',
  RISK = 'RISK',
}

export interface TickerData {
  name: string;
  price: number;
  change: number;
}

export interface PriceDataPoint {
  time: string;
  price: number;
}

export interface PjmZoneDataPoint {
    date: string;
    price: number;
}

export interface GasData {
    storage: number;
    fiveYearAvg: number;
    production: number;
}

export interface RenewablesDataPoint {
    hour: string;
    wind: number;
    solar: number;
    demand: number;
}

export interface CapacityData {
    zone: string;
    clearingPrice: number;
    availableCapacity: number;
    peakDemand: number;
}

export interface AncillaryData {
    service: string;
    price: number;
    capacity: number;
}

export interface CorrelationData {
    name: string;
    Power: number;
    Gas: number;
    Oil: number;
    Coal: number;
    Carbon: number;
}

export interface MarketData {
  ticker: TickerData[];
  price: Record<string, PriceDataPoint[]>;
  pjmZoneData: Record<string, PjmZoneDataPoint[]>;
  gas: GasData;
  renewables: RenewablesDataPoint[];
  capacity: CapacityData[];
  ancillary: AncillaryData[];
  correlation: CorrelationData[];
}

export interface Alert {
  id: number;
  market: string;
  metric: 'price';
  condition: 'above' | 'below';
  value: number;
  triggered: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ForecastPoint {
    year: number;
    electricityPrice: number;
    gasPrice: number;
}

export interface LongTermForecast {
    forecastData: ForecastPoint[];
    analysis: string;
}