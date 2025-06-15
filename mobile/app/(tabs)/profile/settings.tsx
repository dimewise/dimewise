import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Menu,
  Appbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SUPPORTED_CURRENCIES } from '../../../storage';
import { Currency } from '../../../storage';
import { useCurrency } from '../../../utils/CurrencyContext';

export default function SettingsScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('JPY');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const theme = useTheme();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  const handleSaveSettings = async () => {
    if (!selectedCurrency) {
      return;
    }

    try {
      await setCurrency(selectedCurrency);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const renderCurrencyMenu = () => (
    <Menu
      visible={showCurrencyMenu}
      onDismiss={() => setShowCurrencyMenu(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setShowCurrencyMenu(true)}
          contentStyle={{ justifyContent: 'flex-start' }}
        >
          {selectedCurrency || "Select currency"}
        </Button>
      }
    >
      {SUPPORTED_CURRENCIES.map((curr) => (
        <Menu.Item
          key={curr}
          onPress={() => {
            setSelectedCurrency(curr);
            setShowCurrencyMenu(false);
          }}
          title={curr}
        />
      ))}
    </Menu>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Settings" titleStyle={{ fontWeight: '700' }} />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 24 }}>
        <View style={{
          padding: 24,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          marginBottom: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 16, color: theme.colors.onSurface }}>
            Default Currency
          </Text>
          <View style={{ gap: 16 }}>
            {renderCurrencyMenu()}
            <Button
              mode="contained"
              onPress={handleSaveSettings}
              disabled={selectedCurrency === currency}
              contentStyle={{
                paddingVertical: 6,
              }}
              labelStyle={{
                fontSize: 14,
                fontWeight: '600',
                letterSpacing: 0.25
              }}
              style={{
                borderRadius: 6,
                opacity: selectedCurrency === currency ? 0.6 : 1,
              }}
            >
              {selectedCurrency === currency ? 'Currency Updated' : 'Save Currency'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 