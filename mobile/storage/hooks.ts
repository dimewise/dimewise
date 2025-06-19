import { useSQLiteContext } from 'expo-sqlite';
import * as categories from './categories';
import * as paymentMethods from './paymentMethods';
import * as expenses from './expenses';
import * as exchangeRates from './exchangeRates';
import * as settings from './settings';
import { generateId, resetDatabase, resetDatabaseVersion } from './database';

// Categories hooks
export const useCategories = () => {
  const db = useSQLiteContext();

  return {
    getCategories: () => categories.getCategories(db),
    getUserCategories: () => categories.getUserCategories(db),
    getCategoryById: (id: string) => categories.getCategoryById(db, id),
    createCategory: (name: string, budget: number, currency: any) =>
      categories.createCategory(db, name, budget, currency),
    updateCategory: (category: any) => categories.updateCategory(db, category),
    updateCategoryBudget: (id: string, budget: number, currency: any) =>
      categories.updateCategoryBudget(db, id, budget, currency),
    deleteCategory: (id: string) => categories.deleteCategory(db, id),
    getCategorySpending: (id: string) => categories.getCategorySpending(db, id),
    getCategoriesWithSpending: () => categories.getCategoriesWithSpending(db),
    getTotalBudget: () => categories.getTotalBudget(db),
    categoryExists: (id: string) => categories.categoryExists(db, id),
    ensureUncategorizedCategory: () => categories.ensureUncategorizedCategory(db)
  };
};

// Payment methods hooks
export const usePaymentMethods = () => {
  const db = useSQLiteContext();

  return {
    getPaymentMethods: () => paymentMethods.getPaymentMethods(db),
    getPaymentMethodById: (id: string) => paymentMethods.getPaymentMethodById(db, id),
    createPaymentMethod: (name: string, type: any) =>
      paymentMethods.createPaymentMethod(db, name, type),
    updatePaymentMethod: (paymentMethod: any) =>
      paymentMethods.updatePaymentMethod(db, paymentMethod),
    deletePaymentMethod: (id: string) => paymentMethods.deletePaymentMethod(db, id),
    paymentMethodExists: (id: string) => paymentMethods.paymentMethodExists(db, id),
    getPaymentMethodUsage: (id: string) => paymentMethods.getPaymentMethodUsage(db, id),
    getPaymentMethodsWithUsage: () => paymentMethods.getPaymentMethodsWithUsage(db),
    ensureDefaultPaymentMethod: () => paymentMethods.ensureDefaultPaymentMethod(db)
  };
};

// Expenses hooks
export const useExpenses = () => {
  const db = useSQLiteContext();

  return {
    getExpenses: () => expenses.getExpenses(db),
    getExpenseById: (id: string) => expenses.getExpenseById(db, id),
    createExpense: (title: string, description: string, amount: number, currency: any,
      categoryId: string, paymentMethodId: string, date: string) =>
      expenses.createExpense(db, title, description, amount, currency, categoryId, paymentMethodId, date),
    updateExpense: (expense: any) => expenses.updateExpense(db, expense),
    deleteExpense: (id: string) => expenses.deleteExpense(db, id),
    getExpensesByCategory: (categoryId: string) => expenses.getExpensesByCategory(db, categoryId),
    getExpensesByPaymentMethod: (paymentMethodId: string) =>
      expenses.getExpensesByPaymentMethod(db, paymentMethodId),
    getCurrentMonthExpenses: () => expenses.getCurrentMonthExpenses(db),
    getExpensesByDateRange: (startDate: string, endDate: string) =>
      expenses.getExpensesByDateRange(db, startDate, endDate),
    getTotalSpent: () => expenses.getTotalSpent(db),
    searchExpenses: (query: string) => expenses.searchExpenses(db, query),
    expenseExists: (id: string) => expenses.expenseExists(db, id),
    saveExpense: (expense: any) => expenses.saveExpense(db, expense),
    verifyExpense: (id: string) => expenses.verifyExpense(db, id),
    unverifyExpense: (id: string) => expenses.unverifyExpense(db, id)
  };
};

// Exchange rates hooks
export const useExchangeRates = () => {
  const db = useSQLiteContext();

  return {
    getExchangeRates: () => exchangeRates.getExchangeRates(db),
    getExchangeRate: (baseCurrency: any, targetCurrency: any) =>
      exchangeRates.getExchangeRate(db, baseCurrency, targetCurrency),
    getExchangeRateForCurrency: (targetCurrency: any) =>
      exchangeRates.getExchangeRateForCurrency(db, targetCurrency),
    updateExchangeRate: (baseCurrency: any, targetCurrency: any, buyRate: number, sellRate: number) =>
      exchangeRates.updateExchangeRate(db, baseCurrency, targetCurrency, buyRate, sellRate),
    updateExchangeRates: (rates: any[]) => exchangeRates.updateExchangeRates(db, rates),
    getExchangeRatesLastUpdate: () => exchangeRates.getExchangeRatesLastUpdate(db),
    convertCurrency: (amount: number, fromCurrency: any, toCurrency: any, useBuyRate?: boolean) =>
      exchangeRates.convertCurrency(db, amount, fromCurrency, toCurrency, useBuyRate),
    getConversionRate: (fromCurrency: any, toCurrency: any, useBuyRate?: boolean) =>
      exchangeRates.getConversionRate(db, fromCurrency, toCurrency, useBuyRate),
    shouldUpdateExchangeRates: () => exchangeRates.shouldUpdateExchangeRates(db),
    resetExchangeRates: () => exchangeRates.resetExchangeRates(db)
  };
};

// Settings hooks
export const useSettings = () => {
  const db = useSQLiteContext();

  return {
    getSettings: () => settings.getSettings(db),
    updateSettings: (newSettings: any) => settings.updateSettings(db, newSettings),
    updateCurrency: (currency: any) => settings.updateCurrency(db, currency),
    updateLanguage: (language: any) => settings.updateLanguage(db, language),
    getCurrentCurrency: () => settings.getCurrentCurrency(db),
    getCurrentLanguage: () => settings.getCurrentLanguage(db),
    resetSettings: () => settings.resetSettings(db),
    settingsExist: () => settings.settingsExist(db),
    ensureSettingsExist: () => settings.ensureSettingsExist(db)
  };
};

// Utility hooks
export const useUtilities = () => {
  const db = useSQLiteContext();

  return {
    generateId,
    resetDatabase: () => resetDatabase(db),
    resetDatabaseVersion: () => resetDatabaseVersion(db)
  };
}; 