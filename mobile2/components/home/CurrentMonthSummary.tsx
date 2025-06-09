import { useAppTheme } from "@/hooks/useAppTheme";
import {
  useApiV1CategoriesOverviewYearGetCategoriesPerMonthQuery,
  useApiV1UsersMeDetailGetMeDetailQuery,
} from "@/store/api/rtk/server/v1";
import { useLocales } from "expo-localization";
import { DateTime } from "luxon";
import { View } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

export const CurrentMonthSummary = () => {
  const theme = useAppTheme();
  const locale = useLocales();
  const langCode = locale[0].languageCode ?? ""; // [0] is definite

  // api call
  const {
    data: meData,
    isLoading: meIsLoading,
    error: meError,
  } = useApiV1UsersMeDetailGetMeDetailQuery();
  const start = DateTime.now().startOf("month");
  const end = DateTime.now().endOf("month");
  const {
    data: overviewData,
    isLoading: overviewIsLoading,
    error: overviewError,
  } = useApiV1CategoriesOverviewYearGetCategoriesPerMonthQuery({
    fromDate: start.toISO(),
    toDate: end.toISO(),
  });

  // data for display
  // me
  const currencyUsed = meData?.default_currency;
  // overview
  const currentMonth = DateTime.now().setLocale(langCode).toFormat("LLLL yyyy");
  const totalBudget = overviewData?.budget ?? 0;
  const totalSpent = Object.values(overviewData?.months ?? {})
    .flat()
    .reduce((sum, val) => sum + val, 0);
  const percentageSpent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;
  const spentSeverity =
    percentageSpent > 75
      ? theme.colors.error
      : percentageSpent > 50
        ? theme.colors.warning
        : theme.colors.success;

  // state handling
  if (overviewIsLoading || overviewError || meIsLoading || meError) {
    return <></>;
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        paddingBottom: 0,
        gap: 24,
      }}
    >
      <Text
        variant="headlineMedium"
        style={{ fontWeight: "bold" }}
      >
        {currentMonth}
      </Text>
      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text
            variant="headlineLarge"
            style={{ fontWeight: "bold" }}
          >
            {`${currencyUsed} ${totalSpent}`}
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>/&nbsp;</Text>
            <Text
              style={{ fontWeight: "bold" }}
            >{`${currencyUsed} ${totalBudget}`}</Text>
          </View>
        </View>
        <ProgressBar
          animatedValue={percentageSpent / 100}
          style={{ height: 12, borderRadius: 24 }}
          color={spentSeverity}
        />
        <Text style={{ color: spentSeverity }}>
          {`You have spent ${percentageSpent}% of your monthly budget`}
        </Text>
      </View>
    </View>
  );
};
