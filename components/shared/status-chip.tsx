"use client";

import { UserStatus, CourseStatus } from "@/lib/api/types";
import { USER_STATUS_COLORS, COURSE_STATUS_COLORS } from "@/lib/utils/constants";

interface StatusChipProps {
  status: UserStatus | CourseStatus;
  type: "user" | "course";
}

export function StatusChip({ status, type }: StatusChipProps) {
  let className = "";
  
  if (type === "user") {
    className = USER_STATUS_COLORS[status as UserStatus] || "bg-gray-100 text-gray-800";
  } else {
    className = COURSE_STATUS_COLORS[status as CourseStatus] || "bg-gray-100 text-gray-800";
  }
  
  const displayText = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {displayText}
    </span>
  );
}
