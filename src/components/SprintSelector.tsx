"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Dropdown from "./Dropdown";

type Sprint = {
  id: string;
  name: string;
  state: string;
  self: string;
};

type SprintSelectorProps = {
  sprints: Sprint[];
};

const ALL_SPRINTS = {
  key: 'ALL_SPRINTS', 
  name: 'All Sprints'
};

export default function SprintSelector({
  sprints,
}: SprintSelectorProps) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedUserKey = searchParams.get("sprint");

  const usersList = [...sprints.map(s => ({ key: s.name, name: s.name })), ALL_SPRINTS]

  const handleSelect = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (key === ALL_SPRINTS.key) {
      current.delete("sprint")
    } else {
      current.set("sprint", key);
    }

    push(`${pathname}?${current.toString()}`);
  }

  return (
    <Dropdown title="Select Sprint" options={usersList} selectedOption={selectedUserKey} onSelect={handleSelect} />
  );
}
