import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "fa" ? "en" : "fa";
    i18n.changeLanguage(newLang);
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = newLang === "fa" ? "rtl" : "ltr";
  };

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-md"
    >
      {i18n.language === "fa" ? "English" : "فارسی"}
    </Button>
  );
};

export default LanguageSwitcher;
