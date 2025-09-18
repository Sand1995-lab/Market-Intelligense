
import React, { useState, useEffect, useRef } from 'react';
import { PriceDataPoint, GasData, RenewablesDataPoint, CapacityData, AncillaryData, CorrelationData, PjmZoneDataPoint, MarketData, ChatMessage, LongTermForecast } from '../types';
import { getMarketAnalysis, getChatResponse, generateLongTermForecast } from '../services/geminiService';
import { BarChart as BarChartIcon, TrendingUp, Zap, Wind, Layers, SlidersHorizontal, Shield, Flame, MessageSquare, Send, Bot } from 'lucide-react';
import { 
    ResponsiveContainer, 
    LineChart, 
    AreaChart,
    Line, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';

// A generic widget wrapper
const Widget: React.FC<{ title: string; children: React.ReactNode; icon?: React.ElementType }> = ({ title, children, icon: Icon }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-full flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            {Icon && <Icon className="h-5 w-5 mr-2" />}
            {title}
        </h3>
        <div className="flex-1 overflow-hidden">
            {children}
        </div>
    </div>
);

// MarketAnalysisWidget
export const MarketAnalysisWidget: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
    const [analysis, setAnalysis] = useState('Generating analysis...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (marketData) {
                setIsLoading(true);
                const result = await getMarketAnalysis(marketData);
                setAnalysis(result);
                setIsLoading(false);
            }
        };
        fetchAnalysis();
        
        const intervalId = setInterval(fetchAnalysis, 30000);
        return () => clearInterval(intervalId);
    }, [marketData]);

    return (
        <Widget title="AI Market Brief" icon={TrendingUp}>
             {isLoading ? <div className="text-gray-400">Loading...</div> : <p className="text-sm text-gray-300 whitespace-pre-line">{analysis}</p>}
        </Widget>
    );
};

// AIAnalystChatWidget
export const AIAnalystChatWidget: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "I'm Pulse, your AI market analyst. Ask me anything about the current market data." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages; // Pass previous messages for context
            const response = await getChatResponse(input, history, marketData);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Widget title="AI Analyst Chat" icon={MessageSquare}>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="rounded-lg px-3 py-2 bg-gray-700 text-gray-200 text-sm">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about the market..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-l-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-r-md flex items-center justify-center transition-colors disabled:bg-gray-600">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Widget>
    );
};

