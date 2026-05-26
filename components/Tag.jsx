import React from "react"

export default function Tag({
  children,
  active = false,
  className = "",
  as: Component = "span",
  ...props
}) {
  const classes = [
    "tag",
    active ? "active" : "",
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
