import {
  PrismaClient,
  type User,
  type Party,
  type OrganizationMember,
  type Role,
  type Project,
  type Stage,
  type Expense,
  type BOQItem,
  type BOQSection,
  type Task,
  type Organization,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Project Images (Unsplash)
// ============================================

const PROJECT_IMAGES = {
  residential: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80',
  ],
  infrastructure: [
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  ],
  construction: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
  ],
};

// ============================================
// Global Category Types
// ============================================

const GLOBAL_CATEGORY_TYPES = [
  { key: 'expense_type', label: 'Expense Types' },
  { key: 'material_type', label: 'Material Types' },
  { key: 'labour_type', label: 'Labour Types' },
  { key: 'sub_work_type', label: 'Sub Work Types' },
  { key: 'project_type', label: 'Project Types' },
];

const DEFAULT_CATEGORY_ITEMS = [
  // Expense Types (main categories)
  { typeKey: 'expense_type', name: 'Material', isEditable: false },
  { typeKey: 'expense_type', name: 'Labour', isEditable: false },
  { typeKey: 'expense_type', name: 'Sub Work', isEditable: false },
  
  // Material Types (sub-categories for Material expenses)
  { typeKey: 'material_type', name: 'Cement', isEditable: true },
  { typeKey: 'material_type', name: 'Steel & TMT Bars', isEditable: true },
  { typeKey: 'material_type', name: 'Sand & Aggregates', isEditable: true },
  { typeKey: 'material_type', name: 'Bricks & Blocks', isEditable: true },
  { typeKey: 'material_type', name: 'Tiles & Flooring', isEditable: true },
  { typeKey: 'material_type', name: 'Paint & Finishes', isEditable: true },
  { typeKey: 'material_type', name: 'Plumbing Materials', isEditable: true },
  { typeKey: 'material_type', name: 'Electrical Materials', isEditable: true },
  { typeKey: 'material_type', name: 'Wood & Timber', isEditable: true },
  { typeKey: 'material_type', name: 'Glass & Glazing', isEditable: true },
  { typeKey: 'material_type', name: 'Hardware & Fixtures', isEditable: true },
  { typeKey: 'material_type', name: 'Waterproofing Materials', isEditable: true },
  { typeKey: 'material_type', name: 'Ready Mix Concrete', isEditable: true },
  { typeKey: 'material_type', name: 'Sanitary Ware', isEditable: true },
  { typeKey: 'material_type', name: 'Doors & Windows', isEditable: true },
  
  // Labour Types (sub-categories for Labour expenses)
  { typeKey: 'labour_type', name: 'Mason Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Carpenter Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Helper/Coolie Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Bar Bending Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Shuttering Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Plastering Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Tile Laying Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Painting Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Excavation Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Concreting Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Welding Work', isEditable: true },
  { typeKey: 'labour_type', name: 'Scaffolding Work', isEditable: true },
  
  // Sub Work Types (sub-categories for Sub Work/Contractor expenses)
  { typeKey: 'sub_work_type', name: 'Electrical Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Plumbing Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'HVAC Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'False Ceiling Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Waterproofing Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Fire Safety Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Aluminium Fabrication', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Glass Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Lift Installation', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Landscaping Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Interior Work', isEditable: true },
  { typeKey: 'sub_work_type', name: 'Flooring Work', isEditable: true },
];

// ============================================
// Global Permissions
// ============================================

const GLOBAL_PERMISSIONS = [
  { key: 'projects.view', name: 'View Projects', category: 'Projects', description: 'View all projects' },
  { key: 'projects.create', name: 'Create Projects', category: 'Projects', description: 'Create new projects' },
  { key: 'projects.edit', name: 'Edit Projects', category: 'Projects', description: 'Edit existing projects' },
  { key: 'projects.delete', name: 'Delete Projects', category: 'Projects', description: 'Delete projects' },
  { key: 'expenses.view', name: 'View Expenses', category: 'Expenses', description: 'View all expenses' },
  { key: 'expenses.create', name: 'Create Expenses', category: 'Expenses', description: 'Create new expenses' },
  { key: 'expenses.approve', name: 'Approve Expenses', category: 'Expenses', description: 'Approve pending expenses' },
  { key: 'payments.view', name: 'View Payments', category: 'Payments', description: 'View all payments' },
  { key: 'payments.create', name: 'Create Payments', category: 'Payments', description: 'Create new payments' },
  { key: 'team.view', name: 'View Team', category: 'Team', description: 'View team members' },
  { key: 'team.manage', name: 'Manage Team', category: 'Team', description: 'Add, edit, or remove team members' },
  { key: 'roles.view', name: 'View Roles', category: 'Roles', description: 'View roles and permissions' },
  { key: 'roles.manage', name: 'Manage Roles', category: 'Roles', description: 'Create, edit, or delete roles' },
  { key: 'parties.view', name: 'View Parties', category: 'Parties', description: 'View vendors, labours, and subcontractors' },
  { key: 'parties.manage', name: 'Manage Parties', category: 'Parties', description: 'Add, edit, or remove parties' },
  { key: 'boq.view', name: 'View BOQ', category: 'BOQ', description: 'View bill of quantities' },
  { key: 'boq.manage', name: 'Manage BOQ', category: 'BOQ', description: 'Create, edit, or delete BOQ items' },
  { key: 'advances.view', name: 'View Advances', category: 'Advances', description: 'View member advances' },
  { key: 'advances.manage', name: 'Manage Advances', category: 'Advances', description: 'Create or settle advances' },
];

// ============================================
// Default Roles
// ============================================

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full access to all features and settings',
    isSystemRole: true,
    permissions: ['*'],
  },
  {
    name: 'Project Manager',
    description: 'Manage projects, expenses, and team assignments',
    isSystemRole: false,
    permissions: [
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
      'expenses.view', 'expenses.create', 'expenses.approve', 'payments.view', 'payments.create',
      'team.view', 'parties.view', 'parties.manage', 'boq.view', 'boq.manage',
      'advances.view', 'advances.manage',
    ],
  },
  {
    name: 'Accountant',
    description: 'Manage expenses, payments, and financial records',
    isSystemRole: false,
    permissions: [
      'projects.view', 'expenses.view', 'expenses.create', 'expenses.approve',
      'payments.view', 'payments.create', 'parties.view', 'advances.view', 'advances.manage',
    ],
  },
  {
    name: 'Supervisor',
    description: 'Supervise site work and create expenses',
    isSystemRole: false,
    permissions: ['projects.view', 'expenses.view', 'expenses.create', 'payments.view', 'boq.view'],
  },
  {
    name: 'Site Engineer',
    description: 'Technical oversight and quality control',
    isSystemRole: false,
    permissions: ['projects.view', 'expenses.view', 'expenses.create', 'boq.view', 'boq.manage'],
  },
  {
    name: 'Store Keeper',
    description: 'Manage inventory and material receipts',
    isSystemRole: false,
    permissions: ['projects.view', 'expenses.view', 'expenses.create', 'parties.view'],
  },
];

// ============================================
// Vendors Data
// ============================================

const VENDORS_DATA = [
  { name: 'Ambuja Cement Distributors', phone: '+919876540001', location: 'Industrial Area, Block A, Godown 12' },
  { name: 'Tata Steel Authorized Dealer', phone: '+919876540002', location: 'Steel Market, Zone 3, Shop 45' },
  { name: 'Birla White Putty Depot', phone: '+919876540003', location: 'Warehouse Complex, Plot 45, Sector 8' },
  { name: 'Asian Paints Color World', phone: '+919876540004', location: 'Commercial Street, Shop 23-24' },
  { name: 'Kajaria Tiles Showroom', phone: '+919876540005', location: 'Retail Park, Unit 7, Ground Floor' },
  { name: 'Greenply Timber & Plywood', phone: '+919876540006', location: 'Timber Yard, Sector 8, Plot 89' },
  { name: 'Supreme PVC Pipes Dealer', phone: '+919876540007', location: 'Plumbing Market, Shop 15-16' },
  { name: 'Havells Electrical Supplies', phone: '+919876540008', location: 'Electronics Hub, Floor 2, Unit 201' },
  { name: 'ACC Ready Mix Concrete', phone: '+919876540009', location: 'RMC Plant, Industrial Zone, Plot 112' },
  { name: 'Fenesta Windows Gallery', phone: '+919876540010', location: 'Building Materials Hub, Unit 12' },
  { name: 'Ultratech Cement Agency', phone: '+919876540011', location: 'Cement Godown, Highway Road, KM 5' },
  { name: 'JSW Steel Stockist', phone: '+919876540012', location: 'Steel Yard, Industrial Estate, Plot 78' },
  { name: 'Somany Ceramics Dealer', phone: '+919876540013', location: 'Tile Market, Shop 34, Main Road' },
  { name: 'Finolex Cables & Wires', phone: '+919876540014', location: 'Electrical Market, Shop 56' },
  { name: 'Hindware Sanitary Showroom', phone: '+919876540015', location: 'Sanitary Bazaar, Shop 12-14' },
  { name: 'Saint Gobain Glass Dealer', phone: '+919876540016', location: 'Glass Market, Unit 8' },
  { name: 'Pidilite Adhesives Distributor', phone: '+919876540017', location: 'Chemical Market, Shop 23' },
  { name: 'Cera Sanitaryware Gallery', phone: '+919876540018', location: 'Bath Fittings Hub, Shop 45' },
];

