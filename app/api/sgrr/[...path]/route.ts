import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8081"

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const targetPath = path.join("/")
  const search = req.nextUrl.search
  const target = `${BACKEND_URL}/api/${targetPath}${search}`

  const headers = new Headers()
  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  const accept = req.headers.get("accept")
  if (accept) headers.set("accept", accept)

  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  const body = hasBody ? await req.text() : undefined

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    })

    const text = await res.text()
    return new NextResponse(text || null, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    console.log("[v0] proxy error:", err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { message: `Não foi possível conectar ao backend em ${BACKEND_URL}. Verifique se ele está em execução.` },
      { status: 502 },
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
