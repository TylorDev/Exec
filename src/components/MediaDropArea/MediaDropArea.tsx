"use client";

import { Clipboard, ImagePlus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import styles from "./MediaDropArea.module.scss";

interface MediaDropAreaProps {
  kind?: "mockup" | "overlay";
}

const isImage = (file: File) => file.type.startsWith("image/");

export function MediaDropArea({ kind = "mockup" }: MediaDropAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setMockupImage = useEditorStore((state) => state.setMockupImage);
  const setOverlay = useEditorStore((state) => state.setOverlay);
  const imageName = useEditorStore((state) => (kind === "mockup" ? state.mockup.imageName : state.frame.overlayUrl ? "Overlay loaded" : null));

  const acceptFile = (file: File) => {
    if (!isImage(file)) return;
    const url = URL.createObjectURL(file);
    if (kind === "overlay") {
      setOverlay(url);
      return;
    }
    setMockupImage(url, file.name || "Pasted screenshot");
  };

  useEffect(() => {
    if (kind !== "mockup") return;

    const handlePaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find(isImage);
      if (file) acceptFile(file);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  return (
    <div
      className={`${styles.dropArea} ${isDragging ? styles.dragging : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = Array.from(event.dataTransfer.files).find(isImage);
        if (file) acceptFile(file);
      }}
      role="button"
      tabIndex={0}
    >
      <input
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) acceptFile(file);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <ImagePlus />
      <strong>{imageName ?? (kind === "overlay" ? "Select overlay" : "Drop image or screenshot")}</strong>
      <span>
        <Upload /> Click or drag
        {kind === "mockup" ? (
          <>
            <Clipboard /> Paste
          </>
        ) : null}
      </span>
    </div>
  );
}
