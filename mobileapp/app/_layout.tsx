import React from 'react';
import { Stack } from 'expo-router';
import { TranslationProvider } from '@/context/TranslationContext';
import './globals.css'

export default function RootLayout() {
  return (
    <TranslationProvider>
      <Stack 
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'white' }
        }}
      />
    </TranslationProvider>
  );
}
