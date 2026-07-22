import runQueueWorker from "./queue-worker.js";

export const config = {
  schedule: "*/5 * * * *",
};

export default async (request) => {
  const netlifyEvent = request.headers.get("x-netlify-event") || "";
  if (netlifyEvent !== "schedule") {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secret = process.env.WORKER_SECRET || "";
  const workerRequest = new Request("https://internal/.netlify/functions/queue-worker", {
    method: "POST",
    headers: {
      "x-worker-secret": secret,
    },
  });
  return runQueueWorker(workerRequest);
};
