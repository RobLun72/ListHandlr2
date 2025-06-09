export async function stableInit() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_MSW_MOCKING === "true"
  ) {
    await new Promise((r) => setTimeout(r, 800));
  }
}
