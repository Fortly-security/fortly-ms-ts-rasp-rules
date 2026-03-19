const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://fortly-security.com",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

export class ResponseWriter {
  static success(body: Record<string, unknown>, statusCode = 200) {
    return {
      statusCode,
      headers: CORS_HEADERS,
      body: JSON.stringify(body),
    };
  }

  static created(body: Record<string, unknown>) {
    return ResponseWriter.success(body, 201);
  }

  static error(message: string, statusCode = 500) {
    return {
      statusCode,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: message }),
    };
  }

  static badRequest(message: string) {
    return ResponseWriter.error(message, 400);
  }

  static notFound(message: string) {
    return ResponseWriter.error(message, 404);
  }

  static unauthorized(message: string) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: message }),
    };
  }

  static forbidden(message: string) {
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: message }),
    };
  }
}
