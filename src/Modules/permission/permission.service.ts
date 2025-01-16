import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import { permissions } from "./permissions";

export const seeder = async () => {
  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany();
    await tx.userPermission.deleteMany();
    await tx.permission.deleteMany();

    for (const permission of permissions) {
      await tx.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
  });
};

export const assignPermissionToUser = async (id: number, body: any) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userPermissions: true,
    },
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Fetch permissions by name
  const permissions = await prisma.permission.findMany({
    where: {
      name: { in: body.permissionNames },
    },
  });

  if (permissions.length !== body.permissionNames.length) {
    throw new ApiError("One or more permissions not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.userPermission.deleteMany({ where: { userId: id } });
    const userPermissions = permissions.map((permission) => ({
      userId: id,
      permissionId: permission.id,
    }));
    await tx.userPermission.createMany({
      data: userPermissions,
    });
  });
};

export const assignPermissionToRole = async (id: number, body: any) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: true,
    },
  });
  if (!role) {
    throw new ApiError("Role not found", 404);
  }

  // Fetch permissions by name
  const permissions = await prisma.permission.findMany({
    where: {
      name: { in: body.permissionNames },
    },
  });

  if (permissions.length !== body.permissionNames.length) {
    throw new ApiError("One or more permissions not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    const rolePermissions = permissions.map((permission) => ({
      roleId: id,
      permissionId: permission.id,
    }));
    await tx.rolePermission.createMany({
      data: rolePermissions,
    });
  });
};

export const listPermissions = async () => {
  return prisma.permission.findMany();
};

export const listPermissionOfUser = async (userId: number) => {
  return prisma.userPermission.findMany({
    where: { userId },
    include: {
      permission: true,
    },
  });
};

export const listPermissionOfRole = async (roleId: number) => {
  return prisma.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true,
    },
  });
};

export const getUser = async (userId: number) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const getRole = async (roleId: number) => {
  return prisma.role.findUnique({ where: { id: roleId } });
};
