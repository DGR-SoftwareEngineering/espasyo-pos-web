import React from "react";
import { Badge, Box, Button, Callout, Card, Flex, Grid, Separator, Text, Tooltip } from "@radix-ui/themes";
import {
  Pencil1Icon,
} from "@radix-ui/react-icons";
import {
  LocalOfferOutlined,
  MailOutline,
  PhoneOutlined,
  HomeOutlined,
  CakeOutlined,
  CalendarMonthOutlined,
  LocationCityOutlined,
  EventNoteOutlined,
  AccessTimeRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { CustomerDetailDto } from "core-lib/api/crm";
import { formatBirthday, formatDate, formatRelativeDate } from "../format";
import { SEGMENT_CONFIG, SUGGESTED_TAGS } from "../constants";

interface ProfileTabProps {
  customer: CustomerDetailDto;
  onEdit: () => void;
  onEditTags: () => void;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <Flex gap="3" align="start">
    <Box
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--gray-a3)",
        color: "var(--gray-11)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
      <Text size="1" color="gray">
        {label}
      </Text>
      <Text size="2" weight="medium" style={{ wordBreak: "break-word" }}>
        {value || "—"}
      </Text>
    </Flex>
  </Flex>
);

function getDaysAgo(iso: string | null | undefined): number {
  if (!iso) return 0;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  customer,
  onEdit,
  onEditTags,
}) => {
  const tags = customer.tags ?? [];
  const segmentConfig = SEGMENT_CONFIG[customer.segment];
  const daysSinceLastVisit = getDaysAgo(customer.lastVisitAt);

  return (
    <Flex direction="column" gap="4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }}>
        <Card variant="surface" size="3">
          <Callout.Root color={segmentConfig?.color as any} mb="3">
            <Text size="2" weight="medium">
              <strong>{segmentConfig?.label}</strong> — {segmentConfig?.description}
            </Text>
          </Callout.Root>

          <Grid columns={{ initial: "1", sm: "3" }} gap="3">
            <Box>
              <Text size="1" color="gray" as="div" mb="1">Member for</Text>
              <Badge color="indigo" variant="soft">{formatDate(customer.createdAt)}</Badge>
            </Box>
            <Box>
              <Text size="1" color="gray" as="div" mb="1">First visit</Text>
              <Text size="2" weight="medium">{formatRelativeDate(customer.firstVisitAt)}</Text>
            </Box>
            <Box>
              <Text size="1" color="gray" as="div" mb="1">Last visit</Text>
              <Text size="2" weight="medium" style={{ color: daysSinceLastVisit > 60 ? "var(--red-11)" : undefined }}>
                {formatRelativeDate(customer.lastVisitAt)}
              </Text>
            </Box>
          </Grid>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
        <Card variant="surface" size="3">
          <Flex justify="between" align="center" mb="3">
            <Text size="3" weight="bold">
              Contact Information
            </Text>
            <Button variant="soft" size="2" onClick={onEdit}>
              <Pencil1Icon /> Edit Profile
            </Button>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <InfoRow
              icon={<PhoneOutlined style={{ fontSize: 16 }} />}
              label="Phone"
              value={customer.phone}
            />
            <InfoRow
              icon={<MailOutline style={{ fontSize: 16 }} />}
              label="Email"
              value={customer.email}
            />
            <InfoRow
              icon={<HomeOutlined style={{ fontSize: 16 }} />}
              label="Address"
              value={customer.address}
            />
            <InfoRow
              icon={<LocationCityOutlined style={{ fontSize: 16 }} />}
              label="City"
              value={customer.city}
            />
            <InfoRow
              icon={<CakeOutlined style={{ fontSize: 16 }} />}
              label="Birthday"
              value={formatBirthday(customer.birthday)}
            />
            <InfoRow
              icon={<CalendarMonthOutlined style={{ fontSize: 16 }} />}
              label="Member since"
              value={formatDate(customer.createdAt)}
            />
          </Grid>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16 }}>
        <Card variant="surface" size="3">
          <Flex justify="between" align="center" mb="3">
            <Flex align="center" gap="2">
              <LocalOfferOutlined style={{ fontSize: 18, color: "var(--orange-11)" }} />
              <Text size="3" weight="bold">
                Tags
              </Text>
              <Badge size="1" color="gray" variant="soft">
                {tags.length}
              </Badge>
            </Flex>
            <Button variant="soft" color="orange" size="2" onClick={onEditTags}>
              <Pencil1Icon /> Manage Tags
            </Button>
          </Flex>
          <Separator size="4" mb="3" />
          {tags.length === 0 ? (
            <Flex direction="column" gap="2">
              <Text size="2" color="gray">
                No tags yet. Suggested tags:
              </Text>
              <Flex gap="2" wrap="wrap">
                {SUGGESTED_TAGS.slice(0, 5).map((tag) => (
                  <Tooltip key={tag} content="Click 'Manage Tags' to add">
                    <Badge color="gray" variant="soft" size="2">
                      {tag}
                    </Badge>
                  </Tooltip>
                ))}
              </Flex>
            </Flex>
          ) : (
            <Flex gap="2" wrap="wrap">
              {tags.map((t) => (
                <Badge key={t} color="orange" variant="soft" size="2">
                  {t}
                </Badge>
              ))}
            </Flex>
          )}
        </Card>
      </motion.div>
    </Flex>
  );
};
