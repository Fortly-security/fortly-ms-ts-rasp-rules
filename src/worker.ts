import { index } from "./app";

interface Env {
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const body = request.method !== "GET" ? await request.text() : null;
      const event = {
        httpMethod: request.method,
        path: url.pathname,
        headers: Object.fromEntries(request.headers.entries()),
        queryStringParameters: Object.fromEntries(url.searchParams.entries()),
        body,
        pathParameters: {},
      };
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const result: any = await index(event as any, env);
      return new Response(String(result.body || ""), {
        status: Number(result.statusCode) || 200,
        headers: result.headers || {},
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
