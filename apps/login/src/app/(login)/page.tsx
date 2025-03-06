import { redirect } from "next/navigation";

export default function Page() {

  redirect("/dashboard");

  // automatically redirect to loginname
  if (process.env.DEBUG !== "true") {
    redirect("/loginname");
  }
}
