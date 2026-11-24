export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function formatSize(sizeMl: number) {
  if (sizeMl % 1000 === 0) {
    return `${sizeMl / 1000} L`;
  }
  if (sizeMl >= 1000) {
    const litres = sizeMl / 1000;
    return `${litres} L`;
  }
  return `${sizeMl} ml`;
}

export function formatSizeList(sizes: number[]) {
  return sizes.map((size) => formatSize(size)).join(" and ");
}

export function stockPhrase(stock: number) {
  if (stock <= 0) return "Unavailable";
  return `In stock · preview qty ${stock}`;
}
