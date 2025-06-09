import { StrictRequest, DefaultBodyType, HttpResponse } from "msw";

export const handleServerAction = async (
  request: StrictRequest<DefaultBodyType>
) => {
  const url = new URL(request.url);
  const bodyContent = await request.json();
  if (url && url.href) {
    console.log(
      "mocked serverAction called with message:",
      (bodyContent as string[])[0],
      "pathname:",
      url.pathname
    );
  }

  const response = `0:{"a":"$@1","f":"","b":"development"}\r\n1:{"message":"mocked serverAction resolved with message:${
    (bodyContent as string[])[0]
  } from: ${url.pathname}"}\r\n`;

  return HttpResponse.text(response, {
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      Connection: "keep-alive",
      "Content-Encoding": "gzip",
      "Content-Type": "text/x-component",
      Date: new Date().toUTCString(),
      "Keep-Alive": "timeout=5",
      "Transfer-Encoding": "chunked",
      Vary: "Accept-Encoding",
      "X-Action-Revalidated": "[],0,0",
      "X-Current-Path": url.pathname,
      "X-Powered-By": "Next.js",
    },
  });
};
