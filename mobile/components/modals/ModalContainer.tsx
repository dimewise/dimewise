import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
};

export const ModalContainer = ({ children }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
};

