import { useAppSelector } from "@/store/store";
import { Redirect } from "expo-router";

export default function Index() {
  const session = useAppSelector((s) => s.session);
  const targetHref = !session ? "/login" : "/(app)/(tabs)/home";

  return <Redirect href={targetHref} />;
}
