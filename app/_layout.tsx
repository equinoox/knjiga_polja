import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { addFarmingFieldCategory, createTables, rollbackTables } from '../db/dbController';

import "../global.css";


export default function RootLayout() {
  const createDbIfNeeded = async (db: SQLiteDatabase) => {
    try {
      await createTables(db);
      console.log("Database loaded successfully!");
      await addFarmingFieldCategory(db);

    } catch (error) {
      console.log(error);
    }
  }

  const rollback = async (db: SQLiteDatabase) => {
    try {
      await rollbackTables(db);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SQLiteProvider databaseName="finagro.db" onInit={createDbIfNeeded}>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="field/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar backgroundColor="#ffffff" />
    </SQLiteProvider>
  );
}
