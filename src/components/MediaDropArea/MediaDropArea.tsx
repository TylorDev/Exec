"use client";

import { Clipboard, ImagePlus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import styles from "./MediaDropArea.module.scss";

interface MediaDropAreaProps {
  kind?: "mockup" | "overlay" | "background";
}

const isImage = (file: File) => file.type.startsWith("image/");

export function MediaDropArea({ kind = "mockup" }: MediaDropAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setMockupImage = useEditorStore((state) => state.setMockupImage);
  const setOverlay = useEditorStore((state) => state.setOverlay);
  const addBackgroundImages = useEditorStore((state) => state.addBackgroundImages);
  const imageName = useEditorStore((state) => {
    if (kind === "mockup") return state.mockup.imageName;
    if (kind === "background") return state.frame.backgroundImageName ?? (state.frame.backgroundImageUrl ? "Background loaded" : null);
    return state.frame.overlayUrl ? "Overlay loaded" : null;
  });

  const acceptFile = (file: File) => {
    if (!isImage(file)) return;
    if (kind === "background") {
      addBackgroundImages([file]);
      return;
    }
    const url = URL.createObjectURL(file);
    if (kind === "overlay") {
      setOverlay(url);
      return;
    }
    setMockupImage(url, file.name || "Pasted screenshot");
  };

  useEffect(() => {
    if (kind === "overlay") return;

    const handlePaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find(isImage);
      if (file) acceptFile(file);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  const emptyLabel = kind === "overlay" ? "Select overlay" : kind === "background" ? "Drop background image" : "Drop image or screenshot";

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
      <strong>{imageName ?? emptyLabel}</strong>
      <span>
        <Upload /> Click or drag
        {kind !== "overlay" ? (
          <>
            <Clipboard /> Paste
          </>
        ) : null}
      </span>
    </div>
  );
}
