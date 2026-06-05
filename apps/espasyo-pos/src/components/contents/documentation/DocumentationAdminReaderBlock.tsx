import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import {
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined,
  MenuBookOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { DocumentationDto } from "core-lib/api/commons/types";
import { DOC_CONTENT_CSS, estimateReadTime } from "./docContentStyles";

const ROLE_COLORS: Record<string, string> = {
  Admin: "var(--indigo-11)",
  Cashier: "var(--teal-11)",
  Both: "var(--violet-11)",
};

export const DocumentationAdminReaderBlock: React.FC = () => {
  const { showToast } = useToastContext();

  const [articles, setArticles] = useState<DocumentationDto[]>([]);
  const [selected, setSelected] = useState<DocumentationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const listCb = useApiCallback(async (api) => api.commons.documentationByRole("Admin"));

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await listCb.execute(undefined);
        if (isMounted && result?.data?.response) {
          const items = result.data.response;
          setArticles(items);
          if (items.length > 0) setSelected(items[0]);
        }
      } catch {
        if (isMounted) showToast("Failed to load documentation", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIndex = articles.findIndex((a) => a.documentationID === selected?.documentationID);
  const prev = selectedIndex > 0 ? articles[selectedIndex - 1] : null;
  const next = selectedIndex < articles.length - 1 ? articles[selectedIndex + 1] : null;

  const selectArticle = useCallback((article: DocumentationDto) => {
    setSelected(article);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Box style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <style>{DOC_CONTENT_CSS}</style>

      {/* Left sidebar */}
      <Box
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid var(--gray-a4)",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-panel-solid)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar header */}
        <Flex
          direction="column"
          gap="1"
          px="4"
          py="4"
          style={{ borderBottom: "1px solid var(--gray-a4)" }}
        >
          <Flex align="center" gap="2">
            <MenuBookOutlined style={{ fontSize: 20, color: "var(--indigo-11)" }} />
            <Text size="3" weight="bold">Documentation</Text>
          </Flex>
          <Badge color="indigo" variant="soft" size="1" style={{ alignSelf: "flex-start" }}>
            Admin Guide
          </Badge>
        </Flex>

        {/* Article list */}
        <Box style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {loading ? (
            <Flex align="center" justify="center" py="6">
              <Text size="2" color="gray">Loading…</Text>
            </Flex>
          ) : articles.length === 0 ? (
            <Flex align="center" justify="center" py="6">
              <Text size="2" color="gray">No articles yet.</Text>
            </Flex>
          ) : (
            articles.map((a) => {
              const isActive = selected?.documentationID === a.documentationID;
              const roleColor = ROLE_COLORS[a.targetRole] ?? "var(--gray-11)";
              return (
                <button
                  key={a.documentationID}
                  type="button"
                  onClick={() => selectArticle(a)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: isActive ? "var(--indigo-a3)" : "transparent",
                    marginBottom: 2,
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--gray-a3)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <Box
                    style={{
                      width: 4,
                      height: 32,
                      borderRadius: 2,
                      background: isActive ? "var(--indigo-9)" : roleColor,
                      opacity: isActive ? 1 : 0.5,
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="2"
                    weight={isActive ? "bold" : "regular"}
                    style={{
                      color: isActive ? "var(--indigo-11)" : "var(--gray-12)",
                      lineHeight: 1.35,
                    }}
                    truncate
                  >
                    {a.title}
                  </Text>
                </button>
              );
            })
          )}
        </Box>

        {/* Sidebar footer */}
        <Flex px="3" py="3" style={{ borderTop: "1px solid var(--gray-a4)" }}>
          <Link href="/admin/hub/documentation/manage" style={{ width: "100%" }}>
            <Button variant="soft" color="indigo" size="2" style={{ width: "100%" }}>
              <SettingsOutlined style={{ fontSize: 15 }} />
              Manage Docs
            </Button>
          </Link>
        </Flex>
      </Box>

      {/* Main content */}
      <Box ref={contentRef} style={{ flex: 1, overflowY: "auto", background: "var(--gray-a1)" }}>
        {loading ? (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Text color="gray">Loading documentation…</Text>
          </Flex>
        ) : !selected ? (
          <Flex align="center" justify="center" style={{ height: "100%" }} direction="column" gap="3">
            <MenuBookOutlined style={{ fontSize: 56, color: "var(--gray-7)" }} />
            <Text color="gray" size="3">Select an article from the sidebar.</Text>
          </Flex>
        ) : (
          <Box style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px 60px" }}>
            {/* Article header */}
            <Box
              mb="6"
              p="6"
              style={{
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--indigo-a3) 0%, var(--accent-a2) 100%)",
                border: "1px solid var(--indigo-a4)",
              }}
            >
              <Flex align="center" gap="2" mb="3">
                <Badge color="indigo" variant="soft" size="1">{selected.targetRole}</Badge>
                <Text size="1" color="gray">•</Text>
                <Text size="1" color="gray">{estimateReadTime(selected.contentHtml)}</Text>
                {selected.createdAt && (
                  <>
                    <Text size="1" color="gray">•</Text>
                    <Text size="1" color="gray">
                      {new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  </>
                )}
              </Flex>
              <Heading size="7" mb="2" style={{ lineHeight: 1.2 }}>{selected.title}</Heading>
              {selected.subtitle && (
                <Text size="3" color="gray">{selected.subtitle}</Text>
              )}
              <Text size="1" color="gray" style={{ display: "block", marginTop: 12 }}>
                By {selected.author}
              </Text>
            </Box>

            {/* Article content */}
            <Box
              style={{
                background: "var(--color-panel-solid)",
                borderRadius: 12,
                padding: "32px 36px",
                border: "1px solid var(--gray-a4)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="doc-content"
                dangerouslySetInnerHTML={{ __html: selected.contentHtml }}
              />
            </Box>

            {/* Prev / Next nav */}
            {(prev || next) && (
              <Flex justify="between" mt="6" gap="3">
                {prev ? (
                  <button
                    type="button"
                    onClick={() => selectArticle(prev)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: "var(--color-panel-solid)",
                      border: "1px solid var(--gray-a4)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <ArrowBackIosNewOutlined style={{ fontSize: 14, color: "var(--gray-10)" }} />
                    <Box>
                      <Text size="1" color="gray" style={{ display: "block" }}>Previous</Text>
                      <Text size="2" weight="bold">{prev.title}</Text>
                    </Box>
                  </button>
                ) : <Box style={{ flex: 1 }} />}
                {next ? (
                  <button
                    type="button"
                    onClick={() => selectArticle(next)}
                    style={{
                      flex: 1,
                      textAlign: "right",
                      background: "var(--color-panel-solid)",
                      border: "1px solid var(--gray-a4)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <Box>
                      <Text size="1" color="gray" style={{ display: "block" }}>Next</Text>
                      <Text size="2" weight="bold">{next.title}</Text>
                    </Box>
                    <ArrowForwardIosOutlined style={{ fontSize: 14, color: "var(--gray-10)" }} />
                  </button>
                ) : <Box style={{ flex: 1 }} />}
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
