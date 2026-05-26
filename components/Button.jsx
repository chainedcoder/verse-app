import React from "react"
import Link from "next/link"

export default function Button({
  children,
  variant = "primary", // primary, ghost, icon
  size = "md", // sm, md, lg
  full = false,
  href,
  className = "",
  type = "button",
  ...props
}) {
  // Construct class list
  const classes = [
    "btn",
    variant ? `btn-${variant}` : "",
    size ? `btn-${size}` : "",
    full ? "btn-full" : "",
    className
  ]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
