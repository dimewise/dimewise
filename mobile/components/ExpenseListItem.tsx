import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Expense, Category, PaymentMethod } from '../storage';
import { formatAmount } from '../storage';
import { useCurrency } from '../utils/UserSettingsContext';

interface ExpenseListItemProps {
  expense: Expense;
  category?: Category;
  paymentMethod?: PaymentMethod;
  hideDescription?: boolean;
  onPress: (expense: Expense) => void;
}

export default function ExpenseListItem({
  expense,
  category,
  paymentMethod,
  hideDescription,
  onPress
}: ExpenseListItemProps) {
  const theme = useTheme();
  const { currency } = useCurrency();

  const formatAmountLocal = (amount: number) => {
    return formatAmount(amount, currency);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(expense)}
      style={{
        marginVertical: 4,
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <View style={{ flex: 1, marginRight: 20 }}>
          <Text variant="titleMedium" numberOfLines={1} ellipsizeMode="tail" style={{
            fontWeight: '600',
            marginBottom: 8,
            color: theme.colors.onSurface
          }}>
            {expense.title}
          </Text>
          <Text variant="bodySmall" style={{
            color: theme.colors.onSurfaceVariant,
            fontWeight: '500',
            marginBottom: 16
          }}>
            {new Date(expense.date).toLocaleDateString()}
          </Text>
          {expense.description && !hideDescription && (
            <Text
              variant="bodySmall"
              numberOfLines={3}
              ellipsizeMode="tail"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: expense.description ? 16 : 8,
                lineHeight: 20
              }}
            >
              {expense.description}
            </Text>
          )}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'nowrap'
          }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colors.primaryContainer,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}>
              <Text variant="bodySmall" style={{
                color: theme.colors.onPrimaryContainer,
                fontWeight: '500',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {category?.name || 'Unknown'}
              </Text>
            </View>
            {paymentMethod && (
              <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}>
                <Text variant="bodySmall" style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '500',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  {paymentMethod.name}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text variant="titleMedium" style={{
            fontWeight: '700',
            color: theme.colors.onSurface
          }}>
            {formatAmountLocal(expense.amount)}
          </Text>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: expense.isVerified ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}>
            <Text variant="bodySmall" style={{
              color: expense.isVerified ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              fontWeight: '600',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {expense.isVerified ? '✓ Verified' : 'Unverified'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity >
  );
} 