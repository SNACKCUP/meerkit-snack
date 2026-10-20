"use client";

import type { Role } from "../../types";

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as Role)}
      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
    >
      <option value="user">user</option>
      <option value="admin">admin</option>
    </select>
  );
}
