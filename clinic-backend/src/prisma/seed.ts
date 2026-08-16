import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissionsList = [
  "addAppointment",
  "getPatientAppointment",
  "getAppointment",
  "showAppointmnetDetail",
  "updateStatus",
  "updateAppointment",
  "addDoctor",
  "updateDoctor",
  "listDoctors",
  "showDoctorDetails",
  "DeactiveDoctor",
  "createInvoice",
  "listInvoice",
  "updateInvoiceDetail",
  "Show_Invoice_Details",
  "List_Invoice_Details",
  "Append_Invoice_Details",
  "Remove_Invoice_Details",
  "addPatient",
  "updatePatient",
  "listPatient",
  "getPatient",
  "createRole",
  "allRoles",
  "assignRoleToUser",
  "getAllRoleUsers",
  "updateRole",
  "deleteRole",
  "addSchedule",
  "listSchedules",
  "showScheduleDetails",
  "updateSchedule",
  "deleteSchedule",
  "addService",
  "allServices",
  "updateService",
  "getService",
  "deactiveService",
  "createSpecialty",
  "updateSpecialty",
  "allSpecialtys",
  "getOneSpecialty",
  "addUser",
  "allUsers",
  "getOneUser",
  "updateUser",
  "deactiveUser",
  "DeleteUser",
  "createVisit",
  "showVisitDetails",
  "getAllVisits",
  "appendVisitDetails",
  "removeVisitDetails",
  "deleteVisit",
  "summarized_report",
  "downloadPdf",
  "listDates",
  "search",
  "seedPermissions",
  "assignPermissionsToUser",
  "assignPermissionsToRole",
  "ListPermissions",
  "ListUserPermissions",
  "ListRolePermissions",
  "deleteInvoice",
  "profile",
  "updateUserProfile",
  "ChangePassword"
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Permissions
  console.log('🔑 Seeding permissions...');
  for (const permName of permissionsList) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName },
    });
  }
  const allPermissions = await prisma.permission.findMany();
  console.log(`✅ Seeded ${allPermissions.length} permissions.`);

  // 2. Create Default Admin User
  console.log('👤 Seeding default Admin user...');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    update: {
      password: hashedPassword,
      isActive: true,
      isDeleted: false,
    },
    create: {
      userName: 'Admin',
      email: 'admin@clinic.com',
      phone: '01000000000',
      password: hashedPassword,
      isActive: true,
      isDeleted: false,
    },
  });
  console.log(`✅ Admin user ready (ID: ${adminUser.id}, Email: admin@clinic.com, Password: admin123).`);

  // 3. Create Default Admin Role
  console.log('🛡️ Seeding Admin role...');
  let adminRole = await prisma.role.findFirst({
    where: { name: 'Admin' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        createdBy: adminUser.id,
      },
    });
  }

  // Assign all permissions to Admin Role
  for (const perm of allPermissions) {
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: perm.id },
    });
    if (!existing) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Assign Admin Role to Admin User
  const userRoleExisting = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: adminRole.id },
  });
  if (!userRoleExisting) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  // Assign all direct permissions to Admin User
  for (const perm of allPermissions) {
    const existing = await prisma.userPermission.findFirst({
      where: { userId: adminUser.id, permissionId: perm.id },
    });
    if (!existing) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log('✅ Admin role & permissions assigned successfully.');

  // 4. Seed Specialties
  console.log('🩺 Seeding specialties...');
  const specialties = [
    { title: 'General Surgery / الجراحة العامة', icon: 'stethoscope' },
    { title: 'Cardiology / طب القلب', icon: 'heart' },
    { title: 'Dentistry / طب الأسنان', icon: 'tooth' },
    { title: 'Pediatrics / طب الأطفال', icon: 'baby' },
    { title: 'Orthopedics / طب العظام', icon: 'bone' },
  ];

  for (const spec of specialties) {
    await prisma.specialty.upsert({
      where: { title: spec.title },
      update: {},
      create: {
        title: spec.title,
        icon: spec.icon,
        createdBy: adminUser.id,
      },
    });
  }
  console.log('✅ Specialties seeded successfully.');

  // 5. Seed Services
  console.log('💉 Seeding services...');
  const services = [
    { title: 'General Consultation / كشف عام', desc: 'Comprehensive medical consultation', img: 'default.jpg' },
    { title: 'Follow-up Visit / إعادة كشف', desc: 'Follow-up examination', img: 'default.jpg' },
    { title: 'Emergency Care / طوارئ', desc: 'Urgent medical examination', img: 'default.jpg' },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({ where: { title: service.title } });
    if (!existing) {
      await prisma.service.create({
        data: {
          title: service.title,
          desc: service.desc,
          img: service.img,
          createdBy: adminUser.id,
        },
      });
    }
  }
  console.log('✅ Services seeded successfully.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
