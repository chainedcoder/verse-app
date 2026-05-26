import React from "react"
import Avatar from "./Avatar"

const meta = {
  title: "UI Components/Avatar",
  component: Avatar,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"]
    },
    image: {
      control: "text"
    },
    name: {
      control: "text"
    }
  }
}

export default meta

const Template = (args) => <Avatar {...args} />

export const StandardInitials = Template.bind({})
StandardInitials.args = {
  name: "Emily Dickinson",
  size: "md"
}

export const WarmTheme = Template.bind({})
WarmTheme.args = {
  name: "Robert Frost",
  image: "avatar-warm",
  size: "md"
}

export const GreenTheme = Template.bind({})
GreenTheme.args = {
  name: "Walt Whitman",
  image: "avatar-green",
  size: "md"
}

export const ImageURL = Template.bind({})
ImageURL.args = {
  name: "Jane Doe",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  size: "lg"
}