const SUBCONTRACTORS_DATA = [
  { name: 'Sharma Electrical Services', phone: '+919876541001', location: 'Tech Park, Office 301' },
  { name: 'Gupta Plumbing Solutions', phone: '+919876541002', location: 'Service Center, Unit 5' },
  { name: 'Kumar Carpentry Works', phone: '+919876541003', location: 'Workshop Area, Shed 12' },
  { name: 'Singh Masonry Contractors', phone: '+919876541004', location: 'Site Office, Block C' },
  { name: 'Patel HVAC Systems', phone: '+919876541005', location: 'Industrial Estate, Building 8' },
  { name: 'Verma Welding & Fabrication', phone: '+919876541006', location: 'Metal Works Zone, Unit 9' },
  { name: 'Reddy Flooring Experts', phone: '+919876541007', location: 'Showroom Complex, Floor 1' },
  { name: 'Mehta Painting Contractors', phone: '+919876541008', location: 'Artisan Quarter, Shop 22' },
  { name: 'Nair Waterproofing Services', phone: '+919876541009', location: 'Construction Hub, Office 15' },
  { name: 'Desai Interior Solutions', phone: '+919876541010', location: 'Design Center, Floor 3' },
  { name: 'Joshi False Ceiling Works', phone: '+919876541011', location: 'Interior Market, Shop 67' },
  { name: 'Rao Aluminium Fabricators', phone: '+919876541012', location: 'Fabrication Zone, Shed 34' },
  { name: 'Mishra Glass & Glazing', phone: '+919876541013', location: 'Glass Works, Unit 11' },
  { name: 'Saxena Fire Safety Systems', phone: '+919876541014', location: 'Safety Hub, Office 23' },
  { name: 'Pillai Lift Installation', phone: '+919876541015', location: 'Elevator Services, Building 5' },
];

const LABOURS_DATA = [
  { name: 'Ramesh Mason Team (12 workers)', phone: '+919876542001', location: 'Labor Camp A, Barrack 3' },
  { name: 'Suresh Carpenter Crew (8 workers)', phone: '+919876542002', location: 'Labor Camp B, Barrack 7' },
  { name: 'Mohan Helper Squad (20 workers)', phone: '+919876542003', location: 'Labor Camp A, Barrack 5' },
  { name: 'Vijay Plumber Team (6 workers)', phone: '+919876542004', location: 'Labor Camp C, Barrack 2' },
  { name: 'Anil Electrician Crew (8 workers)', phone: '+919876542005', location: 'Labor Camp B, Barrack 4' },
  { name: 'Deepak Painter Team (15 workers)', phone: '+919876542006', location: 'Labor Camp A, Barrack 8' },
  { name: 'Rajesh Tile Layer Crew (10 workers)', phone: '+919876542007', location: 'Labor Camp C, Barrack 6' },
  { name: 'Amit Welder Team (5 workers)', phone: '+919876542008', location: 'Labor Camp B, Barrack 9' },
  { name: 'Sunil Steel Fixer Crew (12 workers)', phone: '+919876542009', location: 'Labor Camp A, Barrack 11' },
  { name: 'Prakash General Labor (25 workers)', phone: '+919876542010', location: 'Labor Camp C, Barrack 10' },
  { name: 'Ganesh Shuttering Team (10 workers)', phone: '+919876542011', location: 'Labor Camp A, Barrack 12' },
  { name: 'Mahesh Plastering Crew (8 workers)', phone: '+919876542012', location: 'Labor Camp B, Barrack 13' },
  { name: 'Dinesh Bar Bending Team (6 workers)', phone: '+919876542013', location: 'Labor Camp C, Barrack 14' },
  { name: 'Lokesh Excavation Crew (15 workers)', phone: '+919876542014', location: 'Labor Camp A, Barrack 15' },
  { name: 'Naresh Concrete Crew (18 workers)', phone: '+919876542015', location: 'Labor Camp B, Barrack 16' },
  { name: 'Santosh Finishing Team (12 workers)', phone: '+919876542016', location: 'Labor Camp C, Barrack 17' },
  { name: 'Vinod Waterproofing Crew (5 workers)', phone: '+919876542017', location: 'Labor Camp A, Barrack 18' },
  { name: 'Harish Scaffolding Team (8 workers)', phone: '+919876542018', location: 'Labor Camp B, Barrack 19' },
];

// ============================================
// Team Members Data
// ============================================

const TEAM_MEMBERS_PREMIER = [
  { name: 'Rajesh Kumar', phone: '+919876543001', email: 'rajesh.admin@premier.com', role: 'Admin', location: 'Head Office, Floor 5' },
  { name: 'Amit Sharma', phone: '+919876543002', email: 'amit.pm@premier.com', role: 'Project Manager', location: 'Head Office, Floor 3' },
  { name: 'Priya Patel', phone: '+919876543003', email: 'priya.pm@premier.com', role: 'Project Manager', location: 'Head Office, Floor 3' },
  { name: 'Vikram Singh', phone: '+919876543004', email: 'vikram.pm@premier.com', role: 'Project Manager', location: 'Site Office A' },
  { name: 'Neha Gupta', phone: '+919876543005', email: 'neha.pm@premier.com', role: 'Project Manager', location: 'Site Office B' },
  { name: 'Rahul Verma', phone: '+919876543006', email: 'rahul.acc@premier.com', role: 'Accountant', location: 'Head Office, Floor 2' },
  { name: 'Sunita Reddy', phone: '+919876543007', email: 'sunita.acc@premier.com', role: 'Accountant', location: 'Head Office, Floor 2' },
  { name: 'Manoj Kumar', phone: '+919876543008', email: 'manoj.sup@premier.com', role: 'Supervisor', location: 'Site Office A' },
  { name: 'Anjali Mehta', phone: '+919876543009', email: 'anjali.sup@premier.com', role: 'Supervisor', location: 'Site Office B' },
  { name: 'Suresh Nair', phone: '+919876543010', email: 'suresh.sup@premier.com', role: 'Supervisor', location: 'Site Office C' },
  { name: 'Kavita Desai', phone: '+919876543011', email: 'kavita.sup@premier.com', role: 'Supervisor', location: 'Site Office D' },
  { name: 'Ravi Joshi', phone: '+919876543012', email: 'ravi.sup@premier.com', role: 'Supervisor', location: 'Site Office A' },
  { name: 'Pooja Saxena', phone: '+919876543013', email: 'pooja.sup@premier.com', role: 'Supervisor', location: 'Site Office B' },
  { name: 'Arun Pillai', phone: '+919876543014', email: 'arun.sup@premier.com', role: 'Supervisor', location: 'Site Office C' },
  { name: 'Meera Iyer', phone: '+919876543015', email: 'meera.sup@premier.com', role: 'Supervisor', location: 'Site Office D' },
  { name: 'Deepak Mishra', phone: '+919876543016', email: 'deepak.eng@premier.com', role: 'Site Engineer', location: 'Site Office A' },
  { name: 'Sneha Rao', phone: '+919876543017', email: 'sneha.eng@premier.com', role: 'Site Engineer', location: 'Site Office B' },
  { name: 'Karthik Menon', phone: '+919876543018', email: 'karthik.eng@premier.com', role: 'Site Engineer', location: 'Site Office C' },
  { name: 'Divya Sharma', phone: '+919876543019', email: 'divya.eng@premier.com', role: 'Site Engineer', location: 'Site Office D' },
  { name: 'Rohit Agarwal', phone: '+919876543020', email: 'rohit.eng@premier.com', role: 'Site Engineer', location: 'Site Office A' },
  { name: 'Lakshmi Nair', phone: '+919876543021', email: 'lakshmi.store@premier.com', role: 'Store Keeper', location: 'Central Store' },
  { name: 'Ganesh Patil', phone: '+919876543022', email: 'ganesh.store@premier.com', role: 'Store Keeper', location: 'Site Store A' },
];

const TEAM_MEMBERS_BUILDRIGHT = [
  { name: 'Sanjay Kapoor', phone: '+919876544001', email: 'sanjay.admin@buildright.com', role: 'Admin', location: 'Corporate Office, Tower A' },
  { name: 'Anita Jain', phone: '+919876544002', email: 'anita.pm@buildright.com', role: 'Project Manager', location: 'Corporate Office, Floor 4' },
  { name: 'Prakash Yadav', phone: '+919876544003', email: 'prakash.pm@buildright.com', role: 'Project Manager', location: 'Site Office 1' },
  { name: 'Rekha Sharma', phone: '+919876544004', email: 'rekha.pm@buildright.com', role: 'Project Manager', location: 'Site Office 2' },
  { name: 'Vijay Malhotra', phone: '+919876544005', email: 'vijay.acc@buildright.com', role: 'Accountant', location: 'Corporate Office, Floor 2' },
  { name: 'Geeta Kumari', phone: '+919876544006', email: 'geeta.acc@buildright.com', role: 'Accountant', location: 'Corporate Office, Floor 2' },
  { name: 'Ramesh Tiwari', phone: '+919876544007', email: 'ramesh.sup@buildright.com', role: 'Supervisor', location: 'Site Office 1' },
  { name: 'Sunita Devi', phone: '+919876544008', email: 'sunita.sup@buildright.com', role: 'Supervisor', location: 'Site Office 2' },
  { name: 'Ashok Kumar', phone: '+919876544009', email: 'ashok.sup@buildright.com', role: 'Supervisor', location: 'Site Office 3' },
  { name: 'Parveen Kaur', phone: '+919876544010', email: 'parveen.sup@buildright.com', role: 'Supervisor', location: 'Site Office 1' },
  { name: 'Mukesh Gupta', phone: '+919876544011', email: 'mukesh.sup@buildright.com', role: 'Supervisor', location: 'Site Office 2' },
  { name: 'Shobha Rani', phone: '+919876544012', email: 'shobha.sup@buildright.com', role: 'Supervisor', location: 'Site Office 3' },
  { name: 'Naveen Singh', phone: '+919876544013', email: 'naveen.eng@buildright.com', role: 'Site Engineer', location: 'Site Office 1' },
  { name: 'Priyanka Das', phone: '+919876544014', email: 'priyanka.eng@buildright.com', role: 'Site Engineer', location: 'Site Office 2' },
  { name: 'Ajay Verma', phone: '+919876544015', email: 'ajay.eng@buildright.com', role: 'Site Engineer', location: 'Site Office 3' },
  { name: 'Kavitha Reddy', phone: '+919876544016', email: 'kavitha.eng@buildright.com', role: 'Site Engineer', location: 'Site Office 1' },
  { name: 'Sunil Prasad', phone: '+919876544017', email: 'sunil.store@buildright.com', role: 'Store Keeper', location: 'Central Warehouse' },
  { name: 'Meena Kumari', phone: '+919876544018', email: 'meena.store@buildright.com', role: 'Store Keeper', location: 'Site Store 1' },
];

