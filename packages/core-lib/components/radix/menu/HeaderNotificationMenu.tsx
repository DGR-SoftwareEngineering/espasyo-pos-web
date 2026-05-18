import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  ScrollArea,
  Spinner,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import {
  BellIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  GearIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { useNotificationFeed } from "../../../core/hooks";
import { useRouter } from "../../../core/router";
import { usePublicSettings } from "../../../core/contexts";
import { NotificationCategoryDto, NotificationDto } from "../../../api/commons/types";

const parseServerIso = (iso: string): number => {
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTz ? iso : iso + "Z").getTime();
};

const RELATIVE_TIME = (iso: string): string => {
  const then = parseServerIso(iso);
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  if (diffMs < -60000) return "in a moment";
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const PATH_REWRITES: ReadonlyArray<{ from: RegExp; to: string }> = [
  { from: /^\/admin\/hub\/inventory\/?$/, to: "/admin/hub/inventory/inventory-list" },
  { from: /^\/admin\/hub\/users\/?$/, to: "/admin/hub/user-management" },
  { from: /^\/admin\/hub\/suppliers\/?$/, to: "/admin/hub/supplier-management" },
];

const normalizeLink = (link: string): string => {
  for (const rule of PATH_REWRITES) {
    if (rule.from.test(link)) return rule.to;
  }
  return link;
};

interface CategoryMeta {
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "red" | "gray";
  bg: string;
}

const CATEGORY_META: Record<NotificationCategoryDto, CategoryMeta> = {
  [NotificationCategoryDto.Info]: {
    icon: <InfoCircledIcon width={18} height={18} />,
    color: "blue",
    bg: "var(--blue-a3)",
  },
  [NotificationCategoryDto.Success]: {
    icon: <CheckCircledIcon width={18} height={18} />,
    color: "green",
    bg: "var(--green-a3)",
  },
  [NotificationCategoryDto.Warning]: {
    icon: <ExclamationTriangleIcon width={18} height={18} />,
    color: "amber",
    bg: "var(--amber-a3)",
  },
  [NotificationCategoryDto.Error]: {
    icon: <CrossCircledIcon width={18} height={18} />,
    color: "red",
    bg: "var(--red-a3)",
  },
  [NotificationCategoryDto.System]: {
    icon: <GearIcon width={18} height={18} />,
    color: "gray",
    bg: "var(--gray-a3)",
  },
};

const fallbackMeta: CategoryMeta = CATEGORY_META[NotificationCategoryDto.Info];

type Filter = "all" | "unread";

export const HeaderNotificationMenu: React.FC = () => {
  const router = useRouter();
  const { features } = usePublicSettings();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    transport,
  } = useNotificationFeed({
    paused: !open && !features.notificationsEnabled,
    unreadOnly: filter === "unread" ? true : undefined,
  });

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const visible = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications,
    [notifications, filter],
  );

  if (!features.notificationsEnabled) return null;

  const handleNotificationClick = async (n: NotificationDto) => {
    if (!n.read) void markRead(n.notificationID);
    if (n.link) {
      setOpen(false);
      router.push(normalizeLink(n.link));
    }
  };

  return (
    <Box ref={wrapperRef} style={{ position: "relative", flexShrink: 0 }}>
      <Tooltip
        content={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "No new notifications"
        }
      >
        <IconButton
          variant={open ? "soft" : "ghost"}
          color="gray"
          size="2"
          radius="full"
          aria-label="Open notifications"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ position: "relative" }}
        >
          <BellIcon width={18} height={18} />
          {unreadCount > 0 && (
            <Box
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                background: "var(--red-9)",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid var(--color-panel-solid)",
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>

      {open && (
        <Box
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 380,
            maxWidth: "90vw",
            background: "var(--color-panel-solid)",
            border: "1px solid var(--gray-a5)",
            borderRadius: "var(--radius-3)",
            boxShadow: "var(--shadow-5)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            p="3"
            style={{
              borderBottom: "1px solid var(--gray-a3)",
              background: "var(--gray-a2)",
            }}
          >
            <Flex justify="between" align="center" gap="2">
              <Flex align="center" gap="2">
                <BellIcon />
                <Text size="2" weight="bold">
                  Notifications
                </Text>
                {transport === "sse" && (
                  <Tooltip content="Live updates active">
                    <Badge color="green" variant="soft" radius="full" size="1">
                      <Box
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--green-9)",
                        }}
                      />
                      Live
                    </Badge>
                  </Tooltip>
                )}
                {transport === "polling" && (
                  <Tooltip content="Polling — real-time updates disabled in settings">
                    <Badge color="amber" variant="soft" radius="full" size="1">
                      Polling
                    </Badge>
                  </Tooltip>
                )}
              </Flex>
              {unreadCount > 0 && (
                <Text
                  size="1"
                  weight="medium"
                  style={{
                    color: "var(--accent-11)",
                    cursor: "pointer",
                  }}
                  onClick={() => void markAllRead()}
                >
                  Mark all read
                </Text>
              )}
            </Flex>

            {/* Filter pills */}
            <Flex gap="1" mt="2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterPill>
              <FilterPill
                active={filter === "unread"}
                onClick={() => setFilter("unread")}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </FilterPill>
            </Flex>
          </Box>

          {/* Body */}
          <Box style={{ maxHeight: 440, minHeight: 200 }}>
            {loading && notifications.length === 0 ? (
              <Flex align="center" justify="center" style={{ minHeight: 200 }}>
                <Spinner size="3" />
              </Flex>
            ) : error ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap="2"
                p="4"
                style={{ minHeight: 200 }}
              >
                <CrossCircledIcon
                  width={28}
                  height={28}
                  style={{ color: "var(--red-11)" }}
                />
                <Text size="2" color="gray" align="center">
                  {error}
                </Text>
                <Text
                  size="1"
                  style={{ color: "var(--accent-11)", cursor: "pointer" }}
                  onClick={() => void refresh()}
                >
                  Retry
                </Text>
              </Flex>
            ) : visible.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap="2"
                p="4"
                style={{ minHeight: 200 }}
              >
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--gray-a3)",
                    color: "var(--gray-10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BellIcon width={22} height={22} />
                </Box>
                <Text size="2" weight="medium">
                  {filter === "unread" ? "No unread notifications" : "All caught up"}
                </Text>
                <Text size="1" color="gray" align="center">
                  We&apos;ll let you know when something needs your attention.
                </Text>
              </Flex>
            ) : (
              <ScrollArea style={{ maxHeight: 440 }}>
                <Flex direction="column">
                  {visible.map((n) => {
                    const meta = CATEGORY_META[n.category] ?? fallbackMeta;
                    return (
                      <Flex
                        key={n.notificationID}
                        align="start"
                        gap="3"
                        p="3"
                        role={n.link ? "link" : "article"}
                        tabIndex={n.link ? 0 : undefined}
                        onClick={() => handleNotificationClick(n)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }}
                        style={{
                          cursor: n.link ? "pointer" : "default",
                          background: n.read ? undefined : "var(--accent-a2)",
                          borderBottom: "1px solid var(--gray-a3)",
                          transition: "background 100ms ease",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--gray-a3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = n.read
                            ? ""
                            : "var(--accent-a2)";
                        }}
                      >
                        {!n.read && (
                          <Box
                            style={{
                              position: "absolute",
                              left: 6,
                              top: "50%",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--accent-9)",
                              transform: "translateY(-50%)",
                            }}
                          />
                        )}
                        <Box
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: meta.bg,
                            color: `var(--${meta.color}-11)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Flex
                            align="center"
                            gap="2"
                            justify="between"
                            wrap="wrap"
                          >
                            <Text
                              size="2"
                              weight={n.read ? "regular" : "bold"}
                              truncate
                            >
                              {n.title}
                            </Text>
                            <Text size="1" color="gray">
                              {RELATIVE_TIME(n.createdAt)}
                            </Text>
                          </Flex>
                          {n.message && (
                            <Text
                              size="1"
                              color="gray"
                              as="div"
                              style={{
                                marginTop: 2,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {n.message}
                            </Text>
                          )}
                          {n.entityName && (
                            <Badge
                              color="gray"
                              variant="soft"
                              radius="full"
                              size="1"
                              mt="1"
                            >
                              {n.entityName}
                            </Badge>
                          )}
                        </Box>
                      </Flex>
                    );
                  })}
                </Flex>
              </ScrollArea>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterPill: React.FC<FilterPillProps> = ({ active, onClick, children }) => (
  <Box
    role="tab"
    aria-selected={active}
    onClick={onClick}
    style={{
      padding: "4px 10px",
      borderRadius: 999,
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 600,
      background: active ? "var(--accent-9)" : "var(--gray-a3)",
      color: active ? "var(--accent-contrast)" : "var(--gray-11)",
      transition: "background 120ms ease, color 120ms ease",
      userSelect: "none",
    }}
  >
    {children}
  </Box>
);
