
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const devotionals = [
  {
    day: 1,
    title: 'Paz no Caos',
    verseRef: 'Filipenses 4:6-7',
    verseText:
      'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará o coração e a mente de vocês em Cristo Jesus.',
    contextLine: 'Entregar a ansiedade em oração traz paz verdadeira.',
    lengthSec: 600,
  },
  {
    day: 2,
    title: 'Força na Fraqueza',
    verseRef: '2 Coríntios 12:9',
    verseText:
      'Mas ele me disse: "Minha graça é suficiente para você, pois o meu poder se aperfeiçoa na fraqueza." Portanto, eu me gloriarei ainda mais alegremente em minhas fraquezas, para que o poder de Cristo repouse em mim.',
    contextLine: 'Quando reconhecemos nossa fraqueza, Deus mostra Sua força.',
    lengthSec: 600,
  },
  {
    day: 3,
    title: 'Confiança no Senhor',
    verseRef: 'Provérbios 3:5-6',
    verseText:
      'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.',
    contextLine: 'A confiança em Deus nos guia pelo caminho certo.',
    lengthSec: 600,
  },
  {
    day: 4,
    title: 'Renovação Diária',
    verseRef: 'Lamentações 3:22-23',
    verseText:
      'As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; renovam-se cada manhã. Grande é a tua fidelidade!',
    contextLine: 'Cada dia traz novas oportunidades de experimentar a fidelidade de Deus.',
    lengthSec: 600,
  },
  {
    day: 5,
    title: 'Esperança Viva',
    verseRef: 'Romanos 15:13',
    verseText:
      'Que o Deus da esperança os encha de toda alegria e paz, por sua confiança nele, para que vocês transbordem de esperança, pelo poder do Espírito Santo.',
    contextLine: 'A esperança em Deus transborda em alegria e paz.',
    lengthSec: 600,
  },
];

async function main() {
  console.log('🌱 Seeding devotionals...');

  for (const devo of devotionals) {
    await prisma.devo.upsert({
      where: { day: devo.day },
      update: devo,
      create: devo,
    });
  }

  console.log('✅ Devotionals seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding devotionals:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
