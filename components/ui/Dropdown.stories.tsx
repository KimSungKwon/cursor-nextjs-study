import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Dropdown, type DropdownProps } from "./Dropdown";

const dateOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
];

const ControlledDropdown = (args: DropdownProps) => {
  const [value, setValue] = useState(args.value);

  return (
    <Dropdown
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta = {
  title: "Shared/UI/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 280, minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    options: { control: "object" },
    value: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    "aria-label": { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    options: dateOptions,
    placeholder: "Filter by date range",
    disabled: false,
    onChange: fn(),
  },
  render: (args) => <ControlledDropdown {...args} />,
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    value: "30d",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "7d",
  },
};
