import React, { useState, KeyboardEvent } from "react";
import { Badge, Box, Flex, Text, TextField } from "@radix-ui/themes";
import { CloseRounded, AddRounded } from "@mui/icons-material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface TagsFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  suggestions?: string[];
  max?: number;
}

export const TagsField = <T extends FieldValues>({
  name,
  control,
  suggestions = [],
  max = 10,
}: TagsFieldProps<T>) => {
  const [draft, setDraft] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const tags: string[] = (field.value as unknown as string[]) ?? [];

        const addTag = (raw: string) => {
          const trimmed = raw.trim().slice(0, 50);
          if (!trimmed) return;
          if (tags.includes(trimmed)) return;
          if (tags.length >= max) return;
          field.onChange([...tags, trimmed]);
          setDraft("");
        };

        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag));
        };

        const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
            if (draft.trim()) {
              e.preventDefault();
              addTag(draft);
            }
          } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
            removeTag(tags[tags.length - 1]!);
          }
        };

        const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));

        return (
          <Box>
            <Box
              style={{
                border: "1px solid var(--gray-a6)",
                borderRadius: 8,
                padding: "8px 10px",
                background: "var(--color-background)",
                minHeight: 44,
              }}
            >
              <Flex gap="2" align="center" wrap="wrap">
                {tags.map((t) => (
                  <Badge key={t} color="orange" variant="soft" size="2" style={{ gap: 4 }}>
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      style={{
                        display: "inline-flex",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      aria-label={`Remove ${t}`}
                    >
                      <CloseRounded style={{ fontSize: 14 }} />
                    </button>
                  </Badge>
                ))}
                <TextField.Root
                  variant="soft"
                  size="1"
                  placeholder={tags.length >= max ? `Max ${max} tags` : "Add tag\u2026"}
                  value={draft}
                  disabled={tags.length >= max}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKey}
                  onBlur={() => {
                    if (draft.trim()) addTag(draft);
                  }}
                  style={{ flex: 1, minWidth: 120, background: "transparent" }}
                />
              </Flex>
            </Box>
            {fieldState.error && (
              <Text size="1" color="red" mt="1" as="div">
                {fieldState.error.message}
              </Text>
            )}

            {unusedSuggestions.length > 0 && tags.length < max && (
              <Box mt="2">
                <Text size="1" color="gray" as="div" mb="1">
                  Suggestions:
                </Text>
                <Flex gap="1" wrap="wrap">
                  {unusedSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTag(s)}
                      style={{
                        border: "1px dashed var(--gray-a6)",
                        background: "transparent",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--gray-11)",
                      }}
                    >
                      <AddRounded style={{ fontSize: 11 }} />
                      {s}
                    </button>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
};
