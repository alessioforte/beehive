import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, method, headers, body: requestBody } = body;

    if (!url || !method) {
      return NextResponse.json(
        { error: "URL and method are required" },
        { status: 400 },
      );
    }

    const startTime = performance.now();

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        ...headers,
      },
    };

    if (
      requestBody &&
      ["POST", "PUT", "PATCH"].includes(method.toUpperCase())
    ) {
      fetchOptions.body = requestBody;
    }

    const response = await fetch(url, fetchOptions);

    const endTime = performance.now();
    const timing = Math.round(endTime - startTime);

    let responseBody: string;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const jsonData = await response.json();
      responseBody = JSON.stringify(jsonData, null, 2);
    } else {
      responseBody = await response.text();
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      timing,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: JSON.stringify({ error: errorMessage }, null, 2),
        timing: 0,
      },
      { status: 200 },
    );
  }
}
