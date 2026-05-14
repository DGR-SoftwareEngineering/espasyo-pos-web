import React from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  ExitIcon,
  PersonIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "../../../core/router";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
}

export const RadixOptionsMenu: React.FC<Props> = ({ logout, loading }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logout?.();
    if (!loading) router.push("/");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          color="gray"
          aria-label="Open user menu"
          radius="full"
        >
          <DotsVerticalIcon />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content size="2" align="end" sideOffset={4}>
        <DropdownMenu.Item>
          <PersonIcon />
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <GearIcon />
          Settings
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item color="red" onSelect={handleLogout}>
          <ExitIcon />
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
