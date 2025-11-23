import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { verifySession } from "@/lib/Security/SessionVerify";
import { LoginPage } from "../components/pages/LoginPage";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fk_session")?.value;

  if (!token) {
    return (<LoginPage />)
  }

  try {
    await verifySession(token);
  } catch (err) {
    console.error("SESSION INVALID IN PAGE", err);
    return <LoginPage />;
  }

    redirect("/home")


}
