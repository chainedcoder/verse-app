import React from "react"
import Button from "./Button"

const meta = {
  title: "UI Primitives/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "ghost", "icon"]
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"]
    },
    full: {
      control: "boolean"
    },
    disabled: {
      control: "boolean"
    }
  }
}

export default meta

const Template = (args) => <Button {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children: "Primary Button",
  variant: "primary",
  size: "md"
}

export const Ghost = Template.bind({})
Ghost.args = {
  children: "Ghost Button",
  variant: "ghost",
  size: "md"
}

export const Icon = Template.bind({})
Icon.args = {
  children: <i className="ti ti-star-filled" />,
  variant: "icon",
  size: "md"
}

export const Small = Template.bind({})
Small.args = {
  children: "Small Button",
  variant: "primary",
  size: "sm"
}

export const Large = Template.bind({})
Large.args = {
  children: "Large Button",
  variant: "primary",
  size: "lg"
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  children: "Full Width Button",
  variant: "primary",
  size: "md",
  full: true
}
