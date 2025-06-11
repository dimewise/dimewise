import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency, getSettings, saveSettings } from './storage';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  refreshKey: number; // Used to force re-renders when currency changes
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('JPY');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load initial currency setting
    const loadCurrency = async () => {
      try {
        const settings = await getSettings();
        setCurrencyState(settings.currency);
      } catch (error) {
        console.error('Error loading currency setting:', error);
      }
    };

    loadCurrency();
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    try {
      // Save the new currency setting
      await saveSettings({ currency: newCurrency });

      // Update local state
      setCurrencyState(newCurrency);

      // Increment refresh key to force all consuming components to re-render
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving currency setting:', error);
      throw error;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, refreshKey }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Custom hook to trigger re-renders when currency changes
export const useCurrencyRefresh = () => {
  const { refreshKey } = useCurrency();
  return refreshKey;
}; 