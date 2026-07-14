import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M13 13L10.5 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta = {
  title: "Shared/UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "withIcon", "search"],
    },
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onChange: { action: "changed" },
  },
  args: {
    label: "Email",
    placeholder: "you@example.com",
    variant: "default",
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIconVariant: Story = {
  args: {
    variant: "withIcon",
    label: "Search",
    placeholder: "Search...",
    leftIcon: <SearchIcon />,
  },
};

export const Search: Story = {
  args: {
    variant: "search",
    label: "Search",
    placeholder: "Search products...",
    leftIcon: <SearchIcon />,
  },
};

export const Error: Story = {
  args: {
    error: "올바른 이메일을 입력해 주세요.",
    defaultValue: "invalid@",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "disabled@example.com",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Username",
    placeholder: "username",
    leftIcon: <SearchIcon />,
    rightIcon: <SearchIcon />,
  },
};
