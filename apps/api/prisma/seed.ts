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
      name: 'Narendra Modi',
      phone: '+919745597425',
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

  // ============================================
  // Category Types (keys match frontend expectations)
  // ============================================

  const expenseType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'expense_type',
      label: 'Expense Types',
    },
  });

  const materialType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'material_type',
      label: 'Material Types',
    },
  });

  const labourType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'labour_type',
      label: 'Labour Types',
    },
  });

  const subworkType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'subwork_type',
      label: 'Subwork Types',
    },
  });

  const projectType = await prisma.categoryType.create({
    data: {
      organizationId: org.id,
      key: 'project_type',
      label: 'Project Types',
    },
  });

  console.log('✅ Created category types');

  // ============================================
  // Category Items - Expense Types
  // ============================================

  const labourExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Labor Cost',
    },
  });
  const materialsExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Material Purchase',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Equipment Rental',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Transportation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Utilities',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Permits & Licenses',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Insurance',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: expenseType.id,
      name: 'Subcontractor Fees',
    },
  });

  // ============================================
  // Category Items - Material Types
  // ============================================

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
      name: 'Steel Bars',
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
      name: 'Sand',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Gravel',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Timber',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Paint',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: materialType.id,
      name: 'Tiles',
    },
  });

  // ============================================
  // Category Items - Labour Types (matches reference design)
  // ============================================

  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'General Labourer',
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
      name: 'Mason',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Site Supervisor',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'Welder',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: labourType.id,
      name: 'HVAC Technician',
    },
  });

  // ============================================
  // Category Items - Subwork Types
  // ============================================

  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Excavation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Foundation Work',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Framing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Roofing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Plumbing Installation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Electrical Installation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Flooring',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: subworkType.id,
      name: 'Painting',
    },
  });

  // ============================================
  // Category Items - Project Types
  // ============================================

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
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Infrastructure',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Renovation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org.id,
      categoryTypeId: projectType.id,
      name: 'Mixed-Use',
    },
  });

  console.log('✅ Created category items');

  // ============================================
  // Parties
  // ============================================

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
  await prisma.party.create({
    data: {
      organizationId: org.id,
      name: 'Elite Electrical Services',
      phone: '+1789456123',
      type: 'SUBCONTRACTOR',
    },
  });
  console.log('✅ Created parties');

  // ============================================
  // Demo Project
  // ============================================

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

  // ============================================
  // Stages
  // ============================================

  const foundationStage = await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Foundation',
      budgetAmount: 500000,
    },
  });
  await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Framing',
      budgetAmount: 350000,
    },
  });
  await prisma.stage.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      name: 'Finishing',
      budgetAmount: 250000,
    },
  });
  console.log('✅ Created project stages');

  // ============================================
  // Expenses
  // ============================================

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

  // ============================================
  // Payments
  // ============================================

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
