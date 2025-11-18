import { createContext, useContext, useMemo, useState } from 'react';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lastVoiceText, setLastVoiceText] = useState('');

  const value = useMemo(
    () => ({
      analysis,
      setAnalysis,
      history,
      setHistory,
      uploading,
      setUploading,
      lastVoiceText,
      setLastVoiceText,
    }),
    [analysis, history, uploading, lastVoiceText],
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

