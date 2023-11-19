"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Dropdown from "./Dropdown";

type User = {
  accountId: string;
  displayName: string;
  self: string;
};

type UserSelectorProps = {
  users: User[];
};

const ALL_USERS = {
  key: 'ALL_USERS', 
  name: 'All Users'
};

export default function UsersSelector({
  users,
}: UserSelectorProps) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedUserKey = searchParams.get("user");

  const usersList = [...users.map(u => ({ key: u.accountId, name: u.displayName })), ALL_USERS]

  const handleSelect = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (key === ALL_USERS.key) {
      current.delete("user")
    } else {
      current.set("user", key);
    }

    push(`${pathname}?${current.toString()}`);
  }

  return (
    <Dropdown title="Select User" options={usersList} selectedOption={selectedUserKey} onSelect={handleSelect} />
  );
}
