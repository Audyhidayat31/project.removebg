import { removeBackground as imglyRemoveBackground, Config } from "@imgly/background-removal";

/**
 * Background Removal Service using @imgly/background-removal
 */

export interface RemovalProgress {
  stage: "loading" | "processing" | "refining" | "done";
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: RemovalProgress) => void;


/**
 * Preprocess image: Resizes the image to a maximum dimension using Canvas API.
 * This drastically reduces the computation load for the AI model on WASM/CPU.
 */
async function preprocessImage(imageSource: string | File | Blob, maxDim = 800): Promise<Blob | File | string> {
  if (typeof window === "undefined") return imageSource;

  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource);

    img.onload = () => {
      // If image is already smaller than maxDim, return original to avoid unnecessary processing
      if (img.width <= maxDim && img.height <= maxDim) {
        if (typeof imageSource !== "string") URL.revokeObjectURL(url);
        resolve(imageSource);
        return;
      }

      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
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
        ctx.imageSmoothingQuality = "medium"; // Balanced between speed and quality
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
 * Strategy:
 * 1. Downscale: Resize images to 800px to speed up inference on CPU.
 * 2. Backend: Use 'cpu' (WASM) for 100% stability.
 * 3. Model: Use 'isnet_quint8' (Quantized) for maximum performance on WASM.
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: "loading",
    progress: 5,
    message: "Mengoptimalkan ukuran gambar...",
  });

  // Step 1: Resize image to 800px for drastic speed improvement
  const processedSource = await preprocessImage(imageSource, 800);

  onProgress?.({
    stage: "loading",
    progress: 15,
    message: "Menyiapkan AI (Turbo Mode)...",
  });

  try {
    const config: Config = {
      model: "isnet_quint8", // Fastest quantized model for WASM/CPU
      device: "cpu",        // Maintain stability
      proxyToWorker: true,
      output: {
        format: "image/png",
      },
      progress: (key: string, current: number, total: number) => {
        const pct = total > 0 ? Math.round((current / total) * 70) + 20 : 20;

        let message = "Memproses...";
        if (key.includes("fetch") || key.includes("model") || key.includes("download")) {
          message = "Mengunduh modul AI...";
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
    throw error;
  }
}


