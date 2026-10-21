"use client";

import { NativeSelect } from "@/components/ui/native-select";

import { ROLES } from "../../roles";

interface RoleSelectProps {
  value: number;
  onChange: (roleId: number) => void;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <NativeSelect value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className="h-8">
      {ROLES.map((r) => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </NativeSelect>
  );
}
