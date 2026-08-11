const CHAT_URL =
  "https://dochive-backend.onrender.com/api/v1/chat/stream";

export async function streamChat({
  documentIds,
  query,
  onChunk,
  signal,
}) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      engine: "DOCHIVE",
      documentIds,
      query,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Chat request failed: ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = buffer.split("\n\n");

    buffer = events.pop() || "";

    for (const event of events) {
      const lines = event.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }

        const data = line
          .slice(5)
          .trim();

        if (data) {
          onChunk(data);
        }
      }
    }
  }
}