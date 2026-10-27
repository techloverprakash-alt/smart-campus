import React from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { AppNavigator } from './app/navigation/AppNavigator';
import { AlertHost } from '@/ui';

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
      <AlertHost />
    </AppProviders>
  );
}
