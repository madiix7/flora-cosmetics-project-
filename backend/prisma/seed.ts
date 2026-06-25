import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding master catalog...')

  // Fragrance families
  const families = ['Woody', 'Floral', 'Oriental', 'Fresh', 'Fougere', 'Chypre', 'Citrus', 'Aquatic', 'Gourmand', 'Leather']
  for (const name of families) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    await prisma.fragranceFamily.upsert({
      where: { normalized },
      create: { name, normalized },
      update: {},
    })
  }
  console.log(`  ✓ ${families.length} fragrance families`)

  // Core accords
  const accords = ['Fresh', 'Spicy', 'Sweet', 'Woody', 'Musky', 'Citrus', 'Floral', 'Powdery', 'Aromatic', 'Amber']
  for (const name of accords) {
    const normalized = name.toLowerCase()
    await prisma.accord.upsert({
      where: { normalized },
      create: { name, normalized },
      update: {},
    })
  }
  console.log(`  ✓ ${accords.length} accords`)

  // Canonical notes
  const notes = [
    'Bergamot', 'Lemon', 'Orange', 'Grapefruit', 'Lime',
    'Lavender', 'Rose', 'Jasmine', 'Iris', 'Geranium',
    'Sandalwood', 'Cedar', 'Vetiver', 'Patchouli', 'Oakmoss',
    'Amber', 'Musk', 'Vanilla', 'Benzoin', 'Tonka Bean',
    'Pepper', 'Cardamom', 'Ginger', 'Cinnamon', 'Clove',
    'Ambroxan', 'Cashmeran', 'Iso E Super', 'Hedione',
  ]
  for (const name of notes) {
    const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    await prisma.note.upsert({
      where: { normalized },
      create: { name, normalized },
      update: {},
    })
  }
  console.log(`  ✓ ${notes.length} canonical notes`)

  // Note variants (e.g. Calabrian Bergamot → Bergamot)
  const bergamot = await prisma.note.findUnique({ where: { normalized: 'bergamot' } })
  if (bergamot) {
    const variants = ['Calabrian Bergamot', 'Bergamote', 'Green Bergamot']
    for (const v of variants) {
      const normalized = v.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      await prisma.note.upsert({
        where: { normalized },
        create: { name: v, normalized, canonicalId: bergamot.id },
        update: { canonicalId: bergamot.id },
      })
    }
    console.log(`  ✓ Bergamot variants seeded`)
  }

  // Seed brands with aliases
  const brands = [
    { name: 'Dior', aliases: ['Christian Dior', 'CD'] },
    { name: 'Chanel', aliases: ['CHANEL'] },
    { name: 'Yves Saint Laurent', aliases: ['YSL', 'Saint Laurent'] },
    { name: 'Giorgio Armani', aliases: ['Armani', 'Armani Beauty'] },
    { name: 'Creed', aliases: ['House of Creed'] },
    { name: 'Tom Ford', aliases: ['Tom Ford Beauty'] },
    { name: 'Xerjoff', aliases: [] },
    { name: 'Maison Margiela', aliases: ['Replica', 'MM'] },
  ]

  for (const b of brands) {
    const normalized = b.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '')
    const slug = b.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const brand = await prisma.brand.upsert({
      where: { normalized },
      create: { name: b.name, slug, normalized },
      update: {},
    })

    for (const alias of b.aliases) {
      const aliasNorm = alias.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '')
      await prisma.brandAlias.upsert({
        where: { normalized: aliasNorm },
        create: { brandId: brand.id, alias, normalized: aliasNorm },
        update: {},
      })
    }
  }
  console.log(`  ✓ ${brands.length} brands with aliases`)

  console.log('\nSeed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
