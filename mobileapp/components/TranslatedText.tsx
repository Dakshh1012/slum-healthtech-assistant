import React, { useContext } from 'react';
import { Text, TextProps } from 'react-native';
import TranslationContext from '@/contexts/TranslationContext';

interface TranslatedTextProps extends TextProps {
  textKey: string;
  fallback?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ textKey, fallback, style, ...props }) => {
  const { translations } = useContext(TranslationContext);
  
  // console.log(`[TranslatedText] Rendering key: "${textKey}"`);
  // console.log(`[TranslatedText] Available translations:`, translations);
  
  const translatedValue = translations[textKey];
  // console.log(`[TranslatedText] Translation value: "${translatedValue}"`);
  
  // Use the translated value if available, the fallback if provided, or the original key as last resort
  const displayText = translatedValue || fallback || textKey;
  
  return (
    <Text style={style} {...props}>
      {displayText}
    </Text>
  );
};

export default TranslatedText;
