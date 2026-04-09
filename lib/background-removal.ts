import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

export interface RemovalProgress {
  stage: "loading" | "processing" | "refining" | "done";
  progress: number;
  message: string;
}

export type ProgressCallback = (progress: RemovalProgress) => void;

/**
 * Remove background from an image with high precision using client-side ML.
 * 
 * Pipeline:
 * 1. ML model inference via @imgly/background-removal (ISNet ONNX model)
 * 2. Edge refinement to eliminate halo artifacts
 * 3. Noise cleanup for stray semi-transparent pixels
 * 4. Output clean transparent PNG
 */
export async function removeBackground(
  imageSource: string | File | Blob,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: "loading",
    progress: 0,
    message: "Memuat model AI...",
  });

  // Use the full precision model for highest quality
  const resultBlob = await imglyRemoveBackground(imageSource, {
    model: "isnet",
    device: "gpu",
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: (key: string, current: number, total: number) => {
      const pct = total > 0 ? Math.round((current / total) * 70) + 10 : 10;
      
      let message = "Memproses...";
      if (key.includes("fetch") || key.includes("model") || key.includes("download")) {
        message = "Mengunduh model AI...";
      } else if (key.includes("inference") || key.includes("compute")) {
        message = "Memproses gambar dengan AI...";
      } else if (key.includes("mask") || key.includes("segment")) {
        message = "Mendeteksi objek foreground...";
      }

      onProgress?.({
        stage: "processing",
        progress: Math.min(pct, 80),
        message,
      });
    },
  });

  onProgress?.({
    stage: "refining",
    progress: 82,
    message: "Memperbaiki tepi dan menghilangkan halo...",
  });

  // Post-process: edge refinement + halo removal + noise cleanup
  const refinedDataUrl = await refineEdges(resultBlob);

  onProgress?.({
    stage: "done",
    progress: 100,
    message: "Selesai!",
  });

  return refinedDataUrl;
}

/**
 * Post-processing pipeline for edge refinement:
 * - Remove halo effects (semi-transparent fringe around objects)
 * - Clean up noise (stray pixels with very low alpha)
 * - Sharpen alpha channel edges for crisp cutouts
 */
async function refineEdges(imageBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        // Fallback: return raw blob as data URL
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Canvas not supported"));
        reader.readAsDataURL(imageBlob);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Pass 1: Remove noise — eliminate pixels with very low alpha (stray artifacts)
      const alphaThreshold = 20;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < alphaThreshold) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        }
      }

      // Pass 2: Halo removal — for edge pixels (semi-transparent), 
      // check if they border fully transparent pixels and clean them
      const alphaCopy = new Uint8ClampedArray(width * height);
      for (let i = 0; i < data.length; i += 4) {
        alphaCopy[i / 4] = data[i + 3];
      }

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          const alpha = data[idx + 3];

          // Only process semi-transparent edge pixels (halo zone)
          if (alpha > 0 && alpha < 220) {
            let transparentNeighbors = 0;
            let opaqueNeighbors = 0;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nIdx = (y + dy) * width + (x + dx);
                const nAlpha = alphaCopy[nIdx];
                if (nAlpha < 10) transparentNeighbors++;
                if (nAlpha > 240) opaqueNeighbors++;
              }
            }

            // Strong halo: bordering many transparent pixels
            if (transparentNeighbors >= 3 && opaqueNeighbors <= 2) {
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0;
            } else if (transparentNeighbors >= 2) {
              // Mild halo: reduce alpha and correct premultiplied color
              const newAlpha = Math.max(0, alpha - 40);
              if (newAlpha < 10) {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 0;
              } else {
                const ratio = alpha / newAlpha;
                data[idx] = Math.min(255, Math.round(data[idx] * ratio));
                data[idx + 1] = Math.min(255, Math.round(data[idx + 1] * ratio));
                data[idx + 2] = Math.min(255, Math.round(data[idx + 2] * ratio));
                data[idx + 3] = newAlpha;
              }
            }
          }
        }
      }

      // Pass 3: Alpha sharpening — push semi-transparent edge pixels towards
      // fully opaque or fully transparent for crisper edges
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0 && alpha < 255) {
          if (alpha > 180) { // Standard opaque threshold
            data[i + 3] = 255;
          } else if (alpha < 35) { // Slightly aggressive transparent threshold to catch noise
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0;
          } else {
            // Smoothstep sharpening curve
            const normalized = (alpha - 35) / (180 - 35);
            const sharpened = normalized * normalized * (3 - 2 * normalized);
            data[i + 3] = Math.round(sharpened * 255);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Clean up the object URL
      URL.revokeObjectURL(img.src);
      
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image for refinement"));
    };
    img.src = URL.createObjectURL(imageBlob);
  });
}
