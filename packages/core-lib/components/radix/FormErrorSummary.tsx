import React from "react";
import { Callout, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { FieldErrors } from "react-hook-form";

interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
  fieldLabels?: Record<string, string>;
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = "Please fix the following before submitting:",
  fieldLabels,
  className,
}) => {
  const messages = collectErrorMessages(errors, fieldLabels);

  if (messages.length === 0) return null;

  return (
    <Callout.Root
      color="red"
      variant="surface"
      className={className}
      data-testid="form-error-summary"
    >
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>
        <Text weight="medium" mb="1" as="div">
          {title}
        </Text>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {messages.map((m, i) => (
            <li key={`${m}-${i}`}>
              <Text size="2">{m}</Text>
            </li>
          ))}
        </ul>
      </Callout.Text>
    </Callout.Root>
  );
};

function collectErrorMessages(
  errors: FieldErrors,
  fieldLabels?: Record<string, string>,
): string[] {
  const out: string[] = [];
  for (const key of Object.keys(errors)) {
    const entry = errors[key];
    if (!entry) continue;
    const message = (entry as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      const label = fieldLabels?.[key];
      out.push(label ? `${label}: ${message}` : message);
    }
  }
  return out;
}
