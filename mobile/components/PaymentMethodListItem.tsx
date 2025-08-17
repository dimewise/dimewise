import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { PaymentMethod } from '../db/schema';
import type { PaymentMethodWithSpending } from '../db/types';
import { formatAmount } from '../db/utils';
import { useUser } from './contexts/UserContext';

interface Props {
  paymentMethod: PaymentMethodWithSpending | PaymentMethod;
}

function isPaymentMethodWithSpending(
  pm: PaymentMethodWithSpending | PaymentMethod,
): pm is PaymentMethodWithSpending {
  return typeof (pm as PaymentMethodWithSpending).spent === 'number';
}

export const PaymentMethodListItem = ({ paymentMethod }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userSetting } = useUser();
  const currency = userSetting?.currency ?? 'USD';

  // Type guard for PaymentMethodWithSpending
  const spent = isPaymentMethodWithSpending(paymentMethod) ? paymentMethod.spent : undefined;
  const transactionCount = isPaymentMethodWithSpending(paymentMethod)
    ? paymentMethod.transactionCount
    : undefined;

  // Derived values
  const spentFormatted = spent !== undefined ? formatAmount(spent, currency) : null;
  const transactionCountText =
    transactionCount !== undefined
      ? transactionCount === 1
        ? t('paymentMethods.countTransaction', { count: transactionCount })
        : t('paymentMethods.countTransactions', { count: transactionCount })
      : null;

  return (
    <View
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
      <View style={{ gap: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            variant="titleMedium"
            style={{ fontWeight: '600', color: theme.colors.onSurface }}
          >
            {paymentMethod.name}
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              fontWeight: '600',
              color: theme.colors.onSurface,
            }}
          >
            {spentFormatted || t('paymentMethods.noExpenses')}
            {spent !== undefined && transactionCount !== undefined && spent > 0 && (
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '500',
                }}
              >
                {` (${transactionCountText})`}
              </Text>
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};
