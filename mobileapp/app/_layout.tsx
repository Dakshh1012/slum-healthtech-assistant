import React from 'react';
import { Stack } from 'expo-router';
import { TranslationProvider } from '@/contexts/TranslationContext';
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'white' }
          }}
        />
      </TranslationProvider>
    </AuthProvider>
  );
}