export const PriceChart: React.FC<{ priceData: Record<string, PriceDataPoint[]>; title?: string }> = ({ priceData, title = "Intraday Power Prices" }) => {
    const markets = Object.keys(priceData);
    const [selectedMarket, setSelectedMarket] = useState(markets[0] || '');
    const data = priceData[selectedMarket];

    return (
        <Widget title={title} icon={Zap}>
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <select value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-blue-500 focus:border-blue-500">
                        {markets.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                            <Line type="monotone" dataKey="price" stroke="#38BDF8" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Widget>
    );
};

export const GasStorageWidget: React.FC<{ gasData: GasData }> = ({ gasData }) => {
    const percentage = ((gasData.storage - gasData.fiveYearAvg) / gasData.fiveYearAvg) * 100;
    return (
        <Widget title="Natural Gas Market" icon={Flame}>
            <div className="space-y-3">
                <div className="text-sm">Storage: <span className="font-mono text-lg font-bold">{gasData.storage.toLocaleString()} Bcf</span></div>
                <div className="text-sm">5-Year Avg: <span className="font-mono">{gasData.fiveYearAvg.toLocaleString()} Bcf</span></div>
                <div className="text-sm">vs 5-Year Avg: <span className={`font-mono font-bold ${percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>{percentage.toFixed(2)}%</span></div>
                 <div className="text-sm">Production: <span className="font-mono">{gasData.production.toFixed(2)} Bcf/d</span></div>
            </div>
        </Widget>
    );
};

export const RenewablesChart: React.FC<{ renewablesData: RenewablesDataPoint[] }> = ({ renewablesData }) => {
     return (
        <Widget title="Renewable Generation vs Demand" icon={Wind}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={renewablesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Area type="monotone" dataKey="solar" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="wind" stackId="1" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="demand" stroke="#F87171" strokeWidth={2} dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </Widget>
    );
};

export const CapacityTable: React.FC<{ capacityData: CapacityData[] }> = ({ capacityData }) => {
    return (
        <Widget title="Capacity Market Clearing Prices" icon={Layers}>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr><th className="px-4 py-2">Zone</th><th className="px-4 py-2 text-right">Clearing Price</th><th className="px-4 py-2 text-right">Available Capacity (MW)</th></tr>
                </thead>
                <tbody>
                    {capacityData.map(c => (
                        <tr key={c.zone} className="border-b border-gray-700"><td className="px-4 py-2 font-medium">{c.zone}</td><td className="px-4 py-2 font-mono text-right">${c.clearingPrice.toFixed(2)}</td><td className="px-4 py-2 font-mono text-right">{c.availableCapacity.toLocaleString()}</td></tr>
                    ))}
                </tbody>
            </table>
        </Widget>
    );
};

export const AncillaryTable: React.FC<{ ancillaryData: AncillaryData[] }> = ({ ancillaryData }) => {
     return (
        <Widget title="Ancillary Services Market" icon={SlidersHorizontal}>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr><th className="px-4 py-2">Service</th><th className="px-4 py-2 text-right">Price</th><th className="px-4 py-2 text-right">Capacity (MW)</th></tr>
                </thead>
                <tbody>
                    {ancillaryData.map(a => (
                        <tr key={a.service} className="border-b border-gray-700"><td className="px-4 py-2 font-medium">{a.service}</td><td className="px-4 py-2 font-mono text-right">${a.price.toFixed(2)}</td><td className="px-4 py-2 font-mono text-right">{a.capacity.toLocaleString()}</td></tr>
                    ))}
                </tbody>
            </table>
        </Widget>
    );
};

export const CorrelationMatrix: React.FC<{ correlationData: CorrelationData[] }> = ({ correlationData }) => {
    const headers = Object.keys(correlationData[0]).filter(k => k !== 'name');
    return (
        <Widget title="Commodity Correlation Matrix" icon={Shield}>
            <table className="w-full text-sm text-center">
                 <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                        <th className="px-2 py-2 text-left"></th>
                        {headers.map(h => <th key={h} className="px-2 py-2">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {correlationData.map(row => (
                        <tr key={row.name} className="border-b border-gray-700">
                            <td className="px-2 py-2 font-medium text-left">{row.name}</td>
                            {headers.map(h => {
                                const value = (row as any)[h];
                                const colorClass = value >= 0.6 ? 'bg-green-800 bg-opacity-50' : value >= 0.3 ? 'bg-green-900 bg-opacity-50' : value <= -0.3 ? 'bg-red-900 bg-opacity-50' : '';
                                return <td key={h} className={`px-2 py-2 font-mono ${colorClass}`}>{value.toFixed(2)}</td>
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Widget>
    );
};

export const PJMZonalChart: React.FC<{ pjmZoneData: Record<string, PjmZoneDataPoint[]> }> = ({ pjmZoneData }) => {
    const zones = Object.keys(pjmZoneData);
    // Combine data for charting
    const combinedData = pjmZoneData[zones[0]].map((_, index) => {
        const entry: {[key: string]: string | number} = { date: pjmZoneData[zones[0]][index].date };
        zones.forEach(zone => {
            entry[zone] = pjmZoneData[zone][index].price;
        });
        return entry;
    });
    const colors = ['#38BDF8', '#FBBF24', '#F87171'];

    return (
        <Widget title="PJM Zonal Forward Prices" icon={BarChartIcon}>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} reversed={true}/>
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    {zones.map((zone, i) => (
                        <Line key={zone} type="monotone" dataKey={zone} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Widget>
    );
};


export const LongTermForecastWidget: React.FC = () => {
    const [forecast, setForecast] = useState<LongTermForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateForecast = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateLongTermForecast();
            setForecast(result);
        } catch (err) {
            setError('Failed to generate forecast. Please check the API configuration.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Widget title="AI 5-Year Market Outlook" icon={Bot}>
            {!forecast && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="mb-4 text-gray-400">Generate a long-term forecast for electricity and natural gas prices using AI.</p>
                    <button
                        onClick={handleGenerateForecast}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate 5-Year Forecast'}
                    </button>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
            )}
            {forecast && (
                <div className="flex flex-col h-full space-y-4">
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast.forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 12 }}/>
                                <YAxis yAxisId="left" label={{ value: 'Electricity ($/MWh)', angle: -90, position: 'insideLeft', fill: '#818CF8', fontSize: 12 }} stroke="#818CF8" tick={{ fontSize: 12 }}/>
                                <YAxis yAxisId="right" orientation="right" label={{ value: 'Gas ($/MMBtu)', angle: -90, position: 'insideRight', fill: '#FBBF24', fontSize: 12 }} stroke="#FBBF24" tick={{ fontSize: 12 }}/>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Line yAxisId="left" type="monotone" dataKey="electricityPrice" name="Electricity" stroke="#818CF8" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="gasPrice" name="Natural Gas" stroke="#FBBF24" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <h4 className="font-semibold text-md mb-2">AI Analysis</h4>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{forecast.analysis}</p>
                    </div>
                </div>
            )}
        </Widget>
    );
};