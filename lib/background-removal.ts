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
 * High-Stability Background Removal logic.
 *
 * Changes:
 * 1. Forced backend to 'cpu' (WASM) for consistent results across all devices.
 * 2. Removed manual image preprocessing/resizing to provide pure output.
 * 3. Simplified configuration and removed custom post-processing.
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: "loading",
    progress: 10,
    message: "Menyiapkan AI (Stable Mode)...",
  });

  try {
    const config: Config = {
      model: "isnet_fp16", // High quality model
      device: "cpu",      // Force WASM/CPU for 100% consistency and stability
      proxyToWorker: true,
      output: {
        format: "image/png",
        // Removed quality setting to keep output pure
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

    // Use original imageSource directly for pure AI output
    const resultBlob = await imglyRemoveBackground(imageSource, config);

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

