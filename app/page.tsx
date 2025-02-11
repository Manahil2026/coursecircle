import { redirect } from "next/navigation";
import Landing_page from "./components/landing_page";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as "uni_admin" | "member" | "prof" | undefined;
  
  if (role === "member") {
    return redirect("/pages/student/dashboard");
  } else if (role === "prof") {
    return redirect("/pages/professor/dashboard");
  } else if (role === "uni_admin") {
    return redirect("/pages/admin/dashboard");
  }

  return (
    <div>
      <Landing_page />
    </div>
  );
}
