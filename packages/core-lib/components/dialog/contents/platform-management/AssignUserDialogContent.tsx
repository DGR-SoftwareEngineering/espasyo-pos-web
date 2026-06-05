import React, { useState, useMemo } from "react";
import { Box, Flex, Avatar, Card, Text, Badge, IconButton } from "@radix-ui/themes";
import AddRounded from "@mui/icons-material/AddRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { useToastContext } from "../../../../core/contexts";
import { PlatformDto, PlatformUserDto } from "../../../../api/platform/types";
import { UserDto } from "../../../../api/commons/types";

interface AssignUserDialogContentProps {
  data: PlatformDto;
  onSuccess?: () => void;
  onClose?: () => void;
}

const getRoleBadgeColor = (roleName: string | undefined) => {
  if (!roleName) return "gray";
  const lower = roleName.toLowerCase();
  if (lower.includes("admin")) return "red";
  if (lower.includes("cashier")) return "blue";
  if (lower.includes("customer")) return "green";
  if (lower.includes("supplier")) return "orange";
  return "gray";
};

export const AssignUserDialogContent: React.FC<AssignUserDialogContentProps> = ({
  data,
  onSuccess,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const [searchQuery, setSearchQuery] = useState("");

  const assignedUsersData = useApi((api) =>
    api.platform.getUsersByPlatform(data.platformID)
  );
  const allUsersData = useApi((api) => api.commons.userList(1, 100));

  const assignCb = useApiCallback((api, { platformId, userId }: { platformId: string; userId: string }) =>
    api.platform.assignUser(platformId, userId)
  );
  const removeCb = useApiCallback((api, { platformId, userId }: { platformId: string; userId: string }) =>
    api.platform.removeUser(platformId, userId)
  );

  const assignedUsers = (assignedUsersData.result?.data.response || []) as PlatformUserDto[];
  const allUsers = (allUsersData.result?.data.response?.items || []) as UserDto[];

  const assignedUserIds = new Set(assignedUsers.map((u) => u.userID));
  const availableUsers = allUsers.filter((u) => !assignedUserIds.has(u.userID));
  const filteredAvailable = availableUsers.filter(
    (u) =>
      (u.userInfo?.firstName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.userInfo?.lastName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.userInfo?.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async (userId: string) => {
    try {
      await assignCb.execute({ platformId: data.platformID, userId });
      showToast("User assigned successfully", "success");
      assignedUsersData.execute();
    } catch (error) {
      showToast(Array.isArray(error) ? error[0] : "Failed to assign user", "error");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeCb.execute({ platformId: data.platformID, userId });
      showToast("User removed successfully", "success");
      assignedUsersData.execute();
    } catch (error) {
      showToast(Array.isArray(error) ? error[0] : "Failed to remove user", "error");
    }
  };

  return (
    <Box style={{ padding: "var(--space-4)" }}>
      <Flex direction="column" gap="4">
        <Text size="2" color="gray" weight="medium">
          Manage Users — {data.name}
        </Text>

        <Flex direction={{ initial: "column", md: "row" }} gap="4" style={{ minHeight: "400px" }}>
          {/* Left Panel: Assigned Users */}
          <Card style={{ flex: 1, padding: "var(--space-3)", backgroundColor: "var(--gray-2)", overflow: "auto", maxHeight: "400px" }}>
            <Flex direction="column" gap="3">
              <Text size="2" weight="bold">
                Assigned Users ({assignedUsers.length})
              </Text>
              {assignedUsersData.loading ? (
                <Flex justify="center" align="center" style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-3)" }}>
                  <Text size="1" color="gray">Loading...</Text>
                </Flex>
              ) : assignedUsers.length === 0 ? (
                <Text size="1" color="gray" style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-3)" }}>
                  No users assigned yet
                </Text>
              ) : (
                <Flex direction="column" gap="2">
                  {assignedUsers.map((user) => (
                    <Box
                      key={user.userID}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "var(--space-2)",
                        backgroundColor: "white",
                        borderRadius: "var(--radius-2)",
                        border: "1px solid var(--gray-6)",
                      }}
                    >
                      <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                        <Avatar size="2" src={user.imageUrl} fallback="?" radius="full" />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="1" weight="bold">
                            {user.fullName}
                          </Text>
                          {user.roleName && (
                            <Badge
                              color={getRoleBadgeColor(user.roleName)}
                              variant="outline"
                              size="1"
                            >
                              {user.roleName}
                            </Badge>
                          )}
                        </Box>
                      </Flex>
                      <IconButton
                        size="1"
                        onClick={() => handleRemove(user.userID)}
                        disabled={removeCb.loading}
                        aria-label="Remove"
                      >
                        <CloseRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </Card>

          {/* Right Panel: Available Users */}
          <Card style={{ flex: 1, padding: "var(--space-3)", backgroundColor: "var(--gray-2)", overflow: "auto", maxHeight: "400px" }}>
            <Flex direction="column" gap="3">
              <Text size="2" weight="bold">
                Add Users
              </Text>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "var(--space-2)",
                  borderRadius: "var(--radius-2)",
                  border: "1px solid var(--gray-7)",
                  fontFamily: "inherit",
                }}
              />
              {allUsersData.loading ? (
                <Flex justify="center" align="center" style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-3)" }}>
                  <Text size="1" color="gray">Loading...</Text>
                </Flex>
              ) : filteredAvailable.length === 0 ? (
                <Text
                  size="1"
                  color="gray"
                  style={{ paddingTop: "var(--space-3)", paddingBottom: "var(--space-3)" }}
                >
                  {availableUsers.length === 0 ? "All users assigned" : "No matching users"}
                </Text>
              ) : (
                <Flex direction="column" gap="2">
                  {filteredAvailable.map((user) => (
                    <Box
                      key={user.userID}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "var(--space-2)",
                        backgroundColor: "white",
                        borderRadius: "var(--radius-2)",
                        border: "1px solid var(--gray-6)",
                      }}
                    >
                      <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                        <Avatar size="2" src={user.userInfo?.imageUrl ?? undefined} fallback="?" radius="full" />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="1" weight="bold">
                            {`${user.userInfo?.firstName ?? ""} ${user.userInfo?.lastName ?? ""}`}
                          </Text>
                          {user.roleName && (
                            <Badge
                              color={getRoleBadgeColor(user.roleName)}
                              variant="outline"
                              size="1"
                            >
                              {user.roleName}
                            </Badge>
                          )}
                        </Box>
                      </Flex>
                      <IconButton
                        size="1"
                        onClick={() => handleAssign(user.userID)}
                        disabled={assignCb.loading}
                        aria-label="Add"
                      >
                        <AddRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
};
