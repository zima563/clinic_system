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
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  
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
  console.log(`✅ Admin user ready (ID: ${adminUser.id}, Email: admin@clinic.com, Password: Admin@123).`);

  // 3. Create Default Roles & Assign Permissions
  console.log('🛡️ Seeding Default Clinic Roles & Permissions...');

  const roleDefinitions = [
    {
      name: 'Admin',
      description: 'Full Access to all modules',
      permissions: permissionsList // All permissions
    },
    {
      name: 'Doctor',
      description: 'Access to doctor schedules, appointments, patients, and visit details',
      permissions: [
        'listDoctors',
        'showDoctorDetails',
        'listPatient',
        'getPatient',
        'getAppointment',
        'showAppointmnetDetail',
        'listSchedules',
        'showScheduleDetails',
        'getAllVisits',
        'showVisitDetails',
        'profile',
        'updateUserProfile',
        'ChangePassword'
      ]
    },
    {
      name: 'Receptionist',
      description: 'Access to patient intake, appointments, schedules, and visits creation',
      permissions: [
        'addPatient',
        'updatePatient',
        'listPatient',
        'getPatient',
        'addAppointment',
        'updateStatus',
        'updateAppointment',
        'getAppointment',
        'showAppointmnetDetail',
        'createVisit',
        'getAllVisits',
        'showVisitDetails',
        'listSchedules',
        'allServices',
        'allSpecialtys',
        'listDoctors',
        'showDoctorDetails',
        'profile',
        'updateUserProfile',
        'ChangePassword'
      ]
    },
    {
      name: 'Accountant',
      description: 'Access to invoices, income, expenses, visits, and financial reports',
      permissions: [
        'createInvoice',
        'listInvoice',
        'updateInvoiceDetail',
        'Show_Invoice_Details',
        'List_Invoice_Details',
        'Append_Invoice_Details',
        'Remove_Invoice_Details',
        'deleteInvoice',
        'getAllVisits',
        'showVisitDetails',
        'summarized_report',
        'downloadPdf',
        'profile',
        'updateUserProfile',
        'ChangePassword'
      ]
    }
  ];

  let adminRole: any = null;

  for (const roleDef of roleDefinitions) {
    let role = await prisma.role.findFirst({ where: { name: roleDef.name } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleDef.name,
          createdBy: adminUser.id
        }
      });
    }
    if (roleDef.name === 'Admin') adminRole = role;

    // Map permissions for this role
    for (const permName of roleDef.permissions) {
      const permObj = allPermissions.find(p => p.name === permName);
      if (permObj) {
        const existingRP = await prisma.rolePermission.findFirst({
          where: { roleId: role.id, permissionId: permObj.id }
        });
        if (!existingRP) {
          await prisma.rolePermission.create({
            data: { roleId: role.id, permissionId: permObj.id }
          });
        }
      }
    }
  }

  // Assign Admin Role to Admin User
  if (adminRole) {
    const userRoleExisting = await prisma.userRole.findFirst({
      where: { userId: adminUser.id, roleId: adminRole.id }
    });
    if (!userRoleExisting) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      });
    }
  }

  // Assign all direct permissions to Admin User
  for (const perm of allPermissions) {
    const existing = await prisma.userPermission.findFirst({
      where: { userId: adminUser.id, permissionId: perm.id }
    });
    if (!existing) {
      await prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: perm.id
        }
      });
    }
  }
  console.log('✅ Default Roles (Admin, Doctor, Receptionist, Accountant) & permissions assigned successfully.');

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

  // 6. Seed Doctors
  console.log('👨‍⚕️ Seeding doctors...');
  const firstSpecialty = await prisma.specialty.findFirst();
  const doctors = [
    {
      name: 'Dr. Ahmed Ragab',
      phone: '01011112222',
      image: 'default-doctor.png',
      info: 'Senior Consultant Surgeon',
      specialtyId: firstSpecialty?.id || 1,
    },
    {
      name: 'Dr. Marina Ehab',
      phone: '01033334444',
      image: 'default-doctor.png',
      info: 'Specialist Physician',
      specialtyId: firstSpecialty?.id || 1,
    },
    {
      name: 'Dr. Mohamed Hassan',
      phone: '01055556666',
      image: 'default-doctor.png',
      info: 'Consultant Specialist',
      specialtyId: firstSpecialty?.id || 1,
    },
  ];

  for (const doc of doctors) {
    const existingDoc = await prisma.doctor.findFirst({ where: { phone: doc.phone } });
    if (!existingDoc) {
      await prisma.doctor.create({
        data: {
          name: doc.name,
          phone: doc.phone,
          image: doc.image,
          info: doc.info,
          specialtyId: doc.specialtyId,
          createdBy: adminUser.id,
        },
      });
    }
  }
  console.log('✅ Doctors seeded successfully.');

  // 7. Seed Default Schedules
  console.log('📅 Seeding default schedules...');
  const firstDoc = await prisma.doctor.findFirst();
  const firstServ = await prisma.service.findFirst();

  if (firstDoc && firstServ) {
    const existingSched = await prisma.schedule.findFirst({
      where: { doctorId: firstDoc.id, servicesId: firstServ.id },
    });

    if (!existingSched) {
      await prisma.schedule.create({
        data: {
          doctorId: firstDoc.id,
          servicesId: firstServ.id,
          price: 300,
          createdBy: adminUser.id,
          dates: {
            create: [
              { day: 'Sunday', fromTime: '09:00 AM', toTime: '01:00 PM' },
              { day: 'Wednesday', fromTime: '02:00 PM', toTime: '06:00 PM' },
            ],
          },
        },
      });
    }
  }
  console.log('✅ Schedules seeded successfully.');

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
