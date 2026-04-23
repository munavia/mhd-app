import { getTranslations } from "next-intl/server";
import { ChurchLoader } from "@/components/shared/ChurchLoader";

export default async function DashboardLoading() {
  const t = await getTranslations("Common");
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-20">
      <ChurchLoader label={t("loading")} />
    </div>
  );
}
