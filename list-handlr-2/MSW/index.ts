const IS_BROWSER = typeof window !== "undefined";

export const setupMocks = async () => {
  if (IS_BROWSER) {
    const { worker } = await import("./browser");
    console.log("Starting MSW worker...");
    worker.start();
  }
};
