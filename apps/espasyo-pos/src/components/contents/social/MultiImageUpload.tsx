import React, { useRef } from "react";
import {
  Flex,
  IconButton,
  Text,
} from "core-lib/components/radix/proxies";
import {
  AnimatePresence,
  motion } from "framer-motion"; import { Box,
} from "@radix-ui/themes";;
import { Cross2Icon, ImageIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableImageProps {
  id: string;
  src: string;
  onRemove: () => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ id, src, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      transition={{ duration: 0.18 }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        aspectRatio: "1",
        borderRadius: "var(--radius-3)",
        overflow: "hidden",
        border: "1px solid var(--gray-a5)",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        background: "var(--gray-a3)",
      }}
      {...attributes}
      {...listeners}
    >
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        draggable={false}
      />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(0,0,0,0.65)",
          border: "none",
          borderRadius: "50%",
          width: 22,
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          padding: 0,
        }}
      >
        <Cross2Icon width={12} height={12} />
      </button>
    </motion.div>
  );
};

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export const MultiImageUpload: React.FC<Props> = ({
  files,
  onChange,
  maxFiles = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = files.map((f, i) => ({ id: `${i}-${f.name}`, file: f, src: URL.createObjectURL(f) }));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = previews.findIndex((p) => p.id === active.id);
      const newIdx = previews.findIndex((p) => p.id === over.id);
      onChange(arrayMove(files, oldIdx, newIdx));
    }
  };

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const remaining = maxFiles - files.length;
    onChange([...files, ...selected.slice(0, remaining)]);
    e.target.value = "";
  };

  const handleRemove = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  const canAdd = files.length < maxFiles;

  return (
    <Box>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={previews.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 6,
            }}
          >
            <AnimatePresence>
              {previews.map((p, idx) => (
                <SortableImage
                  key={p.id}
                  id={p.id}
                  src={p.src}
                  onRemove={() => handleRemove(idx)}
                />
              ))}
            </AnimatePresence>

            {canAdd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  aspectRatio: "1",
                  borderRadius: "var(--radius-3)",
                  border: "2px dashed var(--gray-a6)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: 4,
                  background: "var(--gray-a2)",
                  transition: "border-color 150ms ease, background 150ms ease",
                }}
                whileHover={{ background: "var(--accent-a2)", borderColor: "var(--accent-a7)" } as any}
                onClick={() => inputRef.current?.click()}
              >
                <PlusIcon width={20} height={20} color="var(--gray-9)" />
                <Text size="1" color="gray">Add</Text>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {files.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed var(--gray-a6)",
            borderRadius: "var(--radius-3)",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            background: "var(--gray-a2)",
            transition: "border-color 150ms ease, background 150ms ease",
          }}
          whileHover={{ background: "var(--accent-a2)", borderColor: "var(--accent-a7)" } as any}
        >
          <ImageIcon width={28} height={28} color="var(--gray-8)" />
          <Text size="2" color="gray" align="center">
            Click to add photos
          </Text>
          <Text size="1" color="gray" align="center">
            JPEG, PNG, WebP · max 5 MB each · up to {maxFiles} photos
          </Text>
        </motion.div>
      )}

      {files.length > 0 && (
        <Flex align="center" justify="between" mt="2">
          <Text size="1" color="gray">
            {files.length} / {maxFiles} photos · drag to reorder
          </Text>
          {canAdd && (
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent-11)",
                fontSize: "var(--font-size-1)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              <PlusIcon /> Add more
            </button>
          )}
        </Flex>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleAdd}
      />
    </Box>
  );
};
