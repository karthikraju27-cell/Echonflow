/** Input must be ordered newest first, with a stable tie-breaker. */
export function latestPerEmployee<T extends { seeker_id: string }>(responses: T[]): T[] {
  const seen = new Set<string>();
  return responses.filter((response) => {
    if (seen.has(response.seeker_id)) return false;
    seen.add(response.seeker_id);
    return true;
  });
}
