import AccountSidebar from "./AccountSidebar"
import "./account.css"

export const metadata = {
  title: "Account Settings",
}

export default function AccountLayout({ children }) {
  return (
    <div className="account-settings-page">
      <div className="account-settings-header">
        <h1>Account Settings</h1>
      </div>
      <div className="account-settings-card">
        <AccountSidebar />
        <main className="account-main-content">
          <div className="account-max-width space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
