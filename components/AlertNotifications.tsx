import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface AlertNotificationsProps {
  alerts: Alert[];
  removeAlert: (id: number) => void;
}

const AlertNotifications: React.FC<AlertNotificationsProps> = ({ alerts, removeAlert }) => {
  const triggeredAlerts = alerts.filter(a => a.triggered);

  if (triggeredAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 space-y-2 z-50">
      {triggeredAlerts.map(alert => (
        <div key={alert.id} className="bg-yellow-500 border-l-4 border-yellow-700 text-black p-3 rounded-r-lg shadow-lg flex items-start justify-between animate-fade-in-up">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 mr-3 text-yellow-800" />
            <div>
              <p className="font-bold">Market Alert!</p>
              <p className="text-sm">
                {alert.market} price has gone {alert.condition} ${alert.value.toFixed(2)}.
              </p>
            </div>
          </div>
          <button onClick={() => removeAlert(alert.id)} className="text-yellow-800 hover:text-black transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AlertNotifications;
