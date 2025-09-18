import React from 'react';
import useMarketData from '../hooks/useMarketData';

const Ticker: React.FC = () => {
  const { data, loading } = useMarketData();
  
  if (loading || !data) {
    return (
        <div className="bg-gray-800 border-b border-gray-700 overflow-hidden text-center py-2 text-sm text-gray-400">
            Loading market data...
        </div>
    );
  }

  const tickerData = data.ticker;

  return (
    <div className="bg-gray-800 border-b border-gray-700 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerData.concat(tickerData).map((item, index) => (
          <div key={index} className="flex items-center mx-4 my-2">
            <span className="font-semibold text-gray-400">{item.name}</span>
            <span className="ml-2 font-mono text-white">${item.price.toFixed(2)}</span>
            <span
              className={`ml-2 font-mono text-sm ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
