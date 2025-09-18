
import React from 'react';
import { View, MarketData } from '../types';
import { 
    PriceChart, 
    GasStorageWidget, 
    RenewablesChart, 
    CapacityTable, 
    AncillaryTable, 
    CorrelationMatrix, 
    PJMZonalChart,
    MarketAnalysisWidget,
    AIAnalystChatWidget,
    LongTermForecastWidget
} from './widgets';

interface DashboardProps {
  activeView: View;
  marketData: MarketData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ activeView, marketData }) => {
    if (!marketData) {
        return <div className="p-4 text-center text-gray-400">Loading dashboard data...</div>;
    }
    
    const data = marketData; // for convenience

    const renderContent = () => {
        switch (activeView) {
            case View.OVERVIEW:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-4">
                           <PriceChart priceData={data.price} />
                           <GasStorageWidget gasData={data.gas} />
                        </div>
                        <div className="space-y-4">
                            <MarketAnalysisWidget marketData={data} />
                            <AIAnalystChatWidget marketData={data} />
                        </div>
                    </div>
                );
            case View.POWER:
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <PriceChart priceData={data.price} title="Intraday Power Prices by RTO" />
                        <PJMZonalChart pjmZoneData={data.pjmZoneData} />
                    </div>
                );
            case View.GAS:
                return <GasStorageWidget gasData={data.gas} />;
            case View.RENEWABLES:
                return <RenewablesChart renewablesData={data.renewables} />;
            case View.CAPACITY:
                return <CapacityTable capacityData={data.capacity} />;
            case View.ANCILLARY:
                return <AncillaryTable ancillaryData={data.ancillary} />;
            case View.RISK:
                return (
                    <div className="space-y-4">
                        <CorrelationMatrix correlationData={data.correlation} />
                        <LongTermForecastWidget />
                    </div>
                );
            default:
                return <div className="p-4 text-center">Select a view from the sidebar.</div>;
        }
    };

    return (
        <div>
            {renderContent()}
        </div>
    );
};

export default Dashboard;