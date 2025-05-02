const IS_BROWSER = typeof window !== "undefined";

export const setupMocks = async () => {
  if (IS_BROWSER) {
    const { worker } = await import("./browser");
    console.log("Starting MSW worker...");
    worker.start({
      onUnhandledRequest(_req, print) {
        console.log(
          "process.env.NEXT_PUBLIC_MSW_WARN",
          process.env.NEXT_PUBLIC_MSW_WARN
        );
        if (process.env.NEXT_PUBLIC_MSW_WARN === "true") {
          print.warning();
        }
        return;
      },
    });
  }
};
