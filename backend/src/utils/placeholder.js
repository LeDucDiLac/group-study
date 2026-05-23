export function placeholder(data = {}) {
  return {
    placeholder: true,
    timestamp: new Date().toISOString(),
    ...data,
  }
}
