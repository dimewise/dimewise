import { useTranslation } from "react-i18next";

export const About = () => {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("nav.private.about")}</h1>
    </>
  );
};
