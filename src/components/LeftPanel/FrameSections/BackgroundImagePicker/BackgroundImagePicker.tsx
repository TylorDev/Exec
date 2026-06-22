"use client";

import { FolderOpen, Images, Shuffle } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/Global/Button/Button";
import { useEditorStore } from "@/store/editorStore";
import styles from "./BackgroundImagePicker.module.scss";

const filesFromInput = (files: FileList | null) => Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

export function BackgroundImagePicker() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { backgroundImageUrl, backgroundImages } = useEditorStore((state) => state.frame);
  const addBackgroundImages = useEditorStore((state) => state.addBackgroundImages);
  const randomizeBackground = useEditorStore((state) => state.randomizeBackground);
  const selectBackgroundImage = useEditorStore((state) => state.selectBackgroundImage);

  const handleFiles = (files: FileList | null) => {
    const images = filesFromInput(files);
    if (images.length) addBackgroundImages(images);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.actions}>
        <Button icon={<Shuffle />} onClick={randomizeBackground} type="button" variant="primary">
          BG RANDOM
        </Button>
        <Button icon={<Images />} onClick={() => imageInputRef.current?.click()} type="button" variant="secondary">
          Add images
        </Button>
        <Button icon={<FolderOpen />} onClick={() => folderInputRef.current?.click()} type="button" variant="ghost">
          Add folder
        </Button>
      </div>
      <input
        accept="image/*"
        hidden
        multiple
        onChange={(event) => {
          handleFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
        ref={imageInputRef}
        type="file"
      />
      <input
        accept="image/*"
        hidden
        multiple
        onChange={(event) => {
          handleFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
        ref={folderInputRef}
        type="file"
        {...{ webkitdirectory: "" }}
      />
      {backgroundImages.length ? (
        <div className={styles.gallery} aria-label="Local background images">
          {backgroundImages.map((image) => (
            <button
              aria-label={`Use ${image.name}`}
              className={`${styles.thumb} ${backgroundImageUrl === image.url ? styles.active : ""}`}
              key={image.id}
              onClick={() => selectBackgroundImage(image.id)}
              type="button"
            >
              <img alt="" src={image.url} />
              <span>{image.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
