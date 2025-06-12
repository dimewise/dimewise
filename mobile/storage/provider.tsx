import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, migrateDbIfNeeded } from './database';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      {children}
    </SQLiteProvider>
  );
}; 