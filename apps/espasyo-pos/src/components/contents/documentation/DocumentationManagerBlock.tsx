import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  ScrollArea,
  Select,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  AddCircleOutlined,
  ArrowBackOutlined,
  BookmarkBorderOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useApiCallback, useResolution } from "core-lib/core/hooks";
import { useToastContext } from "core-lib";
import {
  CreateDocumentationParams,
  DocumentationDto,
  UpdateDocumentationParams,
} from "core-lib/api/commons/types";
import { DOC_CONTENT_CSS } from "./docContentStyles";
import { mobileDialogStyle, mobileContentStyle, mobileHeaderStyle, mobileFooterStyle } from "core-lib/components/radix/dialog/mobileFullScreen";

type TargetRole = "Admin" | "Cashier" | "Both";

const ROLE_CONFIG: Record<TargetRole, { color: string; bg: string; border: string; label: string }> = {
  Admin: { color: "var(--indigo-11)", bg: "var(--indigo-9)", border: "var(--indigo-a5)", label: "Admin" },
  Cashier: { color: "var(--teal-11)", bg: "var(--teal-9)", border: "var(--teal-a5)", label: "Cashier" },
  Both: { color: "var(--violet-11)", bg: "var(--violet-9)", border: "var(--violet-a5)", label: "Both Roles" },
};

const HTML_TOOLBAR: { label: string; action: string; title: string }[] = [
  { label: "H1", action: "<h1></h1>", title: "Heading 1" },
  { label: "H2", action: "<h2></h2>", title: "Heading 2" },
  { label: "H3", action: "<h3></h3>", title: "Heading 3" },
  { label: "P", action: "<p></p>", title: "Paragraph" },
  { label: "B", action: "<strong></strong>", title: "Bold" },
  { label: "I", action: "<em></em>", title: "Italic" },
  { label: "UL", action: "<ul>\n  <li></li>\n</ul>", title: "Unordered list" },
  { label: "OL", action: "<ol>\n  <li></li>\n</ol>", title: "Ordered list" },
  { label: "Table", action: "<table>\n  <tr><th>Header</th><th>Header</th></tr>\n  <tr><td>Cell</td><td>Cell</td></tr>\n</table>", title: "Table" },
  { label: "Quote", action: '<blockquote></blockquote>', title: "Blockquote" },
  { label: "Code", action: "<code></code>", title: "Inline code" },
  { label: "Pre", action: "<pre><code></code></pre>", title: "Code block" },
  { label: "HR", action: "<hr />", title: "Horizontal rule" },
  { label: "Link", action: '<a href=""></a>', title: "Link" },
  { label: "Tip", action: '<div class="tip">💡 </div>', title: "Tip box" },
  { label: "Warn", action: '<div class="warn">⚠️ </div>', title: "Warning box" },
];

const emptyForm: CreateDocumentationParams = {
  title: "",
  subtitle: "",
  contentHtml: "",
  targetRole: "Admin",
  isPublished: false,
  displayOrder: 1,
};

