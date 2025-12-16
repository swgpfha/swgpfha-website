// scripts/fixSlugs.ts
// If your editor still complains, install Node types:  npm i -D @types/node

import { prisma } from "../src/prisma.js";

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

async function main() {
  const rows = await prisma.contentBlock.findMany();
  for (const row of rows) {
    const fixed = normalizeSlug(row.slug);
    if (fixed !== row.slug) {
      console.log(`Fixing slug id=${row.id}: "${row.slug}" -> "${fixed}"`);
      await prisma.contentBlock.update({
        where: { id: row.id },
        data: { slug: fixed },
      });
    }
  }
  console.log("Slug normalization complete.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
