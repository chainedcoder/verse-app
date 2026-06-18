import { redirect } from "next/navigation";

export default function SupportIndex() {
  redirect("/admin/support/tickets");
}