// ============================================
// Project Configurations
// ============================================

type ProjectScenario = 'JUST_STARTED' | 'ACTIVE_LOW' | 'ACTIVE_MID' | 'ACTIVE_HIGH' | 'NEAR_COMPLETION' | 'OVER_BUDGET' | 'UNDER_BUDGET' | 'ON_HOLD';

interface ProjectConfig {
  name: string;
  clientName: string;
  clientPhone: string;
  clientLocation: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  budgetAmount: number;
  targetActualPercent: number;
  area: string | null;
  projectType: string;
  scenario: ProjectScenario;
  image: string;
  stageProgress: number[];
}

const PREMIER_PROJECTS: ProjectConfig[] = [
  // 4 Active Projects (main demo)
  {
    name: 'Sunrise Luxury Apartments - Tower A',
    clientName: 'Sunrise Real Estate Developers Pvt Ltd',
    clientPhone: '+919876550001',
    clientLocation: 'Corporate Tower, 15th Floor, Business District',
    location: 'Plot 45-50, Sector 12, New City Township',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2026-09-30'),
    budgetAmount: 8500000,
    targetActualPercent: 45,
    area: '42000',
    projectType: 'Residential',
    scenario: 'ACTIVE_LOW',
    image: PROJECT_IMAGES.residential[0],
    stageProgress: [100, 80, 40, 10, 0],
  },
  {
    name: 'Metro Plaza Commercial Complex',
    clientName: 'Metro Ventures Holdings LLC',
    clientPhone: '+919876550002',
    clientLocation: 'Financial Hub, Tower B, Suite 1201',
    location: 'Central Business District, Plot 78, Main Road',
    startDate: new Date('2025-02-15'),
    endDate: new Date('2026-08-15'),
    budgetAmount: 12000000,
    targetActualPercent: 55,
    area: '65000',
    projectType: 'Commercial',
    scenario: 'ACTIVE_MID',
    image: PROJECT_IMAGES.commercial[0],
    stageProgress: [100, 100, 60, 20, 0],
  },
  {
    name: 'Green Valley Villas Phase 2',
    clientName: 'Green Valley Developers Association',
    clientPhone: '+919876550003',
    clientLocation: 'Developer Park, Building 5, Office 302',
    location: 'Suburban Hills, Plots 101-120, Valley Road',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2026-12-31'),
    budgetAmount: 15000000,
    targetActualPercent: 62,
    area: '85000',
    projectType: 'Residential',
    scenario: 'ACTIVE_MID',
    image: PROJECT_IMAGES.residential[1],
    stageProgress: [100, 100, 70, 30, 5],
  },
  {
    name: 'Tech Park Innovation Center',
    clientName: 'TechCorp Industries Limited',
    clientPhone: '+919876550004',
    clientLocation: 'IT Park, Tower C, 8th Floor',
    location: 'Technology Zone, Sector 7, Plot 89-92',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2026-07-31'),
    budgetAmount: 18000000,
    targetActualPercent: 70,
    area: '72000',
    projectType: 'Commercial',
    scenario: 'ACTIVE_HIGH',
    image: PROJECT_IMAGES.commercial[1],
    stageProgress: [100, 100, 85, 50, 15],
  },
  // 2 Near Completion
  {
    name: 'Riverside Heights Premium Residences',
    clientName: 'Riverside Developers Consortium',
    clientPhone: '+919876550005',
    clientLocation: 'Riverside Business Park, Tower B, Suite 501',
    location: 'Riverside Colony, Plot 45-48, Sector 12',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2026-03-31'),
    budgetAmount: 9500000,
    targetActualPercent: 92,
    area: '48000',
    projectType: 'Residential',
    scenario: 'NEAR_COMPLETION',
    image: PROJECT_IMAGES.residential[2],
    stageProgress: [100, 100, 100, 95, 70],
  },
  {
    name: 'City Center Mall Renovation',
    clientName: 'Retail Ventures Corporation',
    clientPhone: '+919876550006',
    clientLocation: 'Mall Management Office, Floor 3, Wing A',
    location: 'City Center, Main Market Complex',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2026-02-28'),
    budgetAmount: 6500000,
    targetActualPercent: 88,
    area: '35000',
    projectType: 'Commercial',
    scenario: 'NEAR_COMPLETION',
    image: PROJECT_IMAGES.commercial[2],
    stageProgress: [100, 100, 100, 90, 60],
  },
  // 1 Just Started
  {
    name: 'Lakeside Business Park - Phase 1',
    clientName: 'Lakeside Ventures LLP',
    clientPhone: '+919876550007',
    clientLocation: 'Financial District, Block C, Office 1105',
    location: 'IT Park Road, Plot 12, Tech Zone',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2027-06-30'),
    budgetAmount: 22000000,
    targetActualPercent: 5,
    area: '95000',
    projectType: 'Commercial',
    scenario: 'JUST_STARTED',
    image: PROJECT_IMAGES.construction[0],
    stageProgress: [40, 0, 0, 0, 0],
  },
  // 1 On Hold
  {
    name: 'Heritage Hotel Restoration',
    clientName: 'Heritage Hospitality Group',
    clientPhone: '+919876550008',
    clientLocation: 'Hotel Corporate Office, Heritage Building',
    location: 'Old City, Heritage Zone, Plot 5',
    startDate: new Date('2025-05-01'),
    endDate: null,
    budgetAmount: 7500000,
    targetActualPercent: 35,
    area: '28000',
    projectType: 'Commercial',
    scenario: 'ON_HOLD',
    image: PROJECT_IMAGES.commercial[3],
    stageProgress: [100, 60, 10, 0, 0],
  },
];

const BUILDRIGHT_PROJECTS: ProjectConfig[] = [
  // 4 Active
  {
    name: 'National Highway NH-45 Bridge Section',
    clientName: 'National Highways Authority of India',
    clientPhone: '+919876551001',
    clientLocation: 'NHAI Regional Office, Sector 5, Block A',
    location: 'Highway NH-45, KM 112-118, River Crossing',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2026-12-31'),
    budgetAmount: 35000000,
    targetActualPercent: 48,
    area: null,
    projectType: 'Infrastructure',
    scenario: 'ACTIVE_MID',
    image: PROJECT_IMAGES.infrastructure[0],
    stageProgress: [100, 90, 50, 15, 0],
  },
  {
    name: 'Industrial Warehouse Complex',
    clientName: 'Logistics Hub Private Limited',
    clientPhone: '+919876551002',
    clientLocation: 'Logistics Park, Admin Building, Floor 2',
    location: 'Industrial Zone, Plot 56-65, Warehouse District',
    startDate: new Date('2025-03-15'),
    endDate: new Date('2026-09-30'),
    budgetAmount: 12000000,
    targetActualPercent: 55,
    area: '75000',
    projectType: 'Industrial',
    scenario: 'ACTIVE_MID',
    image: PROJECT_IMAGES.industrial[0],
    stageProgress: [100, 100, 60, 20, 0],
  },
  {
    name: 'Metro Rail Station - Central Hub',
    clientName: 'Metro Rail Corporation Limited',
    clientPhone: '+919876551003',
    clientLocation: 'Metro Bhawan, Civil Lines, Office 401',
    location: 'Central Station Area, Underground Level',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2027-03-31'),
    budgetAmount: 45000000,
    targetActualPercent: 38,
    area: '55000',
    projectType: 'Infrastructure',
    scenario: 'ACTIVE_LOW',
    image: PROJECT_IMAGES.infrastructure[1],
    stageProgress: [100, 70, 30, 5, 0],
  },
  {
    name: 'Solar Power Plant Infrastructure',
    clientName: 'Green Energy Solutions Pvt Ltd',
    clientPhone: '+919876551004',
    clientLocation: 'Energy Tower, 12th Floor, Green Building',
    location: 'Solar Park, Plot 1-50, Desert Zone',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2026-06-30'),
    budgetAmount: 28000000,
    targetActualPercent: 65,
    area: '200000',
    projectType: 'Industrial',
    scenario: 'ACTIVE_HIGH',
    image: PROJECT_IMAGES.industrial[1],
    stageProgress: [100, 100, 80, 40, 10],
  },
  // 1 Over Budget
  {
    name: 'City Hospital Wing Extension',
    clientName: 'City Healthcare Trust',
    clientPhone: '+919876551005',
    clientLocation: 'Hospital Campus, Admin Block, Room 201',
    location: 'Medical District, Hospital Road, Plot 12',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2026-04-30'),
    budgetAmount: 18000000,
    targetActualPercent: 125,
    area: '38000',
    projectType: 'Commercial',
    scenario: 'OVER_BUDGET',
    image: PROJECT_IMAGES.construction[2],
    stageProgress: [100, 100, 90, 60, 20],
  },
  // 1 Under Budget
  {
    name: 'Government School Renovation',
    clientName: 'State Education Department',
    clientPhone: '+919876551006',
    clientLocation: 'Secretariat Building, Room 405, Education Wing',
    location: 'School Campus, Civil Lines, Plot 8',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2026-02-28'),
    budgetAmount: 5500000,
    targetActualPercent: 58,
    area: '22000',
    projectType: 'Institutional',
    scenario: 'UNDER_BUDGET',
    image: PROJECT_IMAGES.construction[3],
    stageProgress: [100, 100, 80, 50, 15],
  },
];

// ============================================
// BOQ Sections & Items Templates
// ============================================

