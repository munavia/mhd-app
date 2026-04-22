import { getTranslations } from "next-intl/server";
import { ChurchLoader } from "@/components/shared/ChurchLoader";

export default async function Loading() {
  const t = await getTranslations("Common");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <ChurchLoader label={t("loading")} />
    </div>
  );
}
