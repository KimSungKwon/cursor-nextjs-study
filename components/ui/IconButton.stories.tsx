import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M8 13.5S2.5 10.2 2.5 6.5A2.75 2.75 0 0 1 8 5.2 2.75 2.75 0 0 1 13.5 6.5C13.5 10.2 8 13.5 8 13.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: "Shared/UI/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["plain", "circle"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    disabled: { control: "boolean" },
    "aria-label": { control: "text" },
    children: { control: false },
    onClick: { action: "clicked" },
  },
  args: {
    "aria-label": "좋아요",
    variant: "plain",
    size: "md",
    disabled: false,
    children: <HeartIcon />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Plain: Story = {
  args: { variant: "plain" },
};

export const Circle: Story = {
  args: { variant: "circle" },
};

export const SizeSm: Story = {
  args: { size: "sm" },
};

export const SizeMd: Story = {
  args: { size: "md" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcon: Story = {
  args: {
    variant: "circle",
    children: <HeartIcon />,
  },
};
