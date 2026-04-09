import { removeBackground as imglyRemoveBackground, Config } from "@imgly/background-removal";

export interface RemovalProgress {
  stage: "loading" | "processing" | "refining" | "done";
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: RemovalProgress) => void;

/**
 * Detect if the current device is a mobile device.
 * Used to determine the best backend (CPU vs GPU).
 */
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Preprocess image: Rezise to a maximum dimension for stability on mobile devices.
 * AI models work optimally at around 1024px. This prevents Out-Of-Memory (OOM) errors.
 */
async function preprocessImage(imageSource: string | File | Blob, maxDim = 1024): Promise<Blob | File | string> {
  if (typeof window === "undefined") return imageSource;

  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      // If image is already within safe limits, return original
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
      const ctx = canvas.getContext("2d", { alpha: true });

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
      }

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
 * High-Stability Background Removal
 * 
 * Strategy:
 * 1. Downscale: Resize images to 1024px to prevent OOM on mobile browsers.
 * 2. Mobile Detection: Force 'cpu' (WASM) on mobile to avoid WebGL artifacts & precision errors.
 * 3. Desktop: Use 'gpu' (WebGL/WebGPU) for maximum speed.
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: "loading",
    progress: 5,
    message: "Mengoptimalkan gambar...",
  });

  const mobile = isMobile();
  // Downscale to 1024px for reliable processing
  const processedSource = await preprocessImage(imageSource, 1024);

  onProgress?.({
    stage: "loading",
    progress: 15,
    message: mobile ? "Memulai proses (Safe Mode)..." : "Menyiapkan GPU...",
  });

  try {
    const config: Config = {
      model: "isnet_fp16",
      // Force CPU on mobile to prevent WebGL artifacts/black images
      device: mobile ? "cpu" : "gpu",
      proxyToWorker: true,
      output: {
        format: "image/png",
        quality: 0.8,
      },
      progress: (key: string, current: number, total: number) => {
        const pct = total > 0 ? Math.round((current / total) * 70) + 20 : 20;

        let message = "Memproses...";
        if (key.includes("fetch") || key.includes("model") || key.includes("download")) {
          message = "Mengunduh data AI...";
        } else if (key.includes("inference") || key.includes("compute")) {
          message = "Menghapus latar belakang...";
        }

        onProgress?.({
          stage: "processing",
          progress: Math.min(pct, 98),
          message,
        });
      },
    };

    const resultBlob = await imglyRemoveBackground(processedSource, config);

    onProgress?.({
      stage: "done",
      progress: 100,
      message: "Selesai!",
    });

    return URL.createObjectURL(resultBlob);
  } catch (error) {
    console.error("Background removal error:", error);

    // Final fallback to CPU if anything fails
    if (error instanceof Error && !mobile) {
      onProgress?.({
        stage: "processing",
        progress: 20,
        message: "Mencoba mode kompatibilitas...",
      });

      const resultBlob = await imglyRemoveBackground(processedSource, {
        model: "isnet_fp16",
        device: "cpu",
        output: { format: "image/png" }
      });
      return URL.createObjectURL(resultBlob);
    }
    throw error;
  }
}
