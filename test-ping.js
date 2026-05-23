async function ping() {
  console.log("Fetching POST sync...");
  try {
    const uRes = await fetch("https://shinerva.id/api/auth/sync", { 
      method: "POST",
      headers: { 'Authorization': 'Bearer fake-token-123' },
      signal: AbortSignal.timeout(5000)
    });
    console.log("Sync POST:", uRes.status, await uRes.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}
ping().catch(console.error);