const BOQ_SECTIONS = [
  { name: 'Site Preparation', sortOrder: 1 },
  { name: 'Foundation Work', sortOrder: 2 },
  { name: 'Structural Work', sortOrder: 3 },
  { name: 'MEP Services', sortOrder: 4 },
  { name: 'Finishing Work', sortOrder: 5 },
  { name: 'External Works', sortOrder: 6 },
];

interface BOQTemplate {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  category: 'MATERIAL' | 'LABOUR' | 'SUB_WORK' | 'EQUIPMENT' | 'OTHER';
  subTypeName: string; // Maps to material_type, labour_type, or sub_work_type
  sectionName: string;
  stageName: string;
}

const BOQ_TEMPLATES: BOQTemplate[] = [
  // Site Preparation - Foundation Stage
  { code: 'SP-001', description: 'Site clearing and removal of vegetation including disposal of debris within 50m lead as per site engineer instructions', unit: 'sqm', quantity: 500, rate: 45, category: 'LABOUR', subTypeName: 'Helper/Coolie Work', sectionName: 'Site Preparation', stageName: 'Foundation' },
  { code: 'SP-002', description: 'Excavation in all types of soil including hard murrum for foundation trenches, disposing excavated earth within 50m lead with all lifts', unit: 'cum', quantity: 200, rate: 280, category: 'LABOUR', subTypeName: 'Excavation Work', sectionName: 'Site Preparation', stageName: 'Foundation' },
  { code: 'SP-003', description: 'Anti-termite treatment to soil before laying PCC using approved chemicals (Chlorpyriphos 20% EC) as per IS:6313', unit: 'sqm', quantity: 400, rate: 65, category: 'SUB_WORK', subTypeName: 'Waterproofing Work', sectionName: 'Site Preparation', stageName: 'Foundation' },
  { code: 'SP-004', description: 'Sand filling in foundation trenches and plinth area in layers of 150mm with compaction using plate compactor', unit: 'cum', quantity: 150, rate: 1200, category: 'MATERIAL', subTypeName: 'Sand & Aggregates', sectionName: 'Site Preparation', stageName: 'Foundation' },
  
  // Foundation Work - Foundation Stage
  { code: 'FW-001', description: 'Providing and laying in position Plain Cement Concrete (PCC) M15 grade (1:2:4) using 20mm and down size graded stone aggregate for leveling course under foundations including curing', unit: 'cum', quantity: 35, rate: 4800, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'Foundation Work', stageName: 'Foundation' },
  { code: 'FW-002', description: 'Providing and laying in position machine mixed design mix M25 grade concrete for reinforced cement concrete work in foundations, footings, and grade beams including centering, shuttering, compacting, finishing and curing complete as per IS:456-2000', unit: 'cum', quantity: 80, rate: 6500, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'Foundation Work', stageName: 'Foundation' },
  { code: 'FW-003', description: 'Supplying and fixing in position TMT steel reinforcement bars Fe-500D grade (Tata/SAIL/JSW make) for RCC work including cutting, bending, binding with 18 gauge annealed binding wire, placing in position with cover blocks, all complete as per structural drawings', unit: 'MT', quantity: 12, rate: 62000, category: 'MATERIAL', subTypeName: 'Steel & TMT Bars', sectionName: 'Foundation Work', stageName: 'Foundation' },
  { code: 'FW-004', description: 'Centering and shuttering for foundations including strutting, propping, and removal after specified curing period using steel/plywood shuttering', unit: 'sqm', quantity: 250, rate: 380, category: 'LABOUR', subTypeName: 'Shuttering Work', sectionName: 'Foundation Work', stageName: 'Foundation' },
  { code: 'FW-005', description: 'Portland Pozzolana Cement (PPC) 53 Grade conforming to IS:1489, Ultratech/ACC/Ambuja brand, in 50kg bags with proper storage and handling', unit: 'bags', quantity: 400, rate: 380, category: 'MATERIAL', subTypeName: 'Cement', sectionName: 'Foundation Work', stageName: 'Foundation' },
  
  // Structural Work - Framing Stage
  { code: 'ST-001', description: 'Providing and laying in position machine mixed design mix M30 grade concrete for reinforced cement concrete work in columns above plinth level including centering, shuttering, compacting, finishing and curing complete as per IS:456-2000 and structural drawings', unit: 'cum', quantity: 45, rate: 7200, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-002', description: 'Providing and laying in position machine mixed design mix M30 grade concrete for reinforced cement concrete work in beams and lintels including centering, shuttering, compacting, finishing and curing complete', unit: 'cum', quantity: 60, rate: 7500, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-003', description: 'Providing and laying in position machine mixed design mix M25 grade concrete for reinforced cement concrete work in suspended floor slabs 125mm to 150mm thick including centering, shuttering, compacting, finishing and curing complete', unit: 'cum', quantity: 120, rate: 6800, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-004', description: 'Supplying and fixing in position TMT steel reinforcement bars Fe-500D grade for RCC columns, beams, and slabs including cutting, bending, binding with cover blocks as per structural drawings', unit: 'MT', quantity: 25, rate: 62000, category: 'MATERIAL', subTypeName: 'Steel & TMT Bars', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-005', description: 'Brick masonry work in superstructure using first class burnt clay bricks in cement mortar 1:6 proportion including scaffolding, curing, and raking of joints for plastering', unit: 'cum', quantity: 85, rate: 5800, category: 'MATERIAL', subTypeName: 'Bricks & Blocks', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-006', description: 'AAC Block masonry using 200mm thick blocks (600x200x200mm) of density 550-650 kg/cum with polymer modified thin bed mortar including scaffolding and curing', unit: 'cum', quantity: 65, rate: 4500, category: 'MATERIAL', subTypeName: 'Bricks & Blocks', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-007', description: 'Centering and shuttering for columns, beams, and slabs including strutting, propping, and removal using steel/plywood shuttering system', unit: 'sqm', quantity: 800, rate: 420, category: 'LABOUR', subTypeName: 'Shuttering Work', sectionName: 'Structural Work', stageName: 'Framing' },
  { code: 'ST-008', description: 'Scaffolding charges for brick/block masonry work above plinth level including erection, maintenance, and dismantling', unit: 'sqm-month', quantity: 600, rate: 15, category: 'LABOUR', subTypeName: 'Scaffolding Work', sectionName: 'Structural Work', stageName: 'Framing' },
  
  // MEP Services - Plumbing & Electrical Stage
  { code: 'MEP-001', description: 'Supplying and fixing ISI marked CPVC pipes of approved make (Astral/Supreme/Prince) for hot and cold water supply lines including all fittings, clamps, supports, testing and commissioning complete as per plumbing drawings', unit: 'rmt', quantity: 450, rate: 95, category: 'SUB_WORK', subTypeName: 'Plumbing Work', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-002', description: 'Supplying and fixing SWR (Soil Waste and Rain) PVC pipes 110mm dia of approved make for soil and waste lines including all fittings, clamps, and supports', unit: 'rmt', quantity: 280, rate: 185, category: 'SUB_WORK', subTypeName: 'Plumbing Work', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-003', description: 'Supplying and fixing concealed copper wiring in PVC conduits for electrical points using 2.5 sqmm FRLS copper wire (Finolex/Havells/Polycab make) including modular switches and sockets', unit: 'points', quantity: 120, rate: 1450, category: 'SUB_WORK', subTypeName: 'Electrical Work', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-004', description: 'Supplying and fixing concealed copper wiring in PVC conduits for power points using 4 sqmm FRLS copper wire including 16A sockets and MCBs', unit: 'points', quantity: 45, rate: 1850, category: 'SUB_WORK', subTypeName: 'Electrical Work', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-005', description: 'Supplying, installing, testing and commissioning of MCB Distribution Board (DB) 8-way TPN with 63A TP MCB incomer and required SP MCBs (Havells/Schneider make)', unit: 'nos', quantity: 12, rate: 4500, category: 'MATERIAL', subTypeName: 'Electrical Materials', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-006', description: 'Supplying and fixing UPVC rainwater pipes 110mm dia for rainwater harvesting system including all fittings, clamps, and connections to storage tank', unit: 'rmt', quantity: 180, rate: 165, category: 'MATERIAL', subTypeName: 'Plumbing Materials', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  { code: 'MEP-007', description: 'Supplying and fixing earthing system with GI pipe electrode 40mm dia x 3m long including GI earth wire, earth pit cover, charcoal and salt as per IS:3043', unit: 'nos', quantity: 4, rate: 8500, category: 'SUB_WORK', subTypeName: 'Electrical Work', sectionName: 'MEP Services', stageName: 'Plumbing & Electrical' },
  
  // Finishing Work - Finishing Stage
  { code: 'FN-001', description: 'Providing 12mm thick cement plaster in single coat on internal walls in cement mortar 1:4 including scaffolding, curing, and making good damages', unit: 'sqm', quantity: 1500, rate: 32, category: 'LABOUR', subTypeName: 'Plastering Work', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-002', description: 'Providing 20mm thick cement plaster in two coats (12mm base + 8mm finish) on external walls in cement mortar 1:4 including scaffolding, curing, and making good damages', unit: 'sqm', quantity: 800, rate: 48, category: 'LABOUR', subTypeName: 'Plastering Work', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-003', description: 'Supplying and applying two coats of premium quality acrylic interior emulsion paint of approved shade (Asian Paints Royale/Berger Silk) over one coat of wall primer on plastered surfaces', unit: 'sqm', quantity: 1500, rate: 42, category: 'MATERIAL', subTypeName: 'Paint & Finishes', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-004', description: 'Supplying and applying two coats of premium quality acrylic exterior emulsion paint (Asian Paints Apex/Berger Weathercoat) over one coat of exterior primer on external plastered surfaces', unit: 'sqm', quantity: 800, rate: 55, category: 'MATERIAL', subTypeName: 'Paint & Finishes', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-005', description: 'Supplying and laying vitrified tiles 600x600mm double charge (Kajaria/Somany/Johnson make) in flooring over 20mm thick cement mortar bed including grouting with matching grout', unit: 'sqm', quantity: 650, rate: 1200, category: 'MATERIAL', subTypeName: 'Tiles & Flooring', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-006', description: 'Supplying and laying ceramic wall tiles 300x450mm glazed (Kajaria/Somany make) in toilets and kitchens over 12mm thick cement mortar including grouting', unit: 'sqm', quantity: 280, rate: 850, category: 'MATERIAL', subTypeName: 'Tiles & Flooring', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-007', description: 'Supplying and fixing flush doors 35mm thick commercial ply both sides with teak wood frame 100x75mm including all hardware (hinges, tower bolts, handles) and finishing with melamine polish', unit: 'nos', quantity: 18, rate: 12500, category: 'MATERIAL', subTypeName: 'Doors & Windows', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-008', description: 'Supplying and fixing UPVC sliding windows with 5mm clear glass including hardware, weather strips, and mosquito mesh (Fenesta/NCL make)', unit: 'sqm', quantity: 120, rate: 850, category: 'MATERIAL', subTypeName: 'Doors & Windows', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-009', description: 'Supplying and fixing gypsum board false ceiling 12.5mm thick with GI frame including all accessories, finishing with putty and painting', unit: 'sqm', quantity: 350, rate: 125, category: 'SUB_WORK', subTypeName: 'False Ceiling Work', sectionName: 'Finishing Work', stageName: 'Finishing' },
  { code: 'FN-010', description: 'Birla White wall putty application in two coats on plastered surfaces for smooth finish before painting', unit: 'sqm', quantity: 2300, rate: 18, category: 'MATERIAL', subTypeName: 'Paint & Finishes', sectionName: 'Finishing Work', stageName: 'Finishing' },
  
  // External Works - Final Inspection Stage
  { code: 'EX-001', description: 'Providing and laying interlocking paver blocks 80mm thick (M-30 grade) over 50mm thick sand bed for driveways and parking areas including compaction', unit: 'sqm', quantity: 400, rate: 750, category: 'MATERIAL', subTypeName: 'Tiles & Flooring', sectionName: 'External Works', stageName: 'Final Inspection' },
  { code: 'EX-002', description: 'Providing and constructing RCC compound wall 150mm thick with 1.5m height above plinth including foundation, plastering, and painting both sides', unit: 'rmt', quantity: 120, rate: 3500, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'External Works', stageName: 'Final Inspection' },
  { code: 'EX-003', description: 'Providing and fixing MS main gate 3m x 2.1m with 40x40mm box section frame, 25x25mm vertical members, including painting with enamel paint', unit: 'nos', quantity: 1, rate: 45000, category: 'MATERIAL', subTypeName: 'Hardware & Fixtures', sectionName: 'External Works', stageName: 'Final Inspection' },
  { code: 'EX-004', description: 'Landscaping work including top soil spreading 150mm thick, lawn grass planting, and initial maintenance for 3 months', unit: 'sqm', quantity: 300, rate: 85, category: 'SUB_WORK', subTypeName: 'Landscaping Work', sectionName: 'External Works', stageName: 'Final Inspection' },
  { code: 'EX-005', description: 'Providing and laying RCC storm water drain 300x300mm internal size with removable MS grating cover including excavation and backfilling', unit: 'rmt', quantity: 80, rate: 1800, category: 'MATERIAL', subTypeName: 'Ready Mix Concrete', sectionName: 'External Works', stageName: 'Final Inspection' },
  { code: 'EX-006', description: 'Final cleaning of entire building including removal of construction debris, washing of floors, windows, and all surfaces', unit: 'sqm', quantity: 2500, rate: 8, category: 'LABOUR', subTypeName: 'Helper/Coolie Work', sectionName: 'External Works', stageName: 'Final Inspection' },
];

// ============================================
// Tasks Templates per Stage
// ============================================

interface TaskTemplate {
  name: string;
  description: string;
  daysAllocated: number;
  stageName: string;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // Foundation Stage Tasks
  { name: 'Site Survey & Marking', description: 'Complete site survey, boundary marking, and grid layout as per approved drawings', daysAllocated: 3, stageName: 'Foundation' },
  { name: 'Excavation Work', description: 'Excavation for foundation trenches and disposal of excavated earth', daysAllocated: 7, stageName: 'Foundation' },
  { name: 'PCC Leveling Course', description: 'Laying PCC leveling course under footings and grade beams', daysAllocated: 4, stageName: 'Foundation' },
  { name: 'Foundation Reinforcement', description: 'Steel bar cutting, bending, and fixing for foundation reinforcement', daysAllocated: 8, stageName: 'Foundation' },
  { name: 'Foundation Concreting', description: 'Concreting of footings, grade beams, and plinth beams', daysAllocated: 6, stageName: 'Foundation' },
  
  // Framing Stage Tasks
  { name: 'Column Reinforcement', description: 'Steel fixing for columns as per structural drawings', daysAllocated: 10, stageName: 'Framing' },
  { name: 'Column Shuttering & Concreting', description: 'Shuttering, concreting, and curing of columns', daysAllocated: 8, stageName: 'Framing' },
  { name: 'Beam & Slab Reinforcement', description: 'Steel fixing for beams and slabs at each floor level', daysAllocated: 12, stageName: 'Framing' },
  { name: 'Slab Concreting', description: 'Concreting of floor slabs with proper compaction and finishing', daysAllocated: 5, stageName: 'Framing' },
  { name: 'Brick/Block Masonry', description: 'Brick or AAC block masonry work for walls', daysAllocated: 15, stageName: 'Framing' },
  
  // Plumbing & Electrical Stage Tasks
  { name: 'Plumbing Rough-in', description: 'Installation of concealed water supply and drainage pipes', daysAllocated: 10, stageName: 'Plumbing & Electrical' },
  { name: 'Electrical Conduit Work', description: 'Laying of electrical conduits in walls and slabs', daysAllocated: 8, stageName: 'Plumbing & Electrical' },
  { name: 'Wiring & Cabling', description: 'Pulling wires through conduits and terminations', daysAllocated: 7, stageName: 'Plumbing & Electrical' },
  { name: 'DB & Earthing Installation', description: 'Installation of distribution boards and earthing system', daysAllocated: 4, stageName: 'Plumbing & Electrical' },
  
  // Finishing Stage Tasks
  { name: 'Internal Plastering', description: 'Cement plastering on internal walls and ceilings', daysAllocated: 12, stageName: 'Finishing' },
  { name: 'External Plastering', description: 'Cement plastering on external walls with proper scaffolding', daysAllocated: 8, stageName: 'Finishing' },
  { name: 'Flooring Work', description: 'Laying of vitrified tiles in all rooms', daysAllocated: 10, stageName: 'Finishing' },
  { name: 'Wall Tiling', description: 'Ceramic tile work in toilets and kitchens', daysAllocated: 6, stageName: 'Finishing' },
  { name: 'Painting Work', description: 'Wall putty application and painting of all surfaces', daysAllocated: 12, stageName: 'Finishing' },
  { name: 'Door & Window Fixing', description: 'Installation of doors, windows, and hardware', daysAllocated: 8, stageName: 'Finishing' },
  
  // Final Inspection Stage Tasks
  { name: 'External Paving', description: 'Laying of paver blocks for driveways and walkways', daysAllocated: 6, stageName: 'Final Inspection' },
  { name: 'Compound Wall & Gate', description: 'Construction of compound wall and main gate installation', daysAllocated: 10, stageName: 'Final Inspection' },
  { name: 'Landscaping', description: 'Garden development and lawn grass planting', daysAllocated: 5, stageName: 'Final Inspection' },
  { name: 'Final Cleaning & Handover', description: 'Complete cleaning and preparation for handover', daysAllocated: 3, stageName: 'Final Inspection' },
];

// ============================================
// Member Advance Purposes
// ============================================

const ADVANCE_PURPOSES = [
  'Site material purchase - cement and sand',
  'Labour wage advance for weekly payment',
  'Emergency material procurement',
  'Transportation charges for material delivery',
  'Site petty cash for miscellaneous expenses',
  'Labour contractor advance payment',
  'Equipment rental advance',
  'Safety equipment purchase',
  'Site office maintenance expenses',
  'Utility bill payments for site',
];

// ============================================
// Helper Functions
// ============================================

function getDateDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// Database Setup Functions
// ============================================

async function createGlobalCategoryTypes() {
  const existingTypes = await prisma.categoryType.findMany();
  if (existingTypes.length > 0) {
    console.log('✅ Global category types already exist');
    return;
  }

  await prisma.categoryType.createMany({ data: GLOBAL_CATEGORY_TYPES });
  console.log('✅ Created global category types');
}

async function createGlobalPermissions() {
  const existingPermissions = await prisma.permission.findMany();
  if (existingPermissions.length > 0) {
    console.log('✅ Global permissions already exist');
    return;
  }

  await prisma.permission.createMany({ data: GLOBAL_PERMISSIONS });
  console.log('✅ Created global permissions');
}

async function createDefaultRoles(organizationId: string): Promise<Map<string, Role>> {
  const allPermissions = await prisma.permission.findMany();
  const roleMap = new Map<string, Role>();

  for (const roleDef of DEFAULT_ROLES) {
    const role = await prisma.role.create({
      data: {
        organizationId,
        name: roleDef.name,
        description: roleDef.description,
        isSystemRole: roleDef.isSystemRole,
      },
    });

    const permissionsToAssign = roleDef.permissions.includes('*')
      ? allPermissions
      : allPermissions.filter((p) => roleDef.permissions.includes(p.key));

    if (permissionsToAssign.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionsToAssign.map((p) => ({ roleId: role.id, permissionId: p.id })),
      });
    }

    roleMap.set(role.name, role);
  }

  return roleMap;
}

