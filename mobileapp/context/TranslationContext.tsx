import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define interfaces for our context
interface TextKeysType {
  [key: string]: string;
}

interface TranslationsType {
  [key: string]: string;
}

interface TranslationContextType {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  translations: TranslationsType;
  isLoading: boolean;
}

interface TranslationProviderProps {
  children: ReactNode;
}

// Define text keys outside of component to prevent recreation on each render
const textKeys: TextKeysType = {
  // Basic app text
  welcome: 'Welcome',
  description: 'This is a multi-language app',
  
  // Air Quality parameters
  'PM2.5': 'PM2.5',
  'PM10': 'PM10',
  'O₃': 'O₃',
  'NO₂': 'NO₂',
  
  // Parameter values (numbers can also be translated differently in some languages)
  '45': '45',
  '80': '80',
  '85': '85',
  '120': '120',
  
  // Units
  'µg/m³': 'µg/m³',
  'ppb': 'ppb',
  
  // Statuses
  'GOOD': 'GOOD',
  'MODERATE': 'MODERATE',
  'POOR': 'POOR',
  
  // Other UI text
  'Air Quality Index': 'Air Quality Index',
  'Unhealthy': 'Unhealthy',
  'Health Advisory': 'Health Advisory',
  'High Risk Alert': 'High Risk Alert',
  'Current air quality is unhealthy. People with respiratory conditions should avoid outdoor activities.': 
    'Current air quality is unhealthy. People with respiratory conditions should avoid outdoor activities.',
  'Preventive Measures': 'Preventive Measures',
  'Wear Masks Outdoors': 'Wear Masks Outdoors',
  'Use N95 masks when going outside to protect from harmful particles.': 
    'Use N95 masks when going outside to protect from harmful particles.',
  'Keep Windows Closed': 'Keep Windows Closed',
  'During peak pollution hours (morning and evening), keep windows closed.': 
    'During peak pollution hours (morning and evening), keep windows closed.',
  'Use Air Purifying Plants': 'Use Air Purifying Plants',
  'Place air-purifying plants like Snake Plant or Peace Lily in your home.': 
    'Place air-purifying plants like Snake Plant or Peace Lily in your home.',
  'Get Medical Help': 'Get Medical Help',
};

// Create context with default values
const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: {},
  isLoading: false,
});

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<TranslationsType>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const translateTexts = async (lang: string): Promise<void> => {
    // If language is English, no need to translate
    if (lang === 'en') {
      // Create identity mapping for English
      const englishTranslations: TranslationsType = {};
      for (const key in textKeys) {
        englishTranslations[key] = textKeys[key];
      }
      setTranslations(englishTranslations);
      return;
    }
    
    setIsLoading(true);
    // console.log(`[Translation] Starting translation to ${lang}`);
    // console.log(`[Translation] Text keys to translate:`, textKeys);
    
    try {
      // Create a new object to store all translated texts
      const translatedTexts: TranslationsType = {};
      
      // Process each text item one by one, using for...in to avoid array usage
      for (const key in textKeys) {
        const value = textKeys[key];
        
        const response = await fetch('https://a00d-49-248-175-242.ngrok-free.app' + '/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: value, // Send each individual string
            targetLang: lang,
          }),
        });
        
        const data = await response.json();
        console.log(`[Translation] Response for "${key}":`, data);
        
        // Store the translated text in our results object
        translatedTexts[key] = data[value];
        // console.log(`[Translation] Stored translation for "${key}": "${translatedTexts[key]}"`);
      }
      
      // console.log(`[Translation] All translations complete:`, translatedTexts);
      setTranslations(translatedTexts);
    } catch (error) {
      console.error('[Translation] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(`[Translation] Language changed to: ${language}`);
    translateTexts(language);
  }, [language]); // No need to include textKeys as dependency since it's now outside the component

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translations, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
