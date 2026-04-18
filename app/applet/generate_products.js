import fs from 'fs';
import path from 'path';

const csvPath = path.join('/app/applet/byefrust_ai', 'products.csv');
const tsPath = path.join('/app/applet/src/data', 'products.ts');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const products = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  
  const product = {};
  for (let j = 0; j < headers.length; j++) {
    let val = values[j] ? values[j].trim() : '';
    if (val !== '' && !isNaN(val) && headers[j] !== 'gtin' && headers[j] !== 'product_id') {
      val = Number(val);
    }
    product[headers[j]] = val;
  }
  
  // Map fields to match the expected interface in the app
  product.id = product.product_id;
  product.price = product.price_inr;
  
  products.push(product);
}

const tsContent = `export interface Product {
  product_id?: string;
  id?: string;
  product_name: string;
  brand?: string;
  gtin?: string;
  price_inr?: number;
  price?: number;
  category: 'laptop' | 'smartphone' | 'Laptop' | 'Smartphone';
  performance_score: number;
  battery_score: number;
  display_score: number;
  portability_score: number;
  durability_score: number;
  longevity_score: number;
  style_tag: string;
  use_case_tags: string;
  verification_status?: string;
  specs_text: string;
  software_update_years?: number;
  security_update_years?: number;
  repairability_score?: number;
  
  // Laptop specific
  cpu?: string;
  ram_gb?: number;
  storage_gb?: number;
  gpu?: string;
  gpu_vram_gb?: number;
  dedicated_gpu?: 'Yes' | 'No';
  battery_wh?: number;
  display_inches?: number;
  display_resolution?: string;
  weight_kg?: number;
  ports?: string;
  upgradability_score?: number;
  thermal_score?: number;
  keyboard_score?: number;
  
  // Smartphone specific
  chipset?: string;
  battery_mah?: number;
  display_refresh_hz?: number;
  weight_g?: number;
  water_resistance?: string;
  five_g?: 'Yes' | 'No';
  nfc?: 'Yes' | 'No';
  os?: 'Android' | 'iOS';
  camera_main_mp?: number;
  camera_score?: number;
  video_score?: number;
  selfie_score?: number;
  lowlight_score?: number;
  haptics_score?: number;
  biometric_score?: number;
  
  min_ram?: number;
  min_storage?: number;
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(tsPath, tsContent);
console.log('Successfully generated products.ts');
