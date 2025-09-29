import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLayout } from '@/components/layouts/AppLayout';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

export default function ExpensesScreen() {
  return (
    <AppLayout>
      <SafeAreaView style={sharedStyles.safeArea}>
        <Text style={{ color: colors.textPrimary }}>Categories there</Text>
      </SafeAreaView>
    </AppLayout>
  );
}
