"use client";

import { TaskStatus } from "@/types/task";
import { getStatusBadgeColor, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(status)}`}
      data-testid="status-badge"
    >
      {getStatusLabel(status)}
    </span>
  );
}
