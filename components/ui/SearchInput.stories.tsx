import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Shared/UI/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["commerce", "admin"],
    },
    placeholder: { control: "text" },
    searchLabel: { control: "text" },
    disabled: { control: "boolean" },
    leftIcon: { control: false },
    onSearch: { action: "searched" },
    onChange: { action: "changed" },
  },
  args: {
    variant: "commerce",
    disabled: false,
    searchLabel: "Search",
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Commerce: Story = {
  args: {
    variant: "commerce",
    placeholder: "Search for products...",
  },
};

export const Admin: Story = {
  args: {
    variant: "admin",
    placeholder: "Search by order id",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "cannot search",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "commerce",
    leftIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M20 20L16.5 16.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};
