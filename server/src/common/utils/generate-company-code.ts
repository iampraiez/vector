/** Fleet company join code: matches dashboard "regenerate" format (VECT-####). */
export function generateCompanyCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `VECT-${digits}`;
}
