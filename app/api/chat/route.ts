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
      const errorText = await response.text();
      console.error("Backend response error:", response.status, errorText);
      return new Response(errorText, {
        status: response.status,
      });
    }

    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();
    let buffer = "";
    const messageId = `msg_${Date.now()}`;
    let messageStarted = false;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += textDecoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          if (!messageStarted && trimmed.startsWith('0:')) {
            const startEvent = { type: "text-start", id: messageId };
            controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(startEvent)}\n\n`));
            messageStarted = true;
          }

          if (trimmed.startsWith('0:')) {
            try {
              const content = JSON.parse(trimmed.slice(2));
              const deltaEvent = { type: "text-delta", id: messageId, delta: content };
              controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(deltaEvent)}\n\n`));
            } catch (e) {
              console.error("Parse fail", trimmed);
            }
          } else if (trimmed.startsWith('d:')) {
             if (messageStarted) {
               const endEvent = { type: "text-end", id: messageId };
               controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(endEvent)}\n\n`));
               messageStarted = false; // Prevent double end
             }
          }
        }
      },
      flush(controller) {
        if (buffer && buffer.startsWith('0:')) {
          try {
             if (!messageStarted) {
                controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ type: "text-start", id: messageId })}\n\n`));
             }
             const content = JSON.parse(buffer.slice(2));
             controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: messageId, delta: content })}\n\n`));
             messageStarted = true;
          } catch(e) {}
        }
        if (messageStarted) {
          controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ type: "text-end", id: messageId })}\n\n`));
        }
      }
    });

    const streamBody = response.body?.pipeThrough(transformStream) || null;

    // Proxy the translated stream back to the client as Server-Sent Events
    return new Response(streamBody, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
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
