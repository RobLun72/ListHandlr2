const IS_BROWSER = typeof window !== "undefined";

export const setupMocks = async () => {
  if (IS_BROWSER) {
    const { worker } = await import("./browser");
    console.log("Starting MSW worker...");
    await worker.start({
      onUnhandledRequest(_req, print) {
        if (process.env.NEXT_PUBLIC_MSW_WARN === "true") {
          print.warning();
        }
        return;
      },
    });
  }
};
