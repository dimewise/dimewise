import { useTranslation } from "react-i18next";
import { ProfileEditor } from "../components/Settings/ProfileEditor";
import { ThemeSelector } from "../components/Settings/ThemeSelector";
import { PageNavbar } from "../components/layout/PrivateLayout/PageNavbar";

export const Settings = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageNavbar title={t("nav.private.settings")} />
      <ProfileEditor />
      <ThemeSelector />
    </>
  );
};
