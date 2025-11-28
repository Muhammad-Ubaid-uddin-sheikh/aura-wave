export const slugifyInput = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-")         // collapse whitespace and replace with dash
    .replace(/-+/g, "-");         // collapse multiple dashes