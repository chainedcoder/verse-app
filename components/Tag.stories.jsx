import React from "react"
import Tag from "./Tag"

const meta = {
  title: "UI Primitives/Tag",
  component: Tag,
  argTypes: {
    active: {
      control: "boolean"
    }
  }
}

export default meta

const Template = (args) => <Tag {...args} />

export const Default = Template.bind({})
Default.args = {
  children: "#poetry",
  active: false
}

export const Active = Template.bind({})
Active.args = {
  children: "#classic",
  active: true
}
