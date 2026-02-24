import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  message?: string;
};

export const LoadingScreen = ({ message }: Props) => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator
        size="large"
        color={colors.primary.DEFAULT}
      />
      {message && <Text className="mt-4 text-base text-neutral-500">{message}</Text>}
    </View>
  );
};
