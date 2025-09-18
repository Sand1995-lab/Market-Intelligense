import { useState, useEffect } from 'react';
import { MarketData, PriceDataPoint } from '../types';

const generateInitialMockData = (): MarketData => {
  const ercotPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 30 + Math.random() * 40,
  }));

  const pjmPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 25 + Math.random() * 30,
  }));

  const caisoPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 45 + Math.random() * 50,
  }));

  const misoPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 28 + Math.random() * 20,
  }));

  const nyisoPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 35 + Math.random() * 35,
  }));

  const sppPrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 25 + Math.random() * 25,
  }));

  const isonePrices = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    price: 40 + Math.random() * 40,
  }));
  
  const renewables = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    wind: 5000 + Math.random() * 2000,
    solar: i > 5 && i < 20 ? Math.sin((i - 6) / 14 * Math.PI) * 8000 : 0,
    demand: 40000 + Math.random() * 10000 + Math.sin(i / 12 * Math.PI) * 5000,
  }));

  return {
    ticker: [
      { name: 'ERCOT', price: 45.75, change: 2.50 },
      { name: 'PJM', price: 38.20, change: -1.15 },
      { name: 'MISO', price: 35.50, change: 0.75 },
      { name: 'CAISO', price: 55.10, change: 5.30 },
      { name: 'NYISO', price: 42.80, change: -0.90 },
      { name: 'SPP', price: 33.90, change: 1.20 },
      { name: 'ISONE', price: 48.60, change: -2.40 },
    ],
    price: {
      ERCOT: ercotPrices,
      PJM: pjmPrices,
      CAISO: caisoPrices,
      MISO: misoPrices,
      NYISO: nyisoPrices,
      SPP: sppPrices,
      ISONE: isonePrices,
    },
    pjmZoneData: {
        'WEST': Array.from({ length: 7 }, (_, i) => ({ date: `D-${i}`, price: 38 + (Math.random() - 0.5) * 5 })),
        'EAST': Array.from({ length: 7 }, (_, i) => ({ date: `D-${i}`, price: 42 + (Math.random() - 0.5) * 5 })),
        'COMED': Array.from({ length: 7 }, (_, i) => ({ date: `D-${i}`, price: 35 + (Math.random() - 0.5) * 5 })),
    },
    gas: {
      storage: 2850,
      fiveYearAvg: 2600,
      production: 102.5,
    },
    renewables: renewables,
    capacity: [
        { zone: 'PJM-RTO', clearingPrice: 3.45, availableCapacity: 155000, peakDemand: 145000 },
        { zone: 'NYISO-NYC', clearingPrice: 8.75, availableCapacity: 12000, peakDemand: 11500 },
        { zone: 'ISO-NE-CT', clearingPrice: 6.20, availableCapacity: 8500, peakDemand: 8000 },
    ],
    ancillary: [
        { service: 'Regulation', price: 15.50, capacity: 500 },
        { service: 'Spinning Reserve', price: 8.25, capacity: 1200 },
        { service: 'Non-Spinning Reserve', price: 5.75, capacity: 2500 },
    ],
    correlation: [
        { name: 'Power', Power: 1.0, Gas: 0.7, Oil: 0.4, Coal: 0.5, Carbon: 0.3 },
        { name: 'Gas', Power: 0.7, Gas: 1.0, Oil: 0.6, Coal: 0.4, Carbon: 0.2 },
        { name: 'Oil', Power: 0.4, Gas: 0.6, Oil: 1.0, Coal: 0.3, Carbon: 0.1 },
        { name: 'Coal', Power: 0.5, Gas: 0.4, Oil: 0.3, Coal: 1.0, Carbon: 0.2 },
        { name: 'Carbon', Power: 0.3, Gas: 0.2, Oil: 0.1, Coal: 0.2, Carbon: 1.0 },
    ]
  };
};

const useMarketData = () => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch
    setTimeout(() => {
      setData(generateInitialMockData());
      setLoading(false);
    }, 1000);

    // Simulate real-time updates
    const intervalId = setInterval(() => {
      setData(prevData => {
        if (!prevData) return null;

        // Update ticker data
        const newTicker = prevData.ticker.map(item => {
          const change = (Math.random() - 0.45) * 2; // Bias slightly positive
          const newPrice = Math.max(20, item.price + change);
          return { ...item, price: newPrice, change: newPrice - item.price };
        });
        
        // Update current price in price prediction using immutable patterns
        const newPriceData = Object.entries(prevData.price).reduce((acc, [market, prices]) => {
          if (prices.length === 0) {
            acc[market] = [];
            return acc;
          }
          const latestMarketPrice = newTicker.find(t => t.name === market)?.price;
          const lastPoint = prices[prices.length - 1];
          
          // Create a new array with a new object for the last price point
          acc[market] = [
            ...prices.slice(0, -1),
            { ...lastPoint, price: latestMarketPrice ?? lastPoint.price }
          ];
          return acc;
        }, {} as Record<string, PriceDataPoint[]>);


        // Update gas production
        const newGas = { ...prevData.gas, production: prevData.gas.production + (Math.random() - 0.5) * 0.1 };

        return { 
          ...prevData, 
          ticker: newTicker,
          price: newPriceData,
          gas: newGas,
        };
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return { data, loading };
};

export default useMarketData;