import fs from 'fs';
import path from 'path';

let cache: string | null = null;

export function loadOrders(): string {
  if (cache !== null) return cache;
  const csvPath = path.join(process.cwd(), 'data', 'orders.csv');
  cache = fs.readFileSync(csvPath, 'utf-8');
  return cache;
}
