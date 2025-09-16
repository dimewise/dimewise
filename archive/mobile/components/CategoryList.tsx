import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { CategoryWithSpending } from '../db/repository/types';
import type { Category } from '../db/schema';
import { CategoryListItem } from './CategoryListitem';

interface Props {
  categories: CategoryWithSpending[] | Category[];
}
export const CategoryList = ({ categories }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (categories.length === 0) {
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
          {t('home.noBudgetCategories')}
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            lineHeight: 24,
          }}
        >
          {t('home.setupCategories')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 16 }}>
      {categories.map((category) => (
        <CategoryListItem
          key={category.id}
          category={category}
        />
      ))}
    </View>
  );
};
