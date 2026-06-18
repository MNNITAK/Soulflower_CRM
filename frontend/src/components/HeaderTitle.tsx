"use client";

import { useSearchParams } from "next/navigation";
import { DEFAULT_PLATFORM } from "./PlatformSelector";

export default function HeaderTitle() {
  const sp = useSearchParams();
  const platform = sp.get("platform") ?? DEFAULT_PLATFORM;
  return (
    <span className="text-sm font-medium capitalize text-gray-400">
      {platform} Sales
    </span>
  );
}