export const DocumentationManagerBlock: React.FC = () => {
  const { showToast } = useToastContext();

  const [articles, setArticles] = useState<DocumentationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSmallMobile } = useResolution();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentationDto | null>(null);
  const [editTarget, setEditTarget] = useState<DocumentationDto | null>(null);
  const [form, setForm] = useState<CreateDocumentationParams>({ ...emptyForm });
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listCb = useApiCallback(async (api) => api.commons.documentationList());
  const createCb = useApiCallback(async (api, params: CreateDocumentationParams) =>
    api.commons.createDocumentation(params),
  );
  const updateCb = useApiCallback(async (api, params: UpdateDocumentationParams) =>
    api.commons.updateDocumentation(params),
  );
  const deleteCb = useApiCallback(async (api, id: string) => api.commons.deleteDocumentation(id));

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCb.execute(undefined);
      if (result?.data?.response) setArticles(result.data.response);
    } catch {
      showToast("Failed to load documentation", "error");
    } finally {
      setLoading(false);
    }
  }, [listCb, showToast]);

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced preview
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewHtml(form.contentHtml), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.contentHtml]);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setForm({ ...emptyForm });
    setPreviewHtml("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((article: DocumentationDto) => {
    setEditTarget(article);
    setForm({
      title: article.title,
      subtitle: article.subtitle ?? "",
      contentHtml: article.contentHtml,
      targetRole: article.targetRole as TargetRole,
      isPublished: article.isPublished,
      displayOrder: article.displayOrder,
    });
    setPreviewHtml(article.contentHtml);
    setDialogOpen(true);
  }, []);

  const insertHtml = useCallback((snippet: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = form.contentHtml.slice(0, start);
    const after = form.contentHtml.slice(end);
    const newContent = before + snippet + after;
    setForm((prev) => ({ ...prev, contentHtml: newContent }));
    // Restore cursor inside the new snippet
    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + snippet.indexOf("</") - 0;
      // Place cursor between opening and closing tag
      const innerStart = snippet.indexOf(">") + 1;
      el.setSelectionRange(start + innerStart, start + innerStart);
    });
  }, [form.contentHtml]);

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.contentHtml.trim()) { showToast("Content is required", "error"); return; }
    setSaveLoading(true);
    try {
      if (editTarget) {
        const result = await updateCb.execute({ documentationID: editTarget.documentationID, ...form });
        if (result?.data?.success) {
          showToast("Documentation updated", "success");
          setDialogOpen(false);
          loadArticles();
        } else {
          showToast(result?.data?.message ?? "Failed to update", "error");
        }
      } else {
        const result = await createCb.execute(form);
        if (result?.data?.success) {
          showToast("Documentation created", "success");
          setDialogOpen(false);
          loadArticles();
        } else {
          showToast(result?.data?.message ?? "Failed to create", "error");
        }
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setSaveLoading(false);
    }
  }, [form, editTarget, updateCb, createCb, showToast, loadArticles]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const result = await deleteCb.execute(deleteTarget.documentationID);
      if (result?.data?.success) {
        showToast("Article deleted", "success");
        setDeleteTarget(null);
        setArticles((prev) => prev.filter((a) => a.documentationID !== deleteTarget.documentationID));
      } else {
        showToast(result?.data?.message ?? "Failed to delete", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, deleteCb, showToast]);

  const setField = useCallback(<K extends keyof CreateDocumentationParams>(
    key: K, value: CreateDocumentationParams[K],
  ) => setForm((prev) => ({ ...prev, [key]: value })), []);

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-a1)" }}>
      <style>{DOC_CONTENT_CSS}</style>

      {/* Page header */}
      <Box
        px="6"
        py="5"
        style={{
          background: "linear-gradient(135deg, var(--indigo-a3) 0%, var(--accent-a1) 60%, transparent 100%)",
          borderBottom: "1px solid var(--gray-a4)",
        }}
      >
        <Flex align="center" justify="between" gap="4">
          <Flex align="center" gap="3">
            <Box
              p="2"
              style={{
                background: "var(--indigo-9)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MenuBookOutlined style={{ fontSize: 24, color: "white" }} />
            </Box>
            <Box>
              <Heading size="5">Documentation Manager</Heading>
              <Text size="2" color="gray">Create and manage help articles for admin and cashier users</Text>
            </Box>
          </Flex>
          <Flex gap="2">
            <Link href="/admin/hub/documentation">
              <Button variant="soft" color="gray" size="2">
                <ArrowBackOutlined style={{ fontSize: 15 }} />
                View Reader
              </Button>
            </Link>
            <Button variant="soft" color="gray" size="2" onClick={loadArticles} disabled={loading}>
              <ReloadIcon />
              Refresh
            </Button>
            <Button color="indigo" size="2" onClick={openCreate}>
              <AddCircleOutlined style={{ fontSize: 16 }} />
              New Article
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Stats bar */}
      <Flex px="6" py="3" gap="4" style={{ borderBottom: "1px solid var(--gray-a4)", background: "var(--color-panel-solid)" }}>
        <Flex align="center" gap="2">
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--indigo-9)" }} />
          <Text size="2" color="gray">Admin: {articles.filter(a => a.targetRole === "Admin" || a.targetRole === "Both").length}</Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--teal-9)" }} />
          <Text size="2" color="gray">Cashier: {articles.filter(a => a.targetRole === "Cashier" || a.targetRole === "Both").length}</Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green-9)" }} />
          <Text size="2" color="gray">Published: {articles.filter(a => a.isPublished).length}</Text>
        </Flex>
        <Flex align="center" gap="2">
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gray-7)" }} />
          <Text size="2" color="gray">Draft: {articles.filter(a => !a.isPublished).length}</Text>
        </Flex>
      </Flex>

      {/* Article grid */}
      <Box p="6">
        {loading ? (
          <Flex align="center" justify="center" py="16">
            <Text color="gray" size="3">Loading articles…</Text>
          </Flex>
        ) : articles.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            direction="column"
            gap="4"
            py="16"
          >
            <Box
              p="5"
              style={{
                background: "var(--indigo-a2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookmarkBorderOutlined style={{ fontSize: 40, color: "var(--indigo-9)" }} />
            </Box>
            <Box style={{ textAlign: "center" }}>
              <Heading size="4" mb="1">No documentation articles yet</Heading>
              <Text size="2" color="gray">Create your first article to get started.</Text>
            </Box>
            <Button color="indigo" size="3" onClick={openCreate}>
              <AddCircleOutlined style={{ fontSize: 18 }} />
              Create First Article
            </Button>
          </Flex>
        ) : (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {articles.map((a) => {
              const role = (a.targetRole as TargetRole) in ROLE_CONFIG ? a.targetRole as TargetRole : "Admin";
              const cfg = ROLE_CONFIG[role];
              const isHovered = hoveredCard === a.documentationID;
              return (
                <Box
                  key={a.documentationID}
                  style={{
                    position: "relative",
                    background: "var(--color-panel-solid)",
                    border: `1px solid ${isHovered ? cfg.border : "var(--gray-a4)"}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                    boxShadow: isHovered ? `0 8px 24px rgba(0,0,0,0.1)` : "0 1px 4px rgba(0,0,0,0.04)",
                    transform: isHovered ? "translateY(-2px)" : "none",
                  }}
                  onMouseEnter={() => setHoveredCard(a.documentationID)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => openEdit(a)}
                >
                  {/* Color stripe top */}
                  <Box style={{ height: 5, background: cfg.bg }} />

                  {/* Hover action buttons */}
                  {isHovered && (
                    <Flex
                      gap="1"
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 12,
                        zIndex: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                        title="Edit"
                        style={{
                          background: "var(--color-panel-solid)",
                          border: "1px solid var(--gray-a5)",
                          borderRadius: 8,
                          padding: "5px 8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <EditOutlined style={{ fontSize: 15, color: "var(--indigo-11)" }} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }}
                        title="Delete"
                        style={{
                          background: "var(--color-panel-solid)",
                          border: "1px solid var(--gray-a5)",
                          borderRadius: 8,
                          padding: "5px 8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <DeleteOutlined style={{ fontSize: 15, color: "var(--red-11)" }} />
                      </button>
                    </Flex>
                  )}

                  <Box p="4">
                    {/* Role + status badges */}
                    <Flex gap="2" mb="3" align="center">
                      <Badge
                        size="1"
                        variant="soft"
                        style={{ background: `${cfg.bg}22`, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </Badge>
                      <Badge
                        size="1"
                        color={a.isPublished ? "green" : "gray"}
                        variant="soft"
                      >
                        {a.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Text size="1" color="gray" style={{ marginLeft: "auto" }}>#{a.displayOrder}</Text>
                    </Flex>

                    {/* Title + subtitle */}
                    <Heading size="3" mb="1" style={{ lineHeight: 1.3 }}>{a.title}</Heading>
                    {a.subtitle && (
                      <Text size="2" color="gray" style={{ display: "block", marginBottom: 12 }} truncate>
                        {a.subtitle}
                      </Text>
                    )}

                    {/* Footer */}
                    <Flex align="center" justify="between" mt="4" pt="3" style={{ borderTop: "1px solid var(--gray-a4)" }}>
                      <Text size="1" color="gray">By {a.author}</Text>
                      {a.createdAt && (
                        <Text size="1" color="gray">
                          {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Create / Edit dialog — full screen */}
      <Dialog.Root open={dialogOpen} onOpenChange={(o) => !saveLoading && setDialogOpen(o)}>
        <Dialog.Content
          style={isSmallMobile ? { ...mobileDialogStyle, overflow: "hidden", display: "flex", flexDirection: "column" } : {
            maxWidth: "95vw",
            width: "95vw",
            height: "92vh",
            padding: 0,
            overflow: "hidden",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
          }}
          aria-describedby={undefined}
        >
          {/* Dialog header */}
          <Flex
            align="center"
            justify="between"
            px="4"
            py="3"
            style={isSmallMobile ? mobileHeaderStyle : {
              borderBottom: "1px solid var(--gray-a4)",
              flexShrink: 0,
              background: "var(--color-panel-solid)",
            }}
          >
            <Flex align="center" gap="3">
              <MenuBookOutlined style={{ fontSize: 20, color: "var(--indigo-11)" }} />
              <Dialog.Title mb="0" style={{ fontSize: 16, fontWeight: 700 }}>
                {editTarget ? `Editing: ${editTarget.title}` : "New Documentation Article"}
              </Dialog.Title>
            </Flex>
            <Flex gap="2">
              <Dialog.Close>
                <Button variant="soft" color="gray" size="2" disabled={saveLoading}>Cancel</Button>
              </Dialog.Close>
              <Button color="indigo" size="2" onClick={handleSave} loading={saveLoading}>
                {editTarget ? "Save Changes" : "Create Article"}
              </Button>
            </Flex>
          </Flex>

          {/* Dialog body — three panes */}
          <Flex style={isSmallMobile ? { ...mobileContentStyle, overflow: "hidden" } : { flex: 1, overflow: "hidden" }}>
            {/* Left: metadata */}
            <Box
              style={{
                width: 260,
                flexShrink: 0,
                borderRight: "1px solid var(--gray-a4)",
                background: "var(--gray-a1)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ScrollArea style={{ flex: 1 }}>
                <Flex direction="column" gap="4" p="4">
                  <Text size="1" weight="bold" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Article Metadata
                  </Text>

                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold">Title *</Text>
                    <TextField.Root
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Article title"
                    />
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold">Subtitle</Text>
                    <TextField.Root
                      value={form.subtitle ?? ""}
                      onChange={(e) => setField("subtitle", e.target.value)}
                      placeholder="Short description (optional)"
                    />
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold">Target Role</Text>
                    <Select.Root
                      value={form.targetRole}
                      onValueChange={(v) => setField("targetRole", v as TargetRole)}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="Admin">Admin only</Select.Item>
                        <Select.Item value="Cashier">Cashier only</Select.Item>
                        <Select.Item value="Both">Both roles</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold">Display Order</Text>
                    <TextField.Root
                      type="number"
                      value={String(form.displayOrder)}
                      onChange={(e) => setField("displayOrder", Math.max(1, Number(e.target.value) || 1))}
                    />
                    <Text size="1" color="gray">Lower numbers appear first in the sidebar.</Text>
                  </Flex>

                  <Box
                    p="3"
                    style={{
                      background: form.isPublished ? "var(--green-a2)" : "var(--gray-a2)",
                      borderRadius: 10,
                      border: `1px solid ${form.isPublished ? "var(--green-a5)" : "var(--gray-a4)"}`,
                      transition: "all 200ms ease",
                    }}
                  >
                    <Flex align="center" justify="between" mb="1">
                      <Text size="2" weight="bold">Published</Text>
                      <Switch
                        checked={form.isPublished}
                        onCheckedChange={(v) => setField("isPublished", v)}
                        color="green"
                      />
                    </Flex>
                    <Text size="1" color="gray">
                      {form.isPublished ? "Visible to users in the documentation reader." : "Draft — not visible to users yet."}
                    </Text>
                  </Box>

                  <Box
                    p="3"
                    style={{
                      background: "var(--indigo-a2)",
                      borderRadius: 10,
                      border: "1px solid var(--indigo-a4)",
                    }}
                  >
                    <Text size="1" color="gray">
                      <strong>Tips:</strong> Use the toolbar buttons in the editor to insert common HTML elements. The preview pane updates live as you type.
                    </Text>
                  </Box>
                </Flex>
              </ScrollArea>
            </Box>

            {/* Center: HTML editor */}
            <Flex direction="column" style={{ flex: 1, overflow: "hidden", borderRight: "1px solid var(--gray-a4)" }}>
              {/* Toolbar */}
              <Flex
                wrap="wrap"
                gap="1"
                p="2"
                style={{
                  borderBottom: "1px solid var(--gray-a4)",
                  background: "var(--gray-a2)",
                  flexShrink: 0,
                }}
              >
                {HTML_TOOLBAR.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    title={t.title}
                    onClick={() => insertHtml(t.action)}
                    style={{
                      padding: "3px 9px",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "monospace",
                      border: "1px solid var(--gray-a5)",
                      borderRadius: 6,
                      background: "var(--color-panel-solid)",
                      cursor: "pointer",
                      color: "var(--gray-12)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </Flex>

              {/* Editor label */}
              <Flex px="3" py="1" style={{ borderBottom: "1px solid var(--gray-a4)", background: "var(--gray-a1)", flexShrink: 0 }}>
                <Text size="1" color="gray" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  HTML Editor
                </Text>
              </Flex>

              {/* Textarea */}
              <Box style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <TextArea
                  ref={textareaRef}
                  value={form.contentHtml}
                  onChange={(e) => setField("contentHtml", e.target.value)}
                  placeholder={`<h1>Article Title</h1>\n<p>Start writing your documentation here...</p>`}
                  style={{
                    flex: 1,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    resize: "none",
                    border: "none",
                    borderRadius: 0,
                    outline: "none",
                    height: "100%",
                    padding: "16px",
                    background: "var(--color-panel-solid)",
                  }}
                />
              </Box>
            </Flex>

            {/* Right: live preview */}
            <Flex direction="column" style={{ flex: 1, overflow: "hidden" }}>
              <Flex
                align="center"
                gap="2"
                px="3"
                py="2"
                style={{
                  borderBottom: "1px solid var(--gray-a4)",
                  background: "var(--gray-a2)",
                  flexShrink: 0,
                }}
              >
                <Box
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-9)", animation: "pulse 2s infinite" }}
                />
                <Text size="1" color="gray" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Live Preview
                </Text>
              </Flex>

              <ScrollArea style={{ flex: 1 }}>
                <Box p="5">
                  {/* Preview header */}
                  {form.title && (
                    <Box
                      mb="4"
                      p="4"
                      style={{
                        borderRadius: 12,
                        background: "linear-gradient(135deg, var(--indigo-a3) 0%, var(--accent-a1) 100%)",
                        border: "1px solid var(--indigo-a4)",
                      }}
                    >
                      <Heading size="5" mb="1">{form.title}</Heading>
                      {form.subtitle && <Text size="2" color="gray">{form.subtitle}</Text>}
                    </Box>
                  )}
                  {previewHtml ? (
                    <div
                      className="doc-content"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <Text color="gray" size="2">
                      Start typing HTML in the editor to see a live preview here.
                    </Text>
                  )}
                </Box>
              </ScrollArea>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete confirm */}
      <AlertDialog.Root open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialog.Content style={isSmallMobile ? mobileDialogStyle : undefined}>
          <Flex direction="column" style={{ height: "100%" }}>
            <Box style={isSmallMobile ? mobileHeaderStyle : undefined}>
              <AlertDialog.Title>Delete Article</AlertDialog.Title>
              <AlertDialog.Description>
                Delete <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>? Users will no longer see this article in the documentation reader.
              </AlertDialog.Description>
            </Box>
            <Flex gap="3" mt="4" justify="end" style={isSmallMobile ? mobileFooterStyle : undefined}>
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button color="red" onClick={handleDelete} loading={deleteLoading}>Delete</Button>
              </AlertDialog.Action>
            </Flex>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
};
