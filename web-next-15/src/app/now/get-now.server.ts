export async function getNow(): Promise<{ timestamp: string }> {
  const res = await fetch(`${process.env.API_BASE_URL}/api/now`, {
    cache: 'force-cache',
    next: {
      tags: ['features'],
      revalidate: 10,
    },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch current time')
  }
  return res.json()
}
