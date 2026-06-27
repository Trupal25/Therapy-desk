"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface FilterSelectProps {
  label: string;
  paramName: string;
  options: { value: string; label: string }[];
}

export function FilterSelect({ label, paramName, options }: FilterSelectProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const current = searchParams.get(paramName) ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
          params.set(paramName, value);
        } else {
          params.delete(paramName);
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
