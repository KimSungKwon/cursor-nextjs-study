import type { Meta, StoryObj } from "@storybook/react";
import { StatusText } from "./StatusText";

const meta = {
  title: "Shared/UI/StatusText",
  component: StatusText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["active", "inactive", "pending"],
    },
    children: { control: "text" },
  },
  args: {
    children: "Active",
    variant: "active",
  },
} satisfies Meta<typeof StatusText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: { variant: "active", children: "Active" },
};

export const Inactive: Story = {
  args: { variant: "inactive", children: "Inactive" },
};

export const Pending: Story = {
  args: { variant: "pending", children: "Pending" },
};
