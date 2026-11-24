import sharp from "sharp";

const input = "public/brand/twinco-wines-logo.png";
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let opaque = 0;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r > 236 && g > 236 && b > 236) data[i + 3] = 0;
  else opaque += 1;
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile("public/brand/twinco-header-logo.png");
console.log(JSON.stringify({ width: info.width, height: info.height, opaque }));
