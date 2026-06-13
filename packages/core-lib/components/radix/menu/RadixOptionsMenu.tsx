import React, { useState } from "react";
import { useRouter } from "next/router";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  ExitIcon,
  PersonIcon,
  GearIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import { useRouter as useCoreRouter } from "../../../core/router";
import { useAuthContext } from "../../../core/contexts";
import { MpinManagementDialog } from "../security/MpinManagementDialog";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
}

export const RadixOptionsMenu: React.FC<Props> = ({ logout, loading }) => {
  const coreRouter = useCoreRouter();
  const nextRouter = useRouter();
  const { role } = useAuthContext();
  const isAdmin = (role ?? "").toLowerCase() === "admin";
  const [mpinOpen, setMpinOpen] = useState(false);

  const handleLogout = async () => {
    await logout?.();
    if (!loading) coreRouter.push("/");
  };

  const handleSettings = () => {
    if (isAdmin) nextRouter.push("/admin/hub/settings");
  };

  return (
    <>
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
          <DropdownMenu.Item onSelect={() => setMpinOpen(true)}>
            <LockClosedIcon />
            MPIN Security
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled={!isAdmin} onSelect={handleSettings}>
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

      <MpinManagementDialog open={mpinOpen} onOpenChange={setMpinOpen} />
    </>
  );
};
