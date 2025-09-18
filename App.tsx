
import React, { useState } from 'react';
import { View } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Ticker from './components/Ticker';
import Dashboard from './components/Dashboard';
import AlertManager from './components/AlertManager';
import AlertNotifications from './components/AlertNotifications';
import useMarketData from './hooks/useMarketData';
import useAlerts from './hooks/useAlerts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.OVERVIEW);
  const { data: marketData } = useMarketData();
  const { alerts, addAlert, removeAlert } = useAlerts(marketData);

  return (
    <div className="bg-gray-900 text-white flex flex-col h-screen font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Ticker />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* FIX: Pass marketData to Dashboard component */}
            <Dashboard activeView={activeView} marketData={marketData} />
            <AlertManager alerts={alerts} addAlert={addAlert} removeAlert={removeAlert} marketData={marketData} />
          </div>
        </main>
      </div>
      <AlertNotifications alerts={alerts} removeAlert={removeAlert} />
    </div>
  );
};

export default App;