async function createOrganizationWithDefaults(name: string) {
  return await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: { name } });

    const categoryTypes = await tx.categoryType.findMany();
    const typeIdMap = new Map(categoryTypes.map((t) => [t.key, t.id]));

    const itemsToCreate = DEFAULT_CATEGORY_ITEMS.map((item) => ({
      organizationId: organization.id,
      categoryTypeId: typeIdMap.get(item.typeKey)!,
      name: item.name,
      isEditable: item.isEditable,
    }));

    if (itemsToCreate.length > 0) {
      await tx.categoryItem.createMany({ data: itemsToCreate });
    }

    return organization;
  });
}

// ============================================
// Seed Organization Function
// ============================================

interface OrgSeedResult {
  organization: Organization;
  roles: Map<string, Role>;
  members: OrganizationMember[];
  vendors: Party[];
  subcontractors: Party[];
  labours: Party[];
  projects: Project[];
  stages: Stage[];
  boqSections: BOQSection[];
  boqItems: BOQItem[];
  expenses: Expense[];
  tasks: Task[];
}

async function seedOrganization(
  orgName: string,
  teamMembersData: typeof TEAM_MEMBERS_PREMIER,
  projectConfigs: ProjectConfig[],
  vendorOffset: number
): Promise<OrgSeedResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏢 Creating organization: ${orgName}`);
  console.log(`${'='.repeat(60)}`);

  // Create organization
  const org = await createOrganizationWithDefaults(orgName);
  console.log(`✅ Created organization: ${org.name}`);

  // Create roles
  const orgRoles = await createDefaultRoles(org.id);
  console.log('✅ Created default roles');

  // Get category types and items
  const expenseTypeCategory = await prisma.categoryType.findFirst({ where: { key: 'expense_type' } });
  const materialExpense = await prisma.categoryItem.findFirst({
    where: { organizationId: org.id, categoryTypeId: expenseTypeCategory!.id, name: 'Material' },
  });
  const labourExpense = await prisma.categoryItem.findFirst({
    where: { organizationId: org.id, categoryTypeId: expenseTypeCategory!.id, name: 'Labour' },
  });
  const subWorkExpense = await prisma.categoryItem.findFirst({
    where: { organizationId: org.id, categoryTypeId: expenseTypeCategory!.id, name: 'Sub Work' },
  });

  // Get sub-type categories (material_type, labour_type, sub_work_type)
  const materialTypeCategory = await prisma.categoryType.findFirst({ where: { key: 'material_type' } });
  const labourTypeCategory = await prisma.categoryType.findFirst({ where: { key: 'labour_type' } });
  const subWorkTypeCategory = await prisma.categoryType.findFirst({ where: { key: 'sub_work_type' } });

  // Fetch all material types, labour types, and sub work types for this organization
  const materialTypes = await prisma.categoryItem.findMany({
    where: { organizationId: org.id, categoryTypeId: materialTypeCategory!.id },
  });
  const labourTypes = await prisma.categoryItem.findMany({
    where: { organizationId: org.id, categoryTypeId: labourTypeCategory!.id },
  });
  const subWorkTypes = await prisma.categoryItem.findMany({
    where: { organizationId: org.id, categoryTypeId: subWorkTypeCategory!.id },
  });

  // Create maps for quick lookup by name
  const materialTypeMap = new Map(materialTypes.map((t) => [t.name, t]));
  const labourTypeMap = new Map(labourTypes.map((t) => [t.name, t]));
  const subWorkTypeMap = new Map(subWorkTypes.map((t) => [t.name, t]));

  console.log(`✅ Loaded ${materialTypes.length} material types, ${labourTypes.length} labour types, ${subWorkTypes.length} sub work types`);

  // Create project types
  const projectTypeCategory = await prisma.categoryType.findFirst({ where: { key: 'project_type' } });
  const projectTypes = new Map<string, { id: string }>();
  for (const typeName of ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Institutional']) {
    const existing = await prisma.categoryItem.findFirst({
      where: { organizationId: org.id, categoryTypeId: projectTypeCategory!.id, name: typeName },
    });
    if (existing) {
      projectTypes.set(typeName, existing);
    } else {
      const item = await prisma.categoryItem.create({
        data: { organizationId: org.id, categoryTypeId: projectTypeCategory!.id, name: typeName },
      });
      projectTypes.set(typeName, item);
    }
  }
  console.log('✅ Created project types');

  // Create vendors
  const vendorParties: Party[] = [];
  for (let i = 0; i < VENDORS_DATA.length; i++) {
    const vendor = VENDORS_DATA[i];
    const party = await prisma.party.create({
      data: {
        organizationId: org.id,
        name: vendor.name,
        phone: vendor.phone.slice(0, -4) + String(vendorOffset + i).padStart(4, '0'),
        location: vendor.location,
        type: 'VENDOR',
      },
    });
    vendorParties.push(party);
  }
  console.log(`✅ Created ${vendorParties.length} vendors`);

  // Create subcontractors
  const subcontractorParties: Party[] = [];
  for (let i = 0; i < SUBCONTRACTORS_DATA.length; i++) {
    const sub = SUBCONTRACTORS_DATA[i];
    const party = await prisma.party.create({
      data: {
        organizationId: org.id,
        name: sub.name,
        phone: sub.phone.slice(0, -4) + String(vendorOffset + 100 + i).padStart(4, '0'),
        location: sub.location,
        type: 'SUBCONTRACTOR',
      },
    });
    subcontractorParties.push(party);
  }
  console.log(`✅ Created ${subcontractorParties.length} subcontractors`);

  // Create labours
  const labourParties: Party[] = [];
  for (let i = 0; i < LABOURS_DATA.length; i++) {
    const labour = LABOURS_DATA[i];
    const party = await prisma.party.create({
      data: {
        organizationId: org.id,
        name: labour.name,
        phone: labour.phone.slice(0, -4) + String(vendorOffset + 200 + i).padStart(4, '0'),
        location: labour.location,
        type: 'LABOUR',
      },
    });
    labourParties.push(party);
  }
  console.log(`✅ Created ${labourParties.length} labour parties`);

  // Create team members
  const teamMemberUsers: User[] = [];
  const teamMemberMemberships: OrganizationMember[] = [];
  for (const member of teamMembersData) {
    const user = await prisma.user.create({
      data: { name: member.name, phone: member.phone, email: member.email, location: member.location },
    });
    const role = orgRoles.get(member.role);
    if (role) {
      const orgMember = await prisma.organizationMember.create({
        data: { organizationId: org.id, userId: user.id, roleId: role.id },
      });
      teamMemberUsers.push(user);
      teamMemberMemberships.push(orgMember);
    }
  }
  console.log(`✅ Created ${teamMemberUsers.length} team members`);

  // Get members by role for assignments
  const supervisors = teamMemberMemberships.filter((m) => m.roleId === orgRoles.get('Supervisor')?.id);
  const siteEngineers = teamMemberMemberships.filter((m) => m.roleId === orgRoles.get('Site Engineer')?.id);
  const projectManagers = teamMemberMemberships.filter((m) => m.roleId === orgRoles.get('Project Manager')?.id);
  const accountants = teamMemberMemberships.filter((m) => m.roleId === orgRoles.get('Accountant')?.id);

  // Stage names
  const stageNames = ['Foundation', 'Framing', 'Plumbing & Electrical', 'Finishing', 'Final Inspection'];
  const stageBudgetPercents = [0.18, 0.28, 0.18, 0.28, 0.08];
  const stageDurations = [45, 60, 45, 55, 25];

  const allProjects: Project[] = [];
  const allStages: Stage[] = [];
  const allBOQSections: BOQSection[] = [];
  const allBOQItems: BOQItem[] = [];
  const allExpenses: Expense[] = [];
  const allTasks: Task[] = [];

  // Process each project
  for (const config of projectConfigs) {
    console.log(`\n📦 Creating project: ${config.name} (${config.scenario})`);

    // Create client
    const client = await prisma.party.create({
      data: {
        organizationId: org.id,
        name: config.clientName,
        phone: config.clientPhone,
        location: config.clientLocation,
        type: 'CLIENT',
      },
    });

    // Create project
    const projectStatus = config.scenario === 'ON_HOLD' ? 'ON_HOLD' : 'ACTIVE';
    const project = await prisma.project.create({
      data: {
        organizationId: org.id,
        name: config.name,
        clientId: client.id,
        location: config.location,
        startDate: config.startDate,
        endDate: config.endDate,
        amount: config.budgetAmount,
        area: config.area,
        projectTypeItemId: projectTypes.get(config.projectType)!.id,
        projectPicture: config.image,
        status: projectStatus,
      },
    });
    allProjects.push(project);

    // Create BOQ Sections
    const projectSections: BOQSection[] = [];
    for (const sectionDef of BOQ_SECTIONS) {
      const section = await prisma.bOQSection.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          name: sectionDef.name,
          sortOrder: sectionDef.sortOrder,
        },
      });
      projectSections.push(section);
      allBOQSections.push(section);
    }

    // Create stages
    const projectStages: Stage[] = [];
    let stageStartDate = new Date(config.startDate);

    for (let i = 0; i < stageNames.length; i++) {
      const stageName = stageNames[i];
      const budgetPercent = stageBudgetPercents[i];
      const duration = stageDurations[i];
      const progress = config.stageProgress[i];

      const stageEndDate = new Date(stageStartDate);
      stageEndDate.setDate(stageEndDate.getDate() + duration);

      let stageStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
      if (config.scenario === 'ON_HOLD' && progress < 100 && progress > 0) {
        stageStatus = 'ON_HOLD';
      } else if (progress === 100) {
        stageStatus = 'COMPLETED';
      } else if (progress > 0) {
        stageStatus = 'IN_PROGRESS';
      } else {
        stageStatus = 'SCHEDULED';
      }

      const stage = await prisma.stage.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          name: stageName,
          description: `${stageName} phase for ${config.name}`,
          startDate: stageStartDate,
          endDate: stageEndDate,
          budgetAmount: Math.round(config.budgetAmount * budgetPercent),
          weight: Math.round(budgetPercent * 100),
          status: stageStatus,
        },
      });
      projectStages.push(stage);
      allStages.push(stage);

      // Create stage member assignments (2-3 supervisors + 1-2 engineers per active stage)
      if (progress > 0) {
        const assignedSupervisors = shuffleArray(supervisors).slice(0, getRandomInt(2, 3));
        for (const supervisor of assignedSupervisors) {
          await prisma.stageMemberAssignment.create({
            data: { stageId: stage.id, memberId: supervisor.id },
          });
        }

        const assignedEngineers = shuffleArray(siteEngineers).slice(0, getRandomInt(1, 2));
        for (const engineer of assignedEngineers) {
          await prisma.stageMemberAssignment.create({
            data: { stageId: stage.id, memberId: engineer.id },
          });
        }
      }

      // Create stage party assignments
      if (progress > 0) {
        // Assign labours based on stage
        const numLabours = progress > 50 ? getRandomInt(3, 5) : getRandomInt(1, 3);
        const assignedLabours = shuffleArray(labourParties).slice(0, numLabours);
        for (const labour of assignedLabours) {
          await prisma.stagePartyAssignment.create({
            data: { stageId: stage.id, partyId: labour.id },
          });
        }

        // Assign subcontractors for MEP and Finishing stages
        if (stageName === 'Plumbing & Electrical' || stageName === 'Finishing') {
          const numSubs = getRandomInt(2, 4);
          const assignedSubs = shuffleArray(subcontractorParties).slice(0, numSubs);
          for (const sub of assignedSubs) {
            await prisma.stagePartyAssignment.create({
              data: { stageId: stage.id, partyId: sub.id },
            });
          }
        }
      }

      // Create tasks for the stage
      const stageTasks = TASK_TEMPLATES.filter((t) => t.stageName === stageName);
      for (const taskTemplate of stageTasks) {
        let taskStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'BLOCKED';
        if (progress === 100) {
          taskStatus = 'COMPLETED';
        } else if (progress >= 80) {
          taskStatus = Math.random() > 0.3 ? 'COMPLETED' : 'IN_PROGRESS';
        } else if (progress >= 50) {
          taskStatus = Math.random() > 0.5 ? 'IN_PROGRESS' : (Math.random() > 0.5 ? 'COMPLETED' : 'NOT_STARTED');
        } else if (progress > 0) {
          taskStatus = Math.random() > 0.7 ? 'IN_PROGRESS' : 'NOT_STARTED';
        } else {
          taskStatus = 'NOT_STARTED';
        }

        if (config.scenario === 'ON_HOLD' && taskStatus === 'IN_PROGRESS') {
          taskStatus = 'ON_HOLD';
        }

        const task = await prisma.task.create({
          data: {
            organizationId: org.id,
            stageId: stage.id,
            name: taskTemplate.name,
            description: taskTemplate.description,
            daysAllocated: taskTemplate.daysAllocated,
            status: taskStatus,
          },
        });
        allTasks.push(task);

        // Create task member assignments for in-progress or completed tasks
        if (taskStatus !== 'NOT_STARTED') {
          const assignedMember = getRandomElement([...supervisors, ...siteEngineers]);
          await prisma.taskMemberAssignment.create({
            data: { taskId: task.id, memberId: assignedMember.id },
          });
        }

        // Create task party assignments
        if (taskStatus !== 'NOT_STARTED') {
          const assignedParty = getRandomElement([...labourParties, ...subcontractorParties]);
          await prisma.taskPartyAssignment.create({
            data: { taskId: task.id, partyId: assignedParty.id },
          });
        }
      }

      stageStartDate = new Date(stageEndDate);
      stageStartDate.setDate(stageStartDate.getDate() + 1);
    }

    // Create BOQ items
    const scaleFactor = config.budgetAmount / 8500000;
    const sectionMap = new Map(projectSections.map((s) => [s.name, s]));
    const stageMap = new Map(projectStages.map((s) => [s.name, s]));

    // Map to track BOQ item to its subTypeName
    const boqItemSubTypeMap = new Map<string, string>();

    for (const template of BOQ_TEMPLATES) {
      const section = sectionMap.get(template.sectionName);
      const stage = stageMap.get(template.stageName);
      const scaledQuantity = Math.max(1, Math.round(template.quantity * scaleFactor));

      const boqItem = await prisma.bOQItem.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          sectionId: section?.id,
          stageId: stage?.id,
          code: template.code,
          description: template.description,
          unit: template.unit,
          quantity: scaledQuantity,
          rate: template.rate,
          category: template.category,
        },
      });
      allBOQItems.push(boqItem);
      
      // Store the subTypeName for this BOQ item
      boqItemSubTypeMap.set(boqItem.id, template.subTypeName);
    }

    // Calculate target expense amount
    const targetExpenseAmount = Math.round(config.budgetAmount * config.targetActualPercent / 100);
    let currentExpenseTotal = 0;
    const projectExpenses: Expense[] = [];

    // Create expenses for each stage based on progress
    for (let i = 0; i < projectStages.length; i++) {
      const stage = projectStages[i];
      const stageProgress = config.stageProgress[i];

      if (stageProgress === 0) continue;

      const stageBOQItems = allBOQItems.filter(
        (item) => item.stageId === stage.id && item.projectId === project.id
      );

      // Create multiple expenses per BOQ item based on progress
      for (const boqItem of stageBOQItems) {
        if (currentExpenseTotal >= targetExpenseAmount * 1.05) break;

        const expensePercent = stageProgress / 100;
        const subTypeName = boqItemSubTypeMap.get(boqItem.id);

        // Determine expense type, sub-type, and party based on BOQ category
        let expenseTypeId: string;
        let materialTypeItemId: string | null = null;
        let labourTypeItemId: string | null = null;
        let subWorkTypeItemId: string | null = null;
        let party: Party;

        if (boqItem.category === 'MATERIAL') {
          expenseTypeId = materialExpense!.id;
          party = getRandomElement(vendorParties);
          // Look up the material type
          if (subTypeName) {
            const materialType = materialTypeMap.get(subTypeName);
            if (materialType) {
              materialTypeItemId = materialType.id;
            }
          }
        } else if (boqItem.category === 'LABOUR') {
          expenseTypeId = labourExpense!.id;
          party = getRandomElement(labourParties);
          // Look up the labour type
          if (subTypeName) {
            const labourType = labourTypeMap.get(subTypeName);
            if (labourType) {
              labourTypeItemId = labourType.id;
            }
          }
        } else if (boqItem.category === 'SUB_WORK') {
          expenseTypeId = subWorkExpense!.id;
          party = getRandomElement(subcontractorParties);
          // Look up the sub work type
          if (subTypeName) {
            const subWorkType = subWorkTypeMap.get(subTypeName);
            if (subWorkType) {
              subWorkTypeItemId = subWorkType.id;
            }
          }
        } else {
          // EQUIPMENT or OTHER - treat as material
          expenseTypeId = materialExpense!.id;
          party = getRandomElement(vendorParties);
        }

        // Create 1-3 expenses per BOQ item for active stages
        const numExpenses = stageProgress > 50 ? getRandomInt(1, 3) : 1;
        for (let e = 0; e < numExpenses; e++) {
          if (currentExpenseTotal >= targetExpenseAmount * 1.05) break;

          let expenseQuantity = Math.round(boqItem.quantity.toNumber() * expensePercent / numExpenses);
          let expenseRate = boqItem.rate.toNumber();

          // Adjust rates for over/under budget scenarios
          if (config.scenario === 'OVER_BUDGET') {
            expenseRate = Math.round(expenseRate * (1.15 + Math.random() * 0.15));
          }
          if (config.scenario === 'UNDER_BUDGET') {
            expenseRate = Math.round(expenseRate * (0.82 + Math.random() * 0.1));
          }

          if (expenseQuantity <= 0) expenseQuantity = 1;

          const expenseAmount = expenseQuantity * expenseRate;
          if (currentExpenseTotal + expenseAmount > targetExpenseAmount * 1.1) continue;

          // Create expense date based on project timeline
          const daysFromStart = Math.round((i * 50 + e * 10 + Math.random() * 30) * expensePercent);
          const expenseDate = new Date(config.startDate);
          expenseDate.setDate(expenseDate.getDate() + daysFromStart);
          if (expenseDate > new Date()) {
            expenseDate.setTime(getDateDaysAgo(getRandomInt(1, 30)).getTime());
          }

          const status = Math.random() > 0.15 ? 'APPROVED' : 'PENDING';

          const expense = await prisma.expense.create({
            data: {
              organizationId: org.id,
              projectId: project.id,
              partyId: party.id,
              stageId: stage.id,
              expenseTypeItemId: expenseTypeId,
              materialTypeItemId,
              labourTypeItemId,
              subWorkTypeItemId,
              rate: expenseRate,
              quantity: expenseQuantity,
              expenseDate,
              status,
              notes: `${boqItem.description.substring(0, 100)}... - ${stage.name}`,
            },
          });
          projectExpenses.push(expense);
          allExpenses.push(expense);
          currentExpenseTotal += expenseAmount;

          // Link expense to BOQ item
          await prisma.bOQExpenseLink.create({
            data: { boqItemId: boqItem.id, expenseId: expense.id },
          });
        }
      }
    }

    console.log(`   Created ${projectExpenses.length} expenses (₹${currentExpenseTotal.toLocaleString()})`);

    // Create payments
    let paymentPercent: number;
    switch (config.scenario) {
      case 'JUST_STARTED':
        paymentPercent = 0.85;
        break;
      case 'ACTIVE_LOW':
      case 'ACTIVE_MID':
        paymentPercent = 0.72;
        break;
      case 'ACTIVE_HIGH':
        paymentPercent = 0.78;
        break;
      case 'NEAR_COMPLETION':
        paymentPercent = 0.92;
        break;
      case 'OVER_BUDGET':
        paymentPercent = 0.68;
        break;
      case 'UNDER_BUDGET':
        paymentPercent = 0.88;
        break;
      case 'ON_HOLD':
        paymentPercent = 0.45;
        break;
      default:
        paymentPercent = 0.7;
    }

    const paymentModes: Array<'CASH' | 'CHEQUE' | 'ONLINE'> = ['CASH', 'CHEQUE', 'ONLINE'];
    let paymentsCreated = 0;
    let paymentCounter = 1;

    for (const expense of projectExpenses) {
      const expenseAmount = expense.rate.toNumber() * expense.quantity.toNumber();
      const shouldPay = Math.random() < paymentPercent;

      if (shouldPay && expense.status === 'APPROVED') {
        const payPercent = 0.85 + Math.random() * 0.15;
        const paymentAmount = Math.round(expenseAmount * payPercent);
        const paymentMode = getRandomElement(paymentModes);
        const recordedBy = getRandomElement([...accountants, ...projectManagers]);

        const paymentDate = new Date(expense.expenseDate.getTime() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000);
        if (paymentDate > new Date()) {
          paymentDate.setTime(getDateDaysAgo(getRandomInt(1, 7)).getTime());
        }

        await prisma.payment.create({
          data: {
            organizationId: org.id,
            projectId: project.id,
            partyId: expense.partyId,
            expenseId: expense.id,
            recordedById: recordedBy.id,
            type: 'OUT',
            paymentMode,
            amount: paymentAmount,
            paymentDate,
            referenceNumber: paymentMode === 'CHEQUE' ? `CHQ-${project.id.slice(-4)}-${String(paymentCounter++).padStart(4, '0')}` :
                           paymentMode === 'ONLINE' ? `TXN-${project.id.slice(-4)}-${String(paymentCounter++).padStart(4, '0')}` : null,
            notes: `Payment for ${expense.notes?.substring(0, 50)}`,
          },
        });
        paymentsCreated++;
      }
    }

    // Create client payments (IN)
    const clientPaymentPercent = config.scenario === 'ON_HOLD' ? 0.35 : (config.scenario === 'JUST_STARTED' ? 0.15 : 0.55);
    const clientPaymentAmount = Math.round(config.budgetAmount * clientPaymentPercent);
    const numClientPayments = config.scenario === 'JUST_STARTED' ? 1 : getRandomInt(3, 5);
    const paymentPerInstallment = Math.round(clientPaymentAmount / numClientPayments);

    for (let i = 0; i < numClientPayments; i++) {
      const daysFromStart = Math.round((i + 1) * 30 + Math.random() * 15);
      const paymentDate = new Date(config.startDate);
      paymentDate.setDate(paymentDate.getDate() + daysFromStart);
      if (paymentDate > new Date()) {
        paymentDate.setTime(getDateDaysAgo(getRandomInt(1, 60)).getTime());
      }

      const recordedBy = getRandomElement(accountants);

      await prisma.payment.create({
        data: {
          organizationId: org.id,
          projectId: project.id,
          partyId: client.id,
          recordedById: recordedBy.id,
          type: 'IN',
          paymentMode: 'ONLINE',
          amount: paymentPerInstallment,
          paymentDate,
          referenceNumber: `INV-${project.id.slice(-4)}-${String(i + 1).padStart(3, '0')}`,
          notes: `Client payment installment ${i + 1} of ${numClientPayments}`,
        },
      });
    }

    console.log(`   Created ${paymentsCreated} vendor payments + ${numClientPayments} client payments`);

    // Create member advances for active projects
    if (config.scenario !== 'JUST_STARTED' && config.scenario !== 'ON_HOLD') {
      const numAdvances = getRandomInt(3, 6);
      for (let i = 0; i < numAdvances; i++) {
        const member = getRandomElement([...supervisors, ...siteEngineers]);
        const purpose = getRandomElement(ADVANCE_PURPOSES);
        const amount = getRandomInt(5, 25) * 1000; // 5k to 25k

        const daysAgo = getRandomInt(5, 60);
        const advanceDate = getDateDaysAgo(daysAgo);
        const expectedSettlement = Math.random() > 0.3 ? new Date(advanceDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

        await prisma.memberAdvance.create({
          data: {
            organizationId: org.id,
            projectId: project.id,
            memberId: member.id,
            amount,
            purpose,
            paymentMode: getRandomElement(paymentModes),
            advanceDate,
            expectedSettlementDate: expectedSettlement,
            notes: `Advance for ${purpose.toLowerCase()} - ${project.name}`,
          },
        });
      }
      console.log(`   Created ${numAdvances} member advances`);
    }
  }

  // Grant project access
  for (const project of allProjects) {
    // Supervisors and engineers get access to 2-4 projects each
    const shuffledSupervisors = shuffleArray(supervisors);
    const shuffledEngineers = shuffleArray(siteEngineers);

    for (let i = 0; i < Math.min(4, shuffledSupervisors.length); i++) {
      await prisma.projectAccess.create({
        data: { memberId: shuffledSupervisors[i].id, projectId: project.id },
      }).catch(() => {}); // Ignore duplicates
    }

    for (let i = 0; i < Math.min(3, shuffledEngineers.length); i++) {
      await prisma.projectAccess.create({
        data: { memberId: shuffledEngineers[i].id, projectId: project.id },
      }).catch(() => {});
    }
  }

  // Project managers have access to all projects
  for (const manager of projectManagers) {
    for (const project of allProjects) {
      await prisma.projectAccess.create({
        data: { memberId: manager.id, projectId: project.id },
      }).catch(() => {});
    }
  }

  console.log('✅ Granted project access to team members');

  return {
    organization: org,
    roles: orgRoles,
    members: teamMemberMemberships,
    vendors: vendorParties,
    subcontractors: subcontractorParties,
    labours: labourParties,
    projects: allProjects,
    stages: allStages,
    boqSections: allBOQSections,
    boqItems: allBOQItems,
    expenses: allExpenses,
    tasks: allTasks,
  };
}

// ============================================
// Main Seed Function
// ============================================

async function main() {
  console.log('🌱 Seeding database with comprehensive realistic data...\n');

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.bOQExpenseLink.deleteMany();
  await prisma.bOQItem.deleteMany();
  await prisma.bOQSection.deleteMany();
  await prisma.taskMemberAssignment.deleteMany();
  await prisma.taskPartyAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.stageMemberAssignment.deleteMany();
  await prisma.stagePartyAssignment.deleteMany();
  await prisma.memberAdvance.deleteMany();
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
  await prisma.rolePermission.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log('✅ Cleanup complete\n');

  // Create global data
  await createGlobalCategoryTypes();
  await createGlobalPermissions();

  // Seed Organization 1: Premier Construction Group
  const premier = await seedOrganization(
    'Premier Construction Group',
    TEAM_MEMBERS_PREMIER,
    PREMIER_PROJECTS,
    1000
  );

  // Seed Organization 2: BuildRight Infrastructure
  const buildright = await seedOrganization(
    'BuildRight Infrastructure',
    TEAM_MEMBERS_BUILDRIGHT,
    BUILDRIGHT_PROJECTS,
    2000
  );

  // ============================================
  // Summary
  // ============================================

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEEDING COMPLETE!');
  console.log('='.repeat(60));

  console.log('\n📊 PREMIER CONSTRUCTION GROUP:');
  console.log(`   - Projects: ${premier.projects.length}`);
  console.log(`   - Stages: ${premier.stages.length}`);
  console.log(`   - BOQ Sections: ${premier.boqSections.length}`);
  console.log(`   - BOQ Items: ${premier.boqItems.length}`);
  console.log(`   - Expenses: ${premier.expenses.length}`);
  console.log(`   - Tasks: ${premier.tasks.length}`);
  console.log(`   - Team Members: ${premier.members.length}`);
  console.log(`   - Vendors: ${premier.vendors.length}`);
  console.log(`   - Subcontractors: ${premier.subcontractors.length}`);
  console.log(`   - Labour Parties: ${premier.labours.length}`);

  console.log('\n📊 BUILDRIGHT INFRASTRUCTURE:');
  console.log(`   - Projects: ${buildright.projects.length}`);
  console.log(`   - Stages: ${buildright.stages.length}`);
  console.log(`   - BOQ Sections: ${buildright.boqSections.length}`);
  console.log(`   - BOQ Items: ${buildright.boqItems.length}`);
  console.log(`   - Expenses: ${buildright.expenses.length}`);
  console.log(`   - Tasks: ${buildright.tasks.length}`);
  console.log(`   - Team Members: ${buildright.members.length}`);
  console.log(`   - Vendors: ${buildright.vendors.length}`);
  console.log(`   - Subcontractors: ${buildright.subcontractors.length}`);
  console.log(`   - Labour Parties: ${buildright.labours.length}`);

  console.log('\n📁 PROJECT SCENARIOS (Premier):');
  console.log('   Active (4): Sunrise Apartments, Metro Plaza, Green Valley Villas, Tech Park');
  console.log('   Near Completion (2): Riverside Heights, City Center Mall');
  console.log('   Just Started (1): Lakeside Business Park');
  console.log('   On Hold (1): Heritage Hotel');

  console.log('\n📁 PROJECT SCENARIOS (BuildRight):');
  console.log('   Active (4): Highway Bridge, Warehouse Complex, Metro Station, Solar Plant');
  console.log('   Over Budget (1): City Hospital');
  console.log('   Under Budget (1): Government School');

  console.log('\n👤 TEST CREDENTIALS:');
  console.log(`   Premier Admin: rajesh.admin@premier.com`);
  console.log(`   BuildRight Admin: sanjay.admin@buildright.com`);

  console.log('\n💡 API HEADERS FOR TESTING:');
  console.log(`   Premier: x-organization-id: ${premier.organization.id}`);
  console.log(`   BuildRight: x-organization-id: ${buildright.organization.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
