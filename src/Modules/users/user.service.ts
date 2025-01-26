import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const addUser = async (body: any) => {
  return prisma.user.create({ data: body });
};

export const getAllUser = async (query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  const apiFeatures = new ApiFeatures(prisma.user, query);

  await apiFeatures.filter(baseFilter).sort().limitedFields().search("user");

  await apiFeatures.paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("user");
  return {
    result,
    pagination,
  };
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        select: {
          role: true,
        },
      },
      userPermissions: {
        select: {
          permission: true,
        },
      },
    },
  });
};

export const updateUser = async (id: number, body: any) => {
  return await prisma.user.update({
    where: { id },
    data: body,
  });
};

export const deactiveUser = async (id: number, user: any) => {
  if (user.isActive) {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }
};

export const deleteUser = async (id: number, user: any) => {
  if (!user.isDeleted) {
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  } else {
    await prisma.user.update({
      where: { id },
      data: { isDeleted: false },
    });
  }
};

export const findUser = async (body: any) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ phone: body.emailOrPhone }, { email: body.emailOrPhone }],
    },
  });
};

export const getUserPermissions = async (user: any) => {
  return await prisma.userPermission.findMany({
    where: { userId: user.id },
    include: { permission: true },
  });
};

export const getUserRole = async (user: any) => {
  return await prisma.userRole.findFirst({
    where: { userId: user.id },
    include: { role: true },
  });
};

export const getPermissionRelatedWithRole = async (userRole: any) => {
  return await prisma.rolePermission.findMany({
    where: { roleId: userRole.roleId },
    include: { permission: true },
  });
};
