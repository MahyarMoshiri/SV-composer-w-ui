import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiEndpoints } from '@/lib/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [bankset, setBankset] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [harness, setHarness] = useState('echo');
  const [health, setHealth] = useState({ status: 'unknown' });
  const [activeSelections, setActiveSelections] = useState({
    schemas: [],
    metaphors: [],
    frames: [],
    gates: [],
  });

  // Load bankset from localStorage on mount
  const harnessPersisted = useRef(false);

  useEffect(() => {
    const savedBankset = localStorage.getItem('sv-bankset');
    if (savedBankset) {
      try {
        const parsed = JSON.parse(savedBankset);
        setBankset(Array.isArray(parsed) ? parsed : [savedBankset]);
      } catch {
        setBankset([savedBankset]);
      }
    } else {
      setBankset(['default']);
    }

    const savedHarness = localStorage.getItem('sv-harness');
    if (savedHarness) {
      setHarness(savedHarness);
      harnessPersisted.current = true;
    }
  }, []);

  // Fetch available banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await apiEndpoints.getBanks();
        if (response.data && response.data.banks) {
          setAvailableBanks(response.data.banks);
        }
      } catch (err) {
        console.error('Failed to fetch banks:', err);
      }
    };
    fetchBanks();
  }, []);

  // Check health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiEndpoints.health();
        setHealth({ status: 'ok', ...response.data });
      } catch {
        setHealth({ status: 'error' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHarness = useCallback(async () => {
    try {
      const response = await apiEndpoints.status();
      const payload = response.data?.data;
      if (payload?.llm_default && !harnessPersisted.current) {
        setHarness(payload.llm_default);
      }
    } catch (err) {
      console.error('Failed to fetch harness status:', err);
    }
  }, []);

  useEffect(() => {
    fetchHarness();
  }, [fetchHarness]);

  // Update bankset
  const updateBankset = (newBankset) => {
    const banksetArray = Array.isArray(newBankset) ? newBankset : [newBankset];
    setBankset(banksetArray);
    localStorage.setItem('sv-bankset', JSON.stringify(banksetArray));
  };

  const updateHarness = (value) => {
    const finalValue = value?.trim() || 'echo';
    setHarness(finalValue);
    localStorage.setItem('sv-harness', finalValue);
    harnessPersisted.current = true;
  };

  // Add to active selections
  const addToActive = (type, item) => {
    setActiveSelections((prev) => ({
      ...prev,
      [type]: [...prev[type], item],
    }));
  };

  // Remove from active selections
  const removeFromActive = (type, itemId) => {
    setActiveSelections((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.doc_id !== itemId),
    }));
  };

  // Clear active selections
  const clearActive = (type = null) => {
    if (type) {
      setActiveSelections((prev) => ({
        ...prev,
        [type]: [],
      }));
    } else {
      setActiveSelections({
        schemas: [],
        metaphors: [],
        frames: [],
        gates: [],
      });
    }
  };

  const value = {
    bankset,
    updateBankset,
    availableBanks,
    harness,
    updateHarness,
    health,
    activeSelections,
    addToActive,
    removeFromActive,
    clearActive,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
