import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Pagination, type PaginationProps } from "./Pagination";

const ControlledPagination = (args: PaginationProps) => {
  const [page, setPage] = useState(args.page);

  return (
    <Pagination
      {...args}
      page={page}
      onPageChange={(next) => {
        setPage(next);
        args.onPageChange(next);
      }}
    />
  );
};

const meta = {
  title: "Shared/UI/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 1 } },
    variant: {
      control: "select",
      options: ["full", "compact"],
    },
    "aria-label": { control: "text" },
    onPageChange: { action: "pageChanged" },
  },
  args: {
    page: 3,
    totalPages: 10,
    variant: "full",
    onPageChange: fn(),
  },
  render: (args) => <ControlledPagination {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = {
  args: {
    variant: "full",
    page: 1,
    totalPages: 8,
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    page: 2,
    totalPages: 12,
  },
};

export const FirstPage: Story = {
  args: {
    page: 1,
    totalPages: 5,
  },
};

export const LastPage: Story = {
  args: {
    page: 5,
    totalPages: 5,
  },
};
