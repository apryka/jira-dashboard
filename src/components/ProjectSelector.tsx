"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Dropdown from "./Dropdown";

type Project = {
  id: string;
  name: string;
  self: string;
  key: string;
};

type ProjectSelectorProps = {
  projects: Project[];
};

export default function ProjectSelector({
  projects,
}: ProjectSelectorProps) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedProjectKey = searchParams.get("project");

  const handleSelect = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set("project", key);
    push(`${pathname}?${current.toString()}`);
  }

  return (
    <Dropdown title="Select Project" options={projects} selectedOption={selectedProjectKey} onSelect={handleSelect} />
  );
}
