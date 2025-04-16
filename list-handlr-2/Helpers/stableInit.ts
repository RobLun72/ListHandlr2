export async function stableInit() {
  if (process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true") {
    await new Promise((r) => setTimeout(r, 400));
  }
}
