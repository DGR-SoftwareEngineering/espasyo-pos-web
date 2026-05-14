import React from "react";
import { Box, Flex, Heading, Text, Avatar } from "@radix-ui/themes";
import { SvgIconComponent } from "@mui/icons-material";

interface FormHeaderProps {
  isEdit: boolean;
  title: string;
  editTitle?: string;
  subtitle: string;
  editSubtitle?: string;
  /** Pass an MUI icon component — rendered inside a Radix Avatar. Alternatively
   *  pass any ReactNode via the new `iconNode` prop. */
  icon?: SvgIconComponent;
  iconNode?: React.ReactNode;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  isEdit,
  title,
  editTitle,
  subtitle,
  editSubtitle,
  icon: Icon,
  iconNode,
}) => {
  const displayTitle = isEdit
    ? editTitle || `Edit ${title}`
    : `Create New ${title}`;
  const displaySubtitle = isEdit ? editSubtitle || subtitle : subtitle;

  return (
    <Box
      px="5"
      py="4"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-a2) 0%, var(--violet-a2) 100%)",
        borderBottom: "1px solid var(--gray-a4)",
      }}
    >
      <Flex align="center" gap="3">
        <Avatar
          radius="full"
          size="3"
          fallback={
            <Box style={{ color: "var(--accent-11)" }}>
              {Icon ? <Icon /> : (iconNode ?? "•")}
            </Box>
          }
          color="indigo"
          variant="soft"
        />
        <Box>
          <Heading size="5" weight="bold">
            {displayTitle}
          </Heading>
          <Text size="2" color="gray">
            {displaySubtitle}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
