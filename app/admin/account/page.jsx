import { redirect } from "next/navigation"

export default function AccountIndex() {
  redirect("/admin/account/basic-info")
}
