import Image from "next/image";
import { SignUpAction } from "../signup/signup-buttons";
import { getUserQuery } from "@vooster/supabase/queries";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Vooster",
};

export default async function Page() {
  const { data } = await getUserQuery();

  if (data?.user) {
    return redirect("/");
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col flex-initial items-center justify-center size-96">
        <Image
          src="/icon.png"
          className="mb-8"
          alt="logo"
          width={48}
          height={48}
          quality={50}
        />
        <SignUpAction action="login" />
      </div>
    </div>
  );
}
