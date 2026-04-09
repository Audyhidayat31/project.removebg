import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

export interface RemovalProgress {
  stage: "loading" | "processing" | "refining" | "done";
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: RemovalProgress) => void;

/**
 * Detect if the current device is a mobile device.
 */
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Downscale image if it exceeds maximum dimensions to prevent OOM on mobile.
 */
async function resizeIfNeeded(imageSource: string | File | Blob, maxDim = 1024): Promise<Blob | string | File> {
  if (typeof window === "undefined") return imageSource;

  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      if (img.width <= maxDim && img.height <= maxDim) {
        if (typeof imageSource !== "string") URL.revokeObjectURL(url);
        resolve(imageSource);
        return;
      }

      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (typeof imageSource !== "string") URL.revokeObjectURL(url);
        resolve(blob || imageSource);
      }, "image/png");
    };

    img.onerror = () => {
      if (typeof imageSource !== "string") URL.revokeObjectURL(url);
      resolve(imageSource);
    };

    img.src = url;
  });
}

/**
 * Remove background from an image.
 * 
 * Improved Approach:
 * 1. Pre-processing: Downscale large images (especially on mobile) to prevent OOM.
 * 2. Mobile Detection: Force WASM/CPU backend on mobile to avoid WebGL precision issues.
 * 3. Client-side processing via @imgly/background-removal.
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: "loading",
    progress: 0,
    message: "Menyiapkan gambar...",
  });

  const mobile = isMobile();
  // Downscale to 1024px on mobile, or 2048px on desktop to be safe
  const maxDimension = mobile ? 1024 : 2048;
  const processedSource = await resizeIfNeeded(imageSource, maxDimension);

  onProgress?.({
    stage: "loading",
    progress: 10,
    message: "Memuat model AI...",
  });

  // Use the library with appropriate device backend
  const resultBlob = await imglyRemoveBackground(processedSource, {
    model: "isnet",
    // Force WASM on mobile to avoid WebGL artifacts/OOM
    device: mobile ? "cpu" : "gpu",
    output: {
      format: "image/png",
      quality: 0.8,
    },
    progress: (key: string, current: number, total: number) => {
      const pct = total > 0 ? Math.round((current / total) * 80) + 10 : 10;

      let message = "Memproses...";
      if (key.includes("fetch") || key.includes("model") || key.includes("download")) {
        message = "Mengunduh model AI...";
      } else if (key.includes("inference") || key.includes("compute")) {
        message = "Menghapus background...";
      }

      onProgress?.({
        stage: "processing",
        progress: Math.min(pct, 95),
        message,
      });
    },
  });

  onProgress?.({
    stage: "done",
    progress: 100,
    message: "Selesai!",
  });

  return URL.createObjectURL(resultBlob);
}
