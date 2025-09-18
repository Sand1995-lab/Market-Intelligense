import React, { useState, useEffect } from 'react';
import { Alert, MarketData } from '../types';
import { PlusCircle, Trash2, Bell } from 'lucide-react';

interface AlertManagerProps {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'triggered'>) => void;
  removeAlert: (id: number) => void;
  marketData: MarketData | null;
}

const AlertManager: React.FC<AlertManagerProps> = ({ alerts, addAlert, removeAlert, marketData }) => {
    const availableMarkets = marketData?.ticker.map(t => t.name) || [];
    const [market, setMarket] = useState(availableMarkets[0] || '');
    const [condition, setCondition] = useState<'above' | 'below'>('above');
    const [value, setValue] = useState('');

    useEffect(() => {
        // Set default market when available markets load
        if (!market && availableMarkets.length > 0) {
            setMarket(availableMarkets[0]);
        }
    }, [availableMarkets, market]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(value);
        if (!market || isNaN(numericValue) || numericValue <= 0) {
            alert("Please provide a valid market and a positive numeric value for the alert.");
            return;
        }
        addAlert({ market, metric: 'price', condition, value: numericValue });
        setValue('');
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Bell className="h-5 w-5 mr-2" />Alert Manager</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                <div>
                    <label htmlFor="market" className="block text-sm font-medium text-gray-400 mb-1">Market</label>
                    <select id="market" value={market} onChange={e => setMarket(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        {availableMarkets.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-400 mb-1">Condition</label>
                    <select id="condition" value={condition} onChange={e => setCondition(e.target.value as 'above' | 'below')} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="above">Price Above</option>
                        <option value="below">Price Below</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-400 mb-1">Value ($)</label>
                    <input type="number" step="0.01" id="value" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g., 50.25" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center text-sm transition-colors">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Alert
                </button>
            </form>

            <div className="space-y-2">
                {alerts.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">No active alerts.</p>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={`flex justify-between items-center p-3 rounded-md text-sm ${alert.triggered ? 'bg-yellow-600 bg-opacity-30 border-l-4 border-yellow-500' : 'bg-gray-700'}`}>
                            <div>
                                <span className="font-bold">{alert.market}</span> price goes <span className="font-semibold">{alert.condition}</span> <span className="font-mono bg-gray-800 px-1 rounded">${alert.value.toFixed(2)}</span>
                            </div>
                             <button onClick={() => removeAlert(alert.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertManager;
