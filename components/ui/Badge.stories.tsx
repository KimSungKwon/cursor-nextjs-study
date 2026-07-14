import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Shared/UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "success", "sale", "new"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    children: { control: "text" },
  },
  args: {
    children: "Badge",
    variant: "neutral",
    size: "md",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Neutral: Story = {
  args: { variant: "neutral", children: "Neutral" },
};

export const Success: Story = {
  args: { variant: "success", children: "Success" },
};

export const Sale: Story = {
  args: { variant: "sale", children: "Sale" },
};

export const New: Story = {
  args: { variant: "new", children: "New" },
};

export const SizeSm: Story = {
  args: { size: "sm", children: "Small" },
};

export const SizeMd: Story = {
  args: { size: "md", children: "Medium" },
};
