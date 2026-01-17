import { PrismaClient, type User, type Party, type OrganizationMember } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random date within last year
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (order matters due to foreign keys)
  console.log('🧹 Cleaning up existing data...');
  await prisma.projectAccess.deleteMany();
  await prisma.entityAttachment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.document.deleteMany();
  await prisma.project.deleteMany();
  await prisma.party.deleteMany();
  await prisma.categoryItem.deleteMany();
  await prisma.categoryType.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log('✅ Cleanup complete');

  // ============================================
  // Create 2 Demo Organizations
  // ============================================

  const org1 = await prisma.organization.create({
    data: {
      name: 'Premier Construction Group',
    },
  });
  console.log(`✅ Created organization: ${org1.name}`);

  const org2 = await prisma.organization.create({
    data: {
      name: 'Elite Builders & Developers',
    },
  });
  console.log(`✅ Created organization: ${org2.name}`);

  // ============================================
  // Create Admin Users for Both Organizations
  // ============================================

  const admin1 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      phone: '+919876543210',
      email: 'admin@premier.com',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      phone: '+919876543211',
      email: 'admin@elite.com',
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org1.id,
      userId: admin1.id,
      role: 'ADMIN',
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org2.id,
      userId: admin2.id,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin users for both organizations');

  // ============================================
  // Category Types & Items (for org1)
  // ============================================

  const expenseType = await prisma.categoryType.create({
    data: {
      organizationId: org1.id,
      key: 'expense_type',
      label: 'Expense Types',
    },
  });

  const materialType = await prisma.categoryType.create({
    data: {
      organizationId: org1.id,
      key: 'material_type',
      label: 'Material Types',
    },
  });

  const labourType = await prisma.categoryType.create({
    data: {
      organizationId: org1.id,
      key: 'labour_type',
      label: 'Labour Types',
    },
  });

  const subworkType = await prisma.categoryType.create({
    data: {
      organizationId: org1.id,
      key: 'subwork_type',
      label: 'Subwork Types',
    },
  });

  const projectType = await prisma.categoryType.create({
    data: {
      organizationId: org1.id,
      key: 'project_type',
      label: 'Project Types',
    },
  });

  // Expense Category Items
  const labourExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Labor Cost',
    },
  });
  const materialsExpense = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Material Purchase',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Equipment Rental',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Transportation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Utilities',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Permits & Licenses',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Insurance',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: expenseType.id,
      name: 'Subcontractor Fees',
    },
  });

  // Material Types
  const cementMaterial = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Cement',
    },
  });
  const steelMaterial = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Steel Bars',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Bricks',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Sand',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Gravel',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Timber',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Paint',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: materialType.id,
      name: 'Tiles',
    },
  });

  // Labour Types
  const generalLabour = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'General Labourer',
    },
  });
  const carpenterLabour = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Carpenter',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Electrician',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Plumber',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Mason',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Site Supervisor',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'Welder',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: labourType.id,
      name: 'HVAC Technician',
    },
  });

  // Subwork Types
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Excavation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Foundation Work',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Framing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Roofing',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Plumbing Installation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Electrical Installation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Flooring',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: subworkType.id,
      name: 'Painting',
    },
  });

  // Project Types
  const residentialType = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Residential',
    },
  });
  const commercialType = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Commercial',
    },
  });
  const industrialType = await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Industrial',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Infrastructure',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Renovation',
    },
  });
  await prisma.categoryItem.create({
    data: {
      organizationId: org1.id,
      categoryTypeId: projectType.id,
      name: 'Mixed-Use',
    },
  });

  console.log('✅ Created category types and items');

  // ============================================
  // Create 10 Vendors
  // ============================================

  const vendors = [
    {
      name: 'ABC Building Materials',
      phone: '+919876540001',
      location: 'Industrial Area, Block A, Sector 12',
    },
    {
      name: 'XYZ Steel Suppliers',
      phone: '+919876540002',
      location: 'Steel Market, Zone 3, Main Road',
    },
    {
      name: 'Premium Cement Distributors',
      phone: '+919876540003',
      location: 'Warehouse Complex, Plot 45',
    },
    {
      name: 'Modern Hardware Store',
      phone: '+919876540004',
      location: 'Commercial Street, Shop 23',
    },
    { name: 'Elite Paint & Chemicals', phone: '+919876540005', location: 'Retail Park, Unit 7' },
    { name: 'Quality Timber Works', phone: '+919876540006', location: 'Timber Yard, Sector 8' },
    { name: 'Stone & Marble Suppliers', phone: '+919876540007', location: 'Stone Market, Block B' },
    {
      name: 'Electrical Components Co.',
      phone: '+919876540008',
      location: 'Electronics Hub, Floor 2',
    },
    {
      name: 'Plumbing Solutions Ltd',
      phone: '+919876540009',
      location: 'Plumbing Market, Shop 15',
    },
    {
      name: 'Roofing Materials Depot',
      phone: '+919876540010',
      location: 'Construction Zone, Unit 12',
    },
  ];

  const vendorParties = [];
  for (const vendor of vendors) {
    const party = await prisma.party.create({
      data: {
        organizationId: org1.id,
        name: vendor.name,
        phone: vendor.phone,
        location: vendor.location,
        type: 'VENDOR',
        isInternal: false,
      },
    });
    vendorParties.push(party);
  }
  console.log(`✅ Created ${vendorParties.length} vendors`);

  // ============================================
  // Create 10 Subcontractors
  // ============================================

  const subcontractors = [
    {
      name: 'Elite Electrical Services',
      phone: '+919876541001',
      location: 'Tech Park, Office 301',
    },
    {
      name: 'Professional Plumbing Works',
      phone: '+919876541002',
      location: 'Service Center, Unit 5',
    },
    {
      name: 'Master Carpentry Solutions',
      phone: '+919876541003',
      location: 'Workshop Area, Shed 12',
    },
    {
      name: 'Expert Masonry Contractors',
      phone: '+919876541004',
      location: 'Construction Site Office, Block C',
    },
    {
      name: 'Advanced HVAC Systems',
      phone: '+919876541005',
      location: 'Industrial Estate, Building 8',
    },
    {
      name: 'Precision Welding Services',
      phone: '+919876541006',
      location: 'Metal Works Zone, Unit 9',
    },
    {
      name: 'Quality Flooring Experts',
      phone: '+919876541007',
      location: 'Showroom Complex, Floor 1',
    },
    {
      name: 'Professional Painting Co.',
      phone: '+919876541008',
      location: 'Artisan Quarter, Shop 22',
    },
    {
      name: 'Roofing Specialists Inc.',
      phone: '+919876541009',
      location: 'Construction Hub, Office 15',
    },
    {
      name: 'Landscaping & Exterior Works',
      phone: '+919876541010',
      location: 'Green Zone, Plot 33',
    },
  ];

  const subcontractorParties = [];
  for (const sub of subcontractors) {
    const party = await prisma.party.create({
      data: {
        organizationId: org1.id,
        name: sub.name,
        phone: sub.phone,
        location: sub.location,
        type: 'SUBCONTRACTOR',
        isInternal: false,
      },
    });
    subcontractorParties.push(party);
  }
  console.log(`✅ Created ${subcontractorParties.length} subcontractors`);

  // ============================================
  // Create 10 Labors
  // ============================================

  const labors = [
    { name: "Ramesh's Mason Team", phone: '+919876542001', location: 'Labor Camp A, Barrack 3' },
    { name: "Kumar's Carpentry Crew", phone: '+919876542002', location: 'Labor Camp B, Barrack 7' },
    {
      name: "Suresh's Electrical Team",
      phone: '+919876542003',
      location: 'Labor Camp A, Barrack 5',
    },
    { name: "Vijay's Plumbing Squad", phone: '+919876542004', location: 'Labor Camp C, Barrack 2' },
    {
      name: "Rajesh's General Laborers",
      phone: '+919876542005',
      location: 'Labor Camp B, Barrack 4',
    },
    { name: "Mohan's Welding Team", phone: '+919876542006', location: 'Labor Camp A, Barrack 8' },
    { name: "Anil's Painting Crew", phone: '+919876542007', location: 'Labor Camp C, Barrack 6' },
    { name: "Sunil's Flooring Team", phone: '+919876542008', location: 'Labor Camp B, Barrack 9' },
    {
      name: "Deepak's Roofing Squad",
      phone: '+919876542009',
      location: 'Labor Camp A, Barrack 11',
    },
    { name: "Amit's HVAC Team", phone: '+919876542010', location: 'Labor Camp C, Barrack 10' },
  ];

  const laborParties = [];
  for (const labor of labors) {
    const party = await prisma.party.create({
      data: {
        organizationId: org1.id,
        name: labor.name,
        phone: labor.phone,
        location: labor.location,
        type: 'LABOUR',
        isInternal: false,
      },
    });
    laborParties.push(party);
  }
  console.log(`✅ Created ${laborParties.length} labor parties`);

  // ============================================
  // Create 10 Team Members (Internal Parties)
  // ============================================

  const teamMembers = [
    {
      name: 'Amit Kumar',
      phone: '+919876543001',
      email: 'amit@premier.com',
      role: 'PROJECT_MANAGER',
      orgRole: 'MANAGER',
      location: 'Head Office, Floor 2',
    },
    {
      name: 'Priya Patel',
      phone: '+919876543002',
      email: 'priya@premier.com',
      role: 'PROJECT_MANAGER',
      orgRole: 'MANAGER',
      location: 'Head Office, Floor 2',
    },
    {
      name: 'Rajesh Singh',
      phone: '+919876543003',
      email: 'rajesh.accountant@premier.com',
      role: 'ACCOUNTANT',
      orgRole: 'ACCOUNTANT',
      location: 'Finance Department, Floor 1',
    },
    {
      name: 'Sunita Verma',
      phone: '+919876543004',
      email: 'sunita.accountant@premier.com',
      role: 'ACCOUNTANT',
      orgRole: 'ACCOUNTANT',
      location: 'Finance Department, Floor 1',
    },
    {
      name: 'Vikram Sharma',
      phone: '+919876543005',
      email: 'vikram@premier.com',
      role: 'SUPERVISOR',
      orgRole: 'SUPERVISOR',
      location: 'Site Office, Project Site A',
    },
    {
      name: 'Anjali Reddy',
      phone: '+919876543006',
      email: 'anjali@premier.com',
      role: 'SUPERVISOR',
      orgRole: 'SUPERVISOR',
      location: 'Site Office, Project Site B',
    },
    {
      name: 'Rahul Mehta',
      phone: '+919876543007',
      email: 'rahul@premier.com',
      role: 'SUPERVISOR',
      orgRole: 'SUPERVISOR',
      location: 'Site Office, Project Site C',
    },
    {
      name: 'Neha Gupta',
      phone: '+919876543008',
      email: 'neha@premier.com',
      role: 'PROJECT_MANAGER',
      orgRole: 'MANAGER',
      location: 'Head Office, Floor 3',
    },
    {
      name: 'Suresh Nair',
      phone: '+919876543009',
      email: 'suresh@premier.com',
      role: 'SUPERVISOR',
      orgRole: 'SUPERVISOR',
      location: 'Site Office, Project Site D',
    },
    {
      name: 'Kavita Desai',
      phone: '+919876543010',
      email: 'kavita@premier.com',
      role: 'PROJECT_MANAGER',
      orgRole: 'MANAGER',
      location: 'Head Office, Floor 3',
    },
  ];

  const teamMemberParties: Party[] = [];
  const teamMemberUsers: User[] = [];
  const teamMemberMemberships: OrganizationMember[] = [];

  for (const member of teamMembers) {
    const user = await prisma.user.create({
      data: {
        name: member.name,
        phone: member.phone,
        email: member.email,
      },
    });

    const party = await prisma.party.create({
      data: {
        organizationId: org1.id,
        name: member.name,
        phone: member.phone,
        location: member.location,
        type: member.role as any,
        isInternal: true,
        userId: user.id,
      },
    });

    const orgMember = await prisma.organizationMember.create({
      data: {
        organizationId: org1.id,
        userId: user.id,
        role: member.orgRole as any,
      },
    });

    teamMemberParties.push(party);
    teamMemberUsers.push(user);
    teamMemberMemberships.push(orgMember);
  }
  console.log(`✅ Created ${teamMemberParties.length} team members`);

  // ============================================
  // Create 6 Projects with Clients
  // ============================================

  const projectData = [
    {
      name: 'Sunrise Luxury Apartments',
      clientName: 'Sunrise Real Estate LLC',
      clientPhone: '+919876550001',
      clientEmail: 'contact@sunrise.com',
      clientLocation: 'Downtown Business Center, Tower A',
      location: 'Downtown City, Plot 123',
      startDate: new Date('2024-01-15'),
      amount: 5000000,
      projectType: residentialType,
    },
    {
      name: 'Tech Park Commercial Complex',
      clientName: 'TechCorp Industries',
      clientPhone: '+919876550002',
      clientEmail: 'projects@techcorp.com',
      clientLocation: 'Business District, Office Tower 5',
      location: 'Tech Zone, Sector 7',
      startDate: new Date('2024-02-01'),
      amount: 8500000,
      projectType: commercialType,
    },
    {
      name: 'Green Valley Residential Colony',
      clientName: 'Green Valley Developers',
      clientPhone: '+919876550003',
      clientEmail: 'info@greenvalley.com',
      clientLocation: 'Developer Hub, Building 12',
      location: 'Suburban Area, Phase 2',
      startDate: new Date('2024-03-10'),
      amount: 12000000,
      projectType: residentialType,
    },
    {
      name: 'Manufacturing Plant Expansion',
      clientName: 'Industrial Solutions Ltd',
      clientPhone: '+919876550004',
      clientEmail: 'operations@industrialsolutions.com',
      clientLocation: 'Industrial Estate, Unit 45',
      location: 'Industrial Zone, Plot 89',
      startDate: new Date('2024-04-05'),
      amount: 15000000,
      projectType: industrialType,
    },
    {
      name: 'Shopping Mall Renovation',
      clientName: 'Retail Ventures Inc',
      clientPhone: '+919876550005',
      clientEmail: 'renovation@retailventures.com',
      clientLocation: 'Mall Management Office, Floor 3',
      location: 'City Center, Mall Complex',
      startDate: new Date('2024-05-20'),
      amount: 3200000,
      projectType: commercialType,
    },
    {
      name: 'Highway Bridge Construction',
      clientName: 'Infrastructure Authority',
      clientPhone: '+919876550006',
      clientEmail: 'projects@infraauth.gov',
      clientLocation: 'Government Complex, Block 2',
      location: 'Highway 45, KM 12',
      startDate: new Date('2024-06-01'),
      amount: 25000000,
      projectType: residentialType, // Using residential as fallback
    },
  ];

  const projects = [];
  const clients = [];

  for (const proj of projectData) {
    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        name: proj.clientName,
        phone: proj.clientPhone,
        email: proj.clientEmail,
      },
    });

    // Create client party
    const clientParty = await prisma.party.create({
      data: {
        organizationId: org1.id,
        name: proj.clientName,
        phone: proj.clientPhone,
        location: proj.clientLocation,
        type: 'CLIENT',
        isInternal: false,
        userId: clientUser.id,
      },
    });

    // Create organization member for client
    const clientMember = await prisma.organizationMember.create({
      data: {
        organizationId: org1.id,
        userId: clientUser.id,
        role: 'CLIENT',
      },
    });

    // Create project
    const project = await prisma.project.create({
      data: {
        organizationId: org1.id,
        name: proj.name,
        clientId: clientParty.id,
        location: proj.location,
        startDate: proj.startDate,
        amount: proj.amount,
        projectTypeItemId: proj.projectType.id,
      },
    });

    // Grant project access to client
    await prisma.projectAccess.create({
      data: {
        memberId: clientMember.id,
        projectId: project.id,
      },
    });

    projects.push(project);
    clients.push({ party: clientParty, member: clientMember });
  }
  console.log(`✅ Created ${projects.length} projects with clients`);

  // ============================================
  // Create Stages for Projects
  // ============================================

  const stageNames = [
    'Foundation',
    'Framing',
    'Plumbing & Electrical',
    'Finishing',
    'Final Inspection',
  ];
  const stageBudgets = [0.25, 0.2, 0.25, 0.2, 0.1]; // Percentage of project amount

  for (const project of projects) {
    const projectAmount = Number(project.amount || 0);
    for (let i = 0; i < stageNames.length; i++) {
      await prisma.stage.create({
        data: {
          organizationId: org1.id,
          projectId: project.id,
          name: stageNames[i],
          budgetAmount: projectAmount * stageBudgets[i],
        },
      });
    }
  }
  console.log(`✅ Created stages for all projects`);

  // ============================================
  // Create Expenses for Projects
  // ============================================

  const stages = await prisma.stage.findMany({
    where: { organizationId: org1.id },
    include: { project: true },
  });

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const projectStages = stages.filter((s) => s.projectId === project.id);

    // Create 5-8 expenses per project
    const numExpenses = 5 + Math.floor(Math.random() * 4);
    for (let j = 0; j < numExpenses; j++) {
      const stage = projectStages[Math.floor(Math.random() * projectStages.length)];
      const isMaterial = Math.random() > 0.5;
      const party = isMaterial
        ? vendorParties[Math.floor(Math.random() * vendorParties.length)]
        : Math.random() > 0.5
          ? laborParties[Math.floor(Math.random() * laborParties.length)]
          : subcontractorParties[Math.floor(Math.random() * subcontractorParties.length)];

      await prisma.expense.create({
        data: {
          organizationId: org1.id,
          projectId: project.id,
          partyId: party.id,
          stageId: stage.id,
          expenseCategoryItemId: isMaterial ? materialsExpense.id : labourExpense.id,
          materialTypeItemId: isMaterial ? cementMaterial.id : null,
          labourTypeItemId: !isMaterial ? generalLabour.id : null,
          rate: isMaterial ? 500 + Math.random() * 1000 : 600 + Math.random() * 400,
          quantity: isMaterial ? 50 + Math.random() * 200 : 10 + Math.random() * 50,
          expenseDate: randomDate(project.startDate, new Date()),
          notes: `${isMaterial ? 'Material purchase' : 'Labor cost'} for ${stage.name} stage`,
        },
      });
    }
  }
  console.log('✅ Created expenses for projects');

  // ============================================
  // Create Payments
  // ============================================

  const expenses = await prisma.expense.findMany({
    where: { organizationId: org1.id },
  });

  // Create payments for expenses (OUT)
  for (const expense of expenses.slice(0, Math.floor(expenses.length * 0.7))) {
    const paymentModes: Array<'CASH' | 'CHEQUE' | 'ONLINE'> = ['CASH', 'CHEQUE', 'ONLINE'];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

    await prisma.payment.create({
      data: {
        organizationId: org1.id,
        projectId: expense.projectId,
        partyId: expense.partyId,
        expenseId: expense.id,
        type: 'OUT',
        paymentMode,
        amount: Number(expense.rate) * Number(expense.quantity) * (0.5 + Math.random() * 0.5), // 50-100% of expense
        paymentDate: randomDate(expense.expenseDate, new Date()),
        notes: `Payment for ${paymentMode.toLowerCase()} transaction`,
      },
    });
  }

  // Create client payments (IN)
  for (const project of projects) {
    const client = clients.find((c) => c.party.id === project.clientId);
    if (client) {
      const numPayments = 2 + Math.floor(Math.random() * 3);
      const projectAmount = Number(project.amount || 0);
      for (let i = 0; i < numPayments; i++) {
        await prisma.payment.create({
          data: {
            organizationId: org1.id,
            projectId: project.id,
            partyId: client.party.id,
            type: 'IN',
            paymentMode: 'ONLINE',
            amount: projectAmount * (0.15 + Math.random() * 0.25), // 15-40% per payment
            paymentDate: randomDate(project.startDate, new Date()),
            notes: `Client payment installment ${i + 1}`,
          },
        });
      }
    }
  }
  console.log('✅ Created payments');

  // ============================================
  // Grant Project Access to Team Members
  // ============================================

  // Assign supervisors and managers to projects
  const supervisors = teamMemberMemberships.filter((m) => {
    const user = teamMemberUsers.find((u) => u.id === m.userId);
    return user && teamMembers.find((tm) => tm.email === user.email)?.orgRole === 'SUPERVISOR';
  });

  const managers = teamMemberMemberships.filter((m) => {
    const user = teamMemberUsers.find((u) => u.id === m.userId);
    return user && teamMembers.find((tm) => tm.email === user.email)?.orgRole === 'MANAGER';
  });

  // Assign supervisors to projects (2-3 per project)
  for (const project of projects) {
    const numSupervisors = 2 + Math.floor(Math.random() * 2);
    const selectedSupervisors = supervisors
      .sort(() => Math.random() - 0.5)
      .slice(0, numSupervisors);
    for (const supervisor of selectedSupervisors) {
      await prisma.projectAccess.create({
        data: {
          memberId: supervisor.id,
          projectId: project.id,
        },
      });
    }
  }

  // Managers have access to all projects (they're managers)
  for (const manager of managers) {
    for (const project of projects) {
      await prisma.projectAccess.create({
        data: {
          memberId: manager.id,
          projectId: project.id,
        },
      });
    }
  }
  console.log('✅ Granted project access to team members');

  // ============================================
  // Summary
  // ============================================

  console.log('\n🎉 Seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   - Organizations: 2`);
  console.log(`   - Vendors: ${vendorParties.length}`);
  console.log(`   - Subcontractors: ${subcontractorParties.length}`);
  console.log(`   - Labors: ${laborParties.length}`);
  console.log(`   - Team Members: ${teamMemberParties.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Clients: ${clients.length}`);
  console.log(`   - Expenses: ${expenses.length}`);
  console.log(
    `   - Payments: ${await prisma.payment.count({ where: { organizationId: org1.id } })}`
  );

  console.log('\n👤 Test Users (Organization 1):');
  console.log(`   Admin:      ${admin1.email} (role: ADMIN)`);
  console.log(
    `   Manager:    ${teamMembers.find((tm) => tm.orgRole === 'MANAGER')?.email} (role: MANAGER)`
  );
  console.log(
    `   Accountant: ${teamMembers.find((tm) => tm.orgRole === 'ACCOUNTANT')?.email} (role: ACCOUNTANT)`
  );
  console.log(
    `   Supervisor: ${teamMembers.find((tm) => tm.orgRole === 'SUPERVISOR')?.email} (role: SUPERVISOR)`
  );
  console.log(`   Client:     ${projectData[0].clientEmail} (role: CLIENT)`);

  console.log('\n💡 Use these headers for API testing (Org 1):');
  console.log(`   x-organization-id: ${org1.id}`);
  console.log(`   x-user-id: ${admin1.id}`);
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
