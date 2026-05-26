import React from "react"
import Badge from "./Badge"

const meta = {
  title: "UI Primitives/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["featured"]
    }
  }
}

export default meta

const Template = (args) => <Badge {...args} />

export const Featured = Template.bind({})
Featured.args = {
  children: "Featured",
  variant: "featured"
}
