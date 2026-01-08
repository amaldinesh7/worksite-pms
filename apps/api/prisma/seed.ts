import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (order matters due to foreign keys)
  console.log('🧹 Cleaning up existing data...');
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.party.deleteMany();
  await prisma.categoryItem.deleteMany();
  await prisma.categoryType.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleanup complete');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Construction Company',
    },
  });
  console.log(`✅ Created organization: ${org.name}`);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      phone: '+1234567890',
    },
  });
  console.log(`✅ Created user: ${user.name}`);

  // Create organization member
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'ADMIN',
    },
  });
  console.log('✅ Added user to organization');

  // Create category types
  const projectType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'project_type',
      label: 'Project Type',
    },
  });

  const expenseCategory = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'expense_category',
      label: 'Expense Category',
    },
  });

  const materialType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'material_type',
      label: 'Material Type',
    },
  });

  const labourType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'labour_type',
      label: 'Labour Type',
    },
  });

  const subWorkType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'sub_work_type',
      label: 'Sub Work Type',
    },
  });
  console.log('✅ Created category types');

  // Create category items - Project Types
  const residentialType = await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Residential',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Commercial',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Industrial',
    },
  });

  // Create category items - Expense Categories
  const materialsExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseCategory.id,
      name: 'Materials',
    },
  });
  const labourExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseCategory.id,
      name: 'Labour',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseCategory.id,
      name: 'Equipment',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseCategory.id,
      name: 'Transportation',
    },
  });

  // Create category items - Material Types
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Cement',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Steel',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Sand',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Bricks',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Tiles',
    },
  });

  // Create category items - Labour Types
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Mason',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Carpenter',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Electrician',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Plumber',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Painter',
    },
  });

  // Create category items - Sub Work Types
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subWorkType.id,
      name: 'Foundation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subWorkType.id,
      name: 'Framing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subWorkType.id,
      name: 'Roofing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subWorkType.id,
      name: 'Flooring',
    },
  });
  console.log('✅ Created category items');

  // Create parties
  const vendor1 = await prisma.party.create({
    data: {
      organizationId: org.id,
      name: 'ABC Building Materials',
      phone: '+1987654321',
      type: 'VENDOR',
    },
  });
  const vendor2 = await prisma.party.create({
    data: {
      organizationId: org.id,
      name: 'XYZ Steel Suppliers',
      phone: '+1654321987',
      type: 'VENDOR',
    },
  });
  const labour1 = await prisma.party.create({
    data: {
      organizationId: org.id,
      name: "John's Mason Team",
      phone: '+1321654987',
      type: 'LABOUR',
    },
  });
  const subcontractor1 = await prisma.party.create({
    data: {
      organizationId: org.id,
      name: 'Elite Electrical Services',
      phone: '+1789456123',
      type: 'SUBCONTRACTOR',
    },
  });
  console.log('✅ Created parties');

  // Create a demo project
  const project = await prisma.project.create({
    data: {
      organizationId: org.id,
      name: 'Sunrise Apartments',
      clientName: 'Sunrise Real Estate LLC',
      location: 'Downtown City',
      startDate: new Date(),
      projectTypeItemId: residentialType.id,
    },
  });
  console.log(`✅ Created project: ${project.name}`);

  // Create stages
  const foundationStage = await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Foundation',
      budgetAmount: 500000,
    },
  });
  const framingStage = await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Framing',
      budgetAmount: 350000,
    },
  });
  const finishingStage = await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Finishing',
      budgetAmount: 250000,
    },
  });
  console.log('✅ Created project stages');

  // Create some expenses
  await prisma.expense.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: vendor1.id,
      stageId: foundationStage.id,
      expenseCategoryItemId: materialsExpense.id,
      amount: 150000,
      expenseDate: new Date(),
      paymentMode: 'Bank Transfer',
      notes: 'Initial cement and concrete purchase',
    },
  });
  await prisma.expense.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: vendor2.id,
      stageId: foundationStage.id,
      expenseCategoryItemId: materialsExpense.id,
      amount: 200000,
      expenseDate: new Date(),
      paymentMode: 'Check',
      notes: 'Steel reinforcement bars',
    },
  });
  await prisma.expense.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: labour1.id,
      stageId: foundationStage.id,
      expenseCategoryItemId: labourExpense.id,
      amount: 75000,
      expenseDate: new Date(),
      paymentMode: 'Cash',
      notes: 'Foundation work labour',
    },
  });
  console.log('✅ Created sample expenses');

  // Create some payments
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: vendor1.id,
      amount: 100000,
      paymentDate: new Date(),
      notes: 'First payment for materials',
    },
  });
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: vendor2.id,
      amount: 150000,
      paymentDate: new Date(),
      notes: 'Partial payment for steel',
    },
  });
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      partyId: labour1.id,
      amount: 50000,
      paymentDate: new Date(),
      notes: 'Advance for labour',
    },
  });
  console.log('✅ Created sample payments');

  console.log('\n🎉 Seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   - Organization ID: ${org.id}`);
  console.log(`   - User ID: ${user.id}`);
  console.log(`   - Project ID: ${project.id}`);
  console.log('\n💡 Use these headers for API testing:');
  console.log(`   x-organization-id: ${org.id}`);
  console.log(`   x-user-id: ${user.id}`);
  console.log('   x-user-role: ADMIN');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
