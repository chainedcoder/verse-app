import React from "react"

export default function Card({
  children,
  clickable = false,
  compact = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  const classes = [
    "card",
    clickable ? "card-clickable" : "",
    compact ? "card-compact" : "",
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
