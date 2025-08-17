import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { PaymentMethod } from '../db/schema';
import type { PaymentMethodWithSpending } from '../db/types';
import { PaymentMethodListItem } from './PaymentMethodListItem';

interface Props {
  paymentMethods: PaymentMethodWithSpending[] | PaymentMethod[];
}

export const PaymentMethodList = ({ paymentMethods }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (paymentMethods.length === 0) {
    return (
      <View
        style={{
          padding: 48,
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <Text
          variant="titleLarge"
          style={{
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}
        >
          {t('paymentMethods.noPaymentMethods')}
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            lineHeight: 24,
          }}
        >
          {t('paymentMethods.setupPaymentMethods')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 16 }}>
      {paymentMethods.map((paymentMethod) => (
        <PaymentMethodListItem
          key={paymentMethod.id}
          paymentMethod={paymentMethod}
        />
      ))}
    </View>
  );
};
