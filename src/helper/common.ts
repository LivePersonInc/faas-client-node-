export async function sleep(ms = 350): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
