import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createCollection } from "@/app/actions/collections"

export const metadata = {
  title: "Create Collection | Verse"
}

export default async function CreateCollectionPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container" style={{ padding: "40px 0", maxWidth: "600px", margin: "0 auto" }}>
      <h1 className="serif" style={{ fontSize: "32px", marginBottom: "24px" }}>Create a Collection</h1>
      
      <form action={createCollection} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="input" 
            placeholder="My Favorite Poems"
            required 
            style={{ fontSize: "18px", padding: "10px 14px" }}
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            Description <span style={{ color: "var(--text-tertiary)", fontWeight: "normal" }}>(Optional)</span>
          </label>
          <textarea 
            id="description" 
            name="description" 
            className="input" 
            placeholder="A curation of poems about..."
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "500" }}>
            <input type="checkbox" name="isPublic" value="true" defaultChecked />
            Make this collection public
          </label>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Public collections will be visible to everyone on the collections page.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
  )
}
