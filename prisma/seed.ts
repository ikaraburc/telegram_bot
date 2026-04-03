import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Turkish profanity and slang words...');

  // Yaygın Türkçe küfür ve argo kelimeler (küçük harfle)
  const profanityWords = [
    'amk',
    'amq',
    'aq',
    'mk',
    'orospu',
    'oç',
    'piç',
    'sik',
    'yarrak',
    'taşak',
    'göt',
    'amına',
    'sikerim',
    'sikeyim',
    'siktir',
    'pezevenk',
    'kahpe',
    'kaltak',
    'bok',
    'puşt',
    'ibne',
    'götlek',
    'dalyarak',
    'salak',
    'gerizekalı',
    'dangalak',
    'mal',
    'aptal',
    'yavşak',
    'döl',
  ];

  for (const word of profanityWords) {
    await prisma.banned_word.upsert({
      where: { word },
      update: {},
      create: { word },
    });
  }

  console.log(`✅ ${profanityWords.length} Turkish profanity/slang word seeded successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
