import { Response } from "express";
import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import { permissions } from "./permissions";

export const getUser = async (userId: number) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const getRole = async (roleId: number) => {
  return prisma.role.findUnique({ where: { id: roleId } });
};

export const seeder = async (res: Response) => {
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
  return res.status(201).json({
    status: "success",
    message: "Permissions seeded successfully",
  });
};

export const assignPermissionToUser = async (
  res: Response,
  id: number,
  body: any,
  userId: number
) => {
  if (userId === id) {
    throw new ApiError("you not allow to change your Permissions ..!", 401);
  }
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
  return res.status(200).json({
    message: "Permissions assigned to user successfully",
  });
};

export const assignPermissionToRole = async (
  res: Response,
  id: number,
  body: any
) => {
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
  return res.status(200).json({
    message: "Permissions assigned to role successfully",
  });
};

export const listPermissions = async (res: Response) => {
  let permissions = await prisma.permission.findMany();
  return res.status(200).json({
    data: permissions,
    count: permissions.length,
  });
};

export const listPermissionOfUser = async (res: Response, userId: number) => {
  if (!(await getUser(userId))) {
    throw new ApiError("user not found", 404);
  }
  const permissions = await prisma.userPermission.findMany({
    where: { userId },
    include: {
      permission: true,
    },
  });
  return res.status(200).json({
    data: permissions,
    count: permissions.length,
  });
};

export const listPermissionOfRole = async (res: Response, roleId: number) => {
  if (!(await getRole(roleId))) {
    throw new ApiError("role not found", 404);
  }
  let permissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true,
    },
  });
  return res.status(200).json({
    data: permissions,
    count: permissions.length,
  });
};
