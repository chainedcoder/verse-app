import React from "react"
import styles from "./Card.module.css"

export default function Card({
  children,
  clickable = false,
  compact = false,
  isMine = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  const classes = [
    styles['card'],
    "card",
    clickable ? styles['card-clickable'] : "",
    compact ? styles['card-compact'] : "",
    isMine ? styles['poem-card--mine'] : "",
    className
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
