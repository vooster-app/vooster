import { SignOut } from "@/components/sign-out";
import { getI18n } from "@/locales/server";
import { getSession, getUser } from "@vooster/supabase/cached-queries";

export const metadata = {
  title: "Home",
};

export default async function Page() {
  const { data } = await getSession();
  const t = await getI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center gap-4">
        <p>{t("welcome", { name: data?.session?.user?.email })}</p>
      </div>
    </div>
  );
}
