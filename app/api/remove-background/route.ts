import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json(
        { error: "Tidak ada gambar yang dikirim" },
        { status: 400 }
      )
    }

    // Check if REMOVE_BG_API_KEY is set
    const apiKey = process.env.REMOVE_BG_API_KEY

    if (!apiKey) {
      // If no API key, use a fallback demo mode
      // In production, you would require the API key
      console.log("[v0] No REMOVE_BG_API_KEY found, using demo mode")
      
      // For demo purposes, return the original image
      // In production, you should require the API key
      const buffer = await image.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const mimeType = image.type || "image/png"
      
      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${base64}`,
        demo: true,
        message: "Demo mode - set REMOVE_BG_API_KEY untuk hasil sebenarnya"
      })
    }

    // Use remove.bg API
    const removeFormData = new FormData()
    removeFormData.append("image_file", image)
    removeFormData.append("size", "auto")

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Remove.bg API error:", errorData)
      
      if (response.status === 402) {
        return NextResponse.json(
          { error: "Kredit API habis. Silakan isi ulang kredit remove.bg Anda." },
          { status: 402 }
        )
      }
      
      return NextResponse.json(
        { error: "Gagal memproses gambar. Silakan coba lagi." },
        { status: response.status }
      )
    }

    const resultBuffer = await response.arrayBuffer()
    const base64Result = Buffer.from(resultBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64Result}`,
    })
  } catch (error) {
    console.error("[v0] Error processing image:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses gambar" },
      { status: 500 }
    )
  }
}
