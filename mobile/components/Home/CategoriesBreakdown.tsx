import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useCategoriesBreakdown } from '../../hooks/useCategoriesBreakdown';
import { CategoryList } from '../CategoryList';

interface CategoriesBreakdownProps {
  selectedMonth: number;
  selectedYear: number;
}

export const CategoriesBreakdown = ({ selectedMonth, selectedYear }: CategoriesBreakdownProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { categories, loading, error } = useCategoriesBreakdown(selectedMonth, selectedYear);

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
          {t('categories.title')}
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
        {t('categories.title')}
      </Text>
      {loading ? (
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {t('status.loading')}
        </Text>
      ) : (
        <CategoryList categories={categories} />
      )}
    </View>
  );
};
