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
  'Hello, Rahul': 'Hello, Rahul',
  'Loading location...': 'Loading location...',
  'Fetching location...': 'Fetching location...',
  'No location data available': 'No location data available',
  
  // Air Quality parameters
  'PM2.5': 'PM2.5',
  'PM10': 'PM10',
  'O₃': 'O₃',
  'NO₂': 'NO₂',
  
  // Units
  'µg/m³': 'µg/m³',
  'ppb': 'ppb',
  
  // Statuses
  'GOOD': 'GOOD',
  'MODERATE': 'MODERATE',
  'POOR': 'POOR',
  
  // Other UI text
  'Air Quality Index': 'Air Quality Index',
  'Air Quality Map': 'Air Quality Map',
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
  
  // AQI Messages
  'Air quality is excellent. Enjoy your day!': 'Air quality is excellent. Enjoy your day!',
  'Air quality is good. No major concerns.': 'Air quality is good. No major concerns.',
  'Air quality is moderate. Sensitive individuals should be cautious.': 'Air quality is moderate. Sensitive individuals should be cautious.',
  'Air quality is unhealthy. Limit outdoor activities.': 'Air quality is unhealthy. Limit outdoor activities.',
  'Air quality is very unhealthy. Avoid outdoor activities.': 'Air quality is very unhealthy. Avoid outdoor activities.',
  'Air quality data unavailable.': 'Air quality data unavailable.',

  // Additional keys for health advisories and preventive measures from aqiData
  'Safe': 'Safe',
  'Moderate Concern': 'Moderate Concern',
  'Health Alert': 'Health Alert',
  'Emergency Condition': 'Emergency Condition',
  'Enjoy Outdoor Activities': 'Enjoy Outdoor Activities',
  'Monitor Changes': 'Monitor Changes',
  'Regular Ventilation': 'Regular Ventilation',
  'Sensitive Groups Caution': 'Sensitive Groups Caution',
  'Windows Management': 'Windows Management',
  'Air Quality Monitoring': 'Air Quality Monitoring',
  'Limit Outdoor Activities': 'Limit Outdoor Activities',
  'Consider Indoor Air Purifiers': 'Consider Indoor Air Purifiers',
  'Air-Purifying Plants': 'Air-Purifying Plants',
  'Avoid Outdoor Exercise': 'Avoid Outdoor Exercise',
  'Use Air Purifiers': 'Use Air Purifiers',
  'Hydrate Well': 'Hydrate Well',
  'Stay Indoors': 'Stay Indoors',
  'Proper Mask Protection': 'Proper Mask Protection',
  'Multiple Air Purifiers': 'Multiple Air Purifiers',
  'Seal Gaps': 'Seal Gaps',
  'Monitor Health Symptoms': 'Monitor Health Symptoms',
  'Consider Evacuation': 'Consider Evacuation',
  
  // All the advisory messages from aqiData
  'Air quality is considered satisfactory, and air pollution poses little or no risk to public health.': 
    'Air quality is considered satisfactory, and air pollution poses little or no risk to public health.',
  'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.': 
    'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.',
  'Members of sensitive groups may experience health effects. The general public is less likely to be affected. Children, older adults, and people with heart or lung disease should reduce prolonged outdoor exposure.': 
    'Members of sensitive groups may experience health effects. The general public is less likely to be affected. Children, older adults, and people with heart or lung disease should reduce prolonged outdoor exposure.',
  'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects. People with respiratory conditions should avoid outdoor activities, and the general public should limit prolonged exertion.': 
    'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects. People with respiratory conditions should avoid outdoor activities, and the general public should limit prolonged exertion.',
  'Health warnings of emergency conditions. The entire population is more likely to be affected. Everyone should avoid all outdoor exertion. If you must go outdoors, wear appropriate respiratory protection. Consider temporary relocation if possible.': 
    'Health warnings of emergency conditions. The entire population is more likely to be affected. Everyone should avoid all outdoor exertion. If you must go outdoors, wear appropriate respiratory protection. Consider temporary relocation if possible.',
  
  // Descriptions for preventive measures
  'It\'s a great day to be active outside and enjoy the fresh air.': 
    'It\'s a great day to be active outside and enjoy the fresh air.',
  'Keep an eye on air quality updates if you have respiratory sensitivities.': 
    'Keep an eye on air quality updates if you have respiratory sensitivities.',
  'Open windows to let fresh air circulate through your home.': 
    'Open windows to let fresh air circulate through your home.',
  'If you have respiratory issues, consider reducing prolonged outdoor exertion.': 
    'If you have respiratory issues, consider reducing prolonged outdoor exertion.',
  'Consider closing windows during peak traffic hours when pollution may increase.': 
    'Consider closing windows during peak traffic hours when pollution may increase.',
  'Keep track of air quality forecasts, especially if you have respiratory conditions.': 
    'Keep track of air quality forecasts, especially if you have respiratory conditions.',
  'Sensitive individuals should limit strenuous outdoor activities, especially during peak pollution hours.': 
    'Sensitive individuals should limit strenuous outdoor activities, especially during peak pollution hours.',
  'Keep windows closed during the day and use air conditioning if available.': 
    'Keep windows closed during the day and use air conditioning if available.',
  'Use HEPA air purifiers indoors to maintain better air quality at home.': 
    'Use HEPA air purifiers indoors to maintain better air quality at home.',
  'Place air-purifying plants like Snake Plant or Peace Lily in your living spaces.': 
    'Place air-purifying plants like Snake Plant or Peace Lily in your living spaces.',
  'Everyone should avoid strenuous outdoor activities, especially during peak pollution times.': 
    'Everyone should avoid strenuous outdoor activities, especially during peak pollution times.',
  'Keep windows and doors tightly closed at all times.': 
    'Keep windows and doors tightly closed at all times.',
  'Run HEPA air purifiers in main living spaces continuously.': 
    'Run HEPA air purifiers in main living spaces continuously.',
  'Drink plenty of water to help your body clear toxins more efficiently.': 
    'Drink plenty of water to help your body clear toxins more efficiently.',
  'Remain indoors with windows and doors sealed. Create a clean air room if possible.': 
    'Remain indoors with windows and doors sealed. Create a clean air room if possible.',
  'Use N95 or higher-rated masks whenever outdoor exposure is unavoidable.': 
    'Use N95 or higher-rated masks whenever outdoor exposure is unavoidable.',
  'Use multiple air purifiers throughout your home, focusing on bedrooms and main living areas.': 
    'Use multiple air purifiers throughout your home, focusing on bedrooms and main living areas.',
  'Use tape or towels to seal gaps around windows and doors to prevent polluted air from entering.': 
    'Use tape or towels to seal gaps around windows and doors to prevent polluted air from entering.',
  'Watch for symptoms like coughing, shortness of breath, or unusual fatigue and seek medical help immediately if they occur.': 
    'Watch for symptoms like coughing, shortness of breath, or unusual fatigue and seek medical help immediately if they occur.',
  'If possible, consider temporary relocation to an area with better air quality, especially for vulnerable individuals.': 
    'If possible, consider temporary relocation to an area with better air quality, especially for vulnerable individuals.',
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
        
        const response = await fetch('https://6347-2402-3a80-1b3e-e134-9436-40a-2706-2889.ngrok-free.app' + '/translate', {
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
