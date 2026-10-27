import React from 'react';
import { AuthProvider } from '../../modules/auth/context/AuthContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default AppProviders;
