"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CameraState, MockupMode, ShadowLevel } from "@/types/editor";
import styles from "./ThreeMockupPreview.module.scss";

interface ThreeMockupPreviewProps {
  camera: CameraState;
  borderRadius?: number;
  className?: string;
  imageName?: string | null;
  imageUrl?: string | null;
  mode?: MockupMode;
  shadow?: ShadowLevel;
  variant?: "scene" | "card";
}

const shadowOpacity: Record<ShadowLevel, number> = {
  none: 0,
  soft: 0.18,
  medium: 0.28,
  strong: 0.42,
};

function createPlaceholderTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");

  if (context) {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#252a38");
    gradient.addColorStop(0.55, "#11131b");
    gradient.addColorStop(1, "#314238");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.lineWidth = 3;
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
    context.fillStyle = "rgba(244,247,251,0.72)";
    context.font = "600 42px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText("Upload a screenshot", canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function cameraDistanceForZoom(zoom: number) {
  return 4.5 / Math.max(0.45, zoom);
}

export function ThreeMockupPreview({
  camera,
  borderRadius = 28,
  className = "",
  imageName,
  imageUrl,
  mode = "screenshot",
  shadow = "medium",
  variant = "scene",
}: ThreeMockupPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const perspectiveCamera = new THREE.PerspectiveCamera(camera.perspective, 1, 0.1, 100);
    const group = new THREE.Group();
    scene.add(group);

    const planeWidth = variant === "card" ? 2.45 : 3.25;
    const planeHeight = planeWidth * 0.62;
    const framePad = mode === "browser" ? 0.16 : 0.1;

    const shadowGeometry = new THREE.PlaneGeometry(planeWidth + framePad * 1.8, planeHeight + framePad * 1.8);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: shadowOpacity[shadow],
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowPlane.position.set(0.18, -0.2, -0.05);
    group.add(shadowPlane);

    const frameGeometry = new THREE.BoxGeometry(planeWidth + framePad, planeHeight + framePad, 0.045);
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: 0x11131b,
      transparent: true,
      opacity: 0.88,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frame);

    const imageGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const placeholderTexture = createPlaceholderTexture();
    const imageMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: placeholderTexture,
      toneMapped: false,
    });
    const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
    imagePlane.position.z = 0.04;
    group.add(imagePlane);

    let browserBar: THREE.Mesh | null = null;
    if (mode === "browser") {
      const barGeometry = new THREE.BoxGeometry(planeWidth + framePad, 0.17, 0.055);
      const barMaterial = new THREE.MeshBasicMaterial({ color: 0x0b0d13 });
      browserBar = new THREE.Mesh(barGeometry, barMaterial);
      browserBar.position.set(0, planeHeight / 2 + 0.095, 0.08);
      group.add(browserBar);
    }

    let disposedTexture: THREE.Texture | null = null;
    if (imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        imageUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          imageMaterial.map?.dispose();
          imageMaterial.map = texture;
          imageMaterial.needsUpdate = true;
          disposedTexture = texture;
          renderer.render(scene, perspectiveCamera);
        },
        undefined,
        () => {
          renderer.render(scene, perspectiveCamera);
        },
      );
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      perspectiveCamera.aspect = width / height;
      perspectiveCamera.fov = camera.perspective;
      perspectiveCamera.position.set(0, 0, cameraDistanceForZoom(camera.zoom));
      perspectiveCamera.updateProjectionMatrix();
      group.position.set(camera.x / 32, -camera.y / 32, 0);
      group.rotation.set(
        THREE.MathUtils.degToRad(camera.rotationX),
        THREE.MathUtils.degToRad(camera.rotationY),
        THREE.MathUtils.degToRad(camera.rotationZ),
      );
      renderer.render(scene, perspectiveCamera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    return () => {
      resizeObserver.disconnect();
      container.removeChild(renderer.domElement);
      imageGeometry.dispose();
      frameGeometry.dispose();
      shadowGeometry.dispose();
      placeholderTexture.dispose();
      disposedTexture?.dispose();
      imageMaterial.dispose();
      frameMaterial.dispose();
      shadowMaterial.dispose();
      browserBar?.geometry.dispose();
      if (Array.isArray(browserBar?.material)) {
        browserBar.material.forEach((material) => material.dispose());
      } else {
        browserBar?.material.dispose();
      }
      renderer.dispose();
    };
  }, [borderRadius, camera, imageName, imageUrl, mode, shadow, variant]);

  return <div aria-label={imageName ?? "3D mockup preview"} className={`${styles.preview} ${styles[variant]} ${className}`} ref={containerRef} />;
}
