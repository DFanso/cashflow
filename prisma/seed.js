const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create default account
  const defaultAccount = await prisma.account.create({
    data: {
      name: 'Main Account',
      type: 'CASH',
      balance: 0,
    },
  })

  console.log('Created default account:', defaultAccount)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 