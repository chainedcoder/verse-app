import React from "react"
import Card from "./Card"

const meta = {
  title: "UI Primitives/Card",
  component: Card,
  argTypes: {
    clickable: {
      control: "boolean"
    },
    compact: {
      control: "boolean"
    }
  }
}

export default meta

const Template = (args) => (
  <Card {...args}>
    <h3 className="serif" style={{ marginBottom: "8px" }}>Card Title</h3>
    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
      This is the body content inside a styled, modular card component.
    </p>
  </Card>
)

export const Default = Template.bind({})
Default.args = {
  clickable: false,
  compact: false
}

export const Clickable = Template.bind({})
Clickable.args = {
  clickable: true,
  compact: false
}

export const Compact = Template.bind({})
Compact.args = {
  clickable: false,
  compact: true
}
