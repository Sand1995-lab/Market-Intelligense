import { useState, useEffect, useCallback } from 'react';
import { Alert, MarketData } from '../types';

const useAlerts = (marketData: MarketData | null) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [nextId, setNextId] = useState(1);

    const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'triggered'>) => {
        setAlerts(prev => [...prev, { ...newAlert, id: nextId, triggered: false }]);
        setNextId(prev => prev + 1);
    }, [nextId]);

    const removeAlert = useCallback((id: number) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    useEffect(() => {
        if (!marketData || !marketData.ticker) return;

        setAlerts(currentAlerts => {
            return currentAlerts.map(alert => {
                // If an alert is already triggered, we don't need to re-check it.
                // It will be visible in notifications until the user dismisses it.
                if (alert.triggered) {
                    return alert;
                }

                const market = marketData.ticker.find(t => t.name === alert.market);
                if (!market) {
                    return alert;
                }

                const currentPrice = market.price;
                let isTriggered = false;

                if (alert.condition === 'above' && currentPrice > alert.value) {
                    isTriggered = true;
                } else if (alert.condition === 'below' && currentPrice < alert.value) {
                    isTriggered = true;
                }

                if (isTriggered) {
                    return { ...alert, triggered: true };
                }

                return alert;
            });
        });
    // We only want to run this when marketData changes.
    // Adding `alerts` to dependency array would cause an infinite loop if not handled carefully.
    }, [marketData]);

    return { alerts, addAlert, removeAlert };
};

export default useAlerts;
