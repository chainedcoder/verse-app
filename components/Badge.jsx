import React from "react"

export default function Badge({
  children,
  variant = "featured", // featured
  className = "",
  ...props
}) {
  const classes = [
    "badge",
    variant ? `badge-${variant}` : "",
    className
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
