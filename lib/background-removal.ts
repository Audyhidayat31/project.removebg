import { removeBackground as imglyRemoveBackground, Config } from "@imgly/background-removal";

export interface RemovalProgress {
  stage: "loading" | "processing" | "refining" | "done";
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: RemovalProgress) => void;

/**
 * Preprocess image: Rezise to a maximum dimension for significantly faster processing.
 * AI inference speed is quadratically related to image resolution.
 * 1024px is a sweet spot for high quality and high speed.
 */
async function preprocessImage(imageSource: string | File | Blob, maxDim = 1024): Promise<Blob | File | string> {
  if (typeof window === "undefined") return imageSource;

  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      // If image is already within limits, return original (as Blob/File)
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
      const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

      if (ctx) {
        // High quality scaling
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
 * Optimized Background Removal
 * 
 * Performance Enhancements:
 * 1. Pre-resize: Reduces the number of pixels the AI needs to process.
 * 2. Model: uses 'isnet_fp16' (Half-precision) which is ~2x faster than standard 'isnet'.
 * 3. Acceleration: Forced 'gpu' (WebGPU/WebGL) for maximum throughput.
 * 4. Multi-threading/SIMD: Handled by WASM SIMD and WebGPU backends.
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

  // Pre-process: Resize to 1024px (High quality) or 800px (Faster)
  // We use 1024 as default for a good balance.
  const processedSource = await preprocessImage(imageSource, 1024);

  onProgress?.({
    stage: "loading",
    progress: 15,
    message: "Menyiapkan mesin AI (GPU Accelerating)...",
  });

  try {
    const config: Config = {
      model: "isnet_fp16", // Faster half-precision model
      device: "gpu",       // Re-enable WebGL/WebGPU for speed
      proxyToWorker: true, // Use multi-threading via worker
      output: {
        format: "image/png",
        quality: 0.8,
      },
      progress: (key: string, current: number, total: number) => {
        const pct = total > 0 ? Math.round((current / total) * 70) + 20 : 20;

        let message = "Memproses...";
        if (key.includes("fetch") || key.includes("model") || key.includes("download")) {
          message = "Mengunduh model AI (Cached)...";
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

    // Fallback to CPU if GPU fails (e.g. driver issues)
    if (error instanceof Error && (error.message.includes("gpu") || error.message.includes("webgl"))) {
      onProgress?.({
        stage: "processing",
        progress: 20,
        message: "Sedang mencoba mode kompatibilitas...",
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
