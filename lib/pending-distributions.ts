export interface PendingDistribution {
  id: string;
  title: string;
  mode: "disperse" | "airdrop";
}

/**
 * TODO: replace this stub with a real call to GET /api/recipients/pending
 * once the backend exists. Until then it always returns an empty array, so
 * the landing page's pending distributions banner never shows.
 */
export async function getPendingDistributions(address: string): Promise<PendingDistribution[]> {
  void address;
  return [];
}
