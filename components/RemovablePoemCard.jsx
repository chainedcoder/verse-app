"use client"

import { useTransition } from "react"
import PoemCard from "./PoemCard"
import { togglePoemInCollection } from "@/app/actions/collections"
import { useToast } from "@/components/ToastProvider"
import styles from "./PoemCard.module.css"

export default function RemovablePoemCard({ poem, collectionId, isMine }) {
  const [isPending, startTransition] = useTransition()
  const { showUndoToast } = useToast()

  const handleRemoveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await togglePoemInCollection(collectionId, poem.id)
      showUndoToast("Poem removed from collection", async () => {
        await togglePoemInCollection(collectionId, poem.id)
      })
    })
  }

  return (
    <div style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <PoemCard
        poem={poem}
        isMine={isMine}
        onRemove={() => {}} // handled below via our own button overlay
        customRemoveButton={
          <div className={styles.removePoemBtn}>
            <button
              className={styles.removePoemIcon}
              onClick={handleRemoveClick}
              aria-label="Remove from collection"
            >
              <i className="ti ti-x"></i>
            </button>
          </div>
        }
      />
    </div>
  )
}
