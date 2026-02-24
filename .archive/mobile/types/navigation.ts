export type RootStackParamList = {
  '(auth)/welcome': undefined;
  '(auth)/sign-in': undefined;
  '(auth)/sign-up': undefined;
  '(app)/(tabs)/index': undefined;
  '(app)/(tabs)/transactions': undefined;
  '(app)/(tabs)/settings': undefined;
  '(onboarding)/finish': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
