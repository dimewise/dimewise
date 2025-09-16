import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { usePaymentMethodsBreakdown } from '../../hooks/usePaymentMethodsBreakdown';
import { PaymentMethodList } from '../PaymentMethodList';

interface PaymentMethodsBreakdownProps {
  selectedMonth: number;
  selectedYear: number;
}

export const PaymentMethodsBreakdown = ({
  selectedMonth,
  selectedYear,
}: PaymentMethodsBreakdownProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { paymentMethods, loading, error } = usePaymentMethodsBreakdown(
    selectedMonth,
    selectedYear,
  );

  if (error) {
    return (
      <View>
        <Text
          variant="headlineMedium"
          style={{
            marginBottom: 24,
            fontWeight: '700',
            color: theme.colors.onBackground,
          }}
        >
          {t('paymentMethods.title')}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.error }}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text
        variant="headlineMedium"
        style={{
          marginBottom: 24,
          fontWeight: '700',
          color: theme.colors.onBackground,
        }}
      >
        {t('paymentMethods.title')}
      </Text>
      {loading ? (
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {t('status.loading')}
        </Text>
      ) : (
        <PaymentMethodList paymentMethods={paymentMethods} />
      )}
    </View>
  );
};
