import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import {
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined,
  HelpOutlineOutlined,
} from "@mui/icons-material";
import { useApiCallback } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import { DocumentationDto } from "core-lib/api/commons/types";
import { DOC_CONTENT_CSS, estimateReadTime } from "../../documentation/docContentStyles";

export const DocumentationCashierReaderBlock: React.FC = () => {
  const { showToast } = useToastContext();

  const [articles, setArticles] = useState<DocumentationDto[]>([]);
  const [selected, setSelected] = useState<DocumentationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const listCb = useApiCallback(async (api) => api.commons.documentationByRole("Cashier"));

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
        <Flex
          direction="column"
          gap="1"
          px="4"
          py="4"
          style={{ borderBottom: "1px solid var(--gray-a4)" }}
        >
          <Flex align="center" gap="2">
            <HelpOutlineOutlined style={{ fontSize: 20, color: "var(--teal-11)" }} />
            <Text size="3" weight="bold">Help &amp; Guide</Text>
          </Flex>
          <Badge color="teal" variant="soft" size="1" style={{ alignSelf: "flex-start" }}>
            Cashier Guide
          </Badge>
        </Flex>

        <Box style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {loading ? (
            <Flex align="center" justify="center" py="6">
              <Text size="2" color="gray">Loading…</Text>
            </Flex>
          ) : articles.length === 0 ? (
            <Flex align="center" justify="center" py="6" direction="column" gap="2">
              <Text size="2" color="gray">No articles available yet.</Text>
              <Text size="1" color="gray">Contact your admin.</Text>
            </Flex>
          ) : (
            articles.map((a) => {
              const isActive = selected?.documentationID === a.documentationID;
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
                    background: isActive ? "var(--teal-a3)" : "transparent",
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
                      background: isActive ? "var(--teal-9)" : "var(--teal-7)",
                      opacity: isActive ? 1 : 0.5,
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="2"
                    weight={isActive ? "bold" : "regular"}
                    style={{ color: isActive ? "var(--teal-11)" : "var(--gray-12)", lineHeight: 1.35 }}
                    truncate
                  >
                    {a.title}
                  </Text>
                </button>
              );
            })
          )}
        </Box>
      </Box>

      {/* Main content */}
      <Box ref={contentRef} style={{ flex: 1, overflowY: "auto", background: "var(--gray-a1)" }}>
        {loading ? (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Text color="gray">Loading guide…</Text>
          </Flex>
        ) : !selected ? (
          <Flex align="center" justify="center" style={{ height: "100%" }} direction="column" gap="3">
            <HelpOutlineOutlined style={{ fontSize: 56, color: "var(--gray-7)" }} />
            <Text color="gray" size="3">Select a topic from the sidebar.</Text>
          </Flex>
        ) : (
          <Box style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px 60px" }}>
            {/* Article header */}
            <Box
              mb="6"
              p="6"
              style={{
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--teal-a3) 0%, var(--cyan-a2) 100%)",
                border: "1px solid var(--teal-a4)",
              }}
            >
              <Flex align="center" gap="2" mb="3">
                <Badge color="teal" variant="soft" size="1">{selected.targetRole === "Both" ? "All Staff" : selected.targetRole}</Badge>
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
