import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const body = await req.json();

  try {
    const response = await fetch(`${backendUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(await response.text(), {
        status: response.status,
      });
    }

    // Proxy the stream back to the client
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error communicating with backend:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to backend" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
