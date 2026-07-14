import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M3 8H13M13 8L9 4M13 8L9 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: "Shared/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "pill"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onClick: { action: "clicked" },
  },
  args: {
    children: "Button",
    variant: "solid",
    size: "lg",
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Solid: Story = {
  args: { variant: "solid" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Pill: Story = {
  args: { variant: "pill" },
};

export const SizeXs: Story = {
  args: { size: "xs", children: "Extra Small" },
};

export const SizeSm: Story = {
  args: { size: "sm", children: "Small" },
};

export const SizeMd: Story = {
  args: { size: "md", children: "Medium" },
};

export const SizeLg: Story = {
  args: { size: "lg", children: "Large" },
};

export const SizeXl: Story = {
  args: { size: "xl", children: "Extra Large" },
};

export const Loading: Story = {
  args: { loading: true, children: "Loading" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const WithIcon: Story = {
  args: {
    leftIcon: <ArrowIcon />,
    rightIcon: <ArrowIcon />,
    children: "With Icon",
  },
};
