import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

export const roleExist = async (name: string) => {
  return prisma.role.findFirst({ where: { name } });
};

export const createRole = async (body: any) => {
  return prisma.role.create({ data: body });
};

export const listRole = async (query: any) => {
  const apiFeatures = new ApiFeatures(prisma.role, query);

  await apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount(); // Get the total count for pagination

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("role");

  return {
    result,
    pagination,
  };
};

export const getUser = async (userId: number) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const getRole = async (roleId: string) => {
  return prisma.role.findUnique({
    where: { id: parseInt(roleId, 10) },
  });
};

export const assignRoleToUser = async (
  userId: number,
  roleId: string,
  id: number
) => {
  if (userId === id) {
    throw new ApiError("you not allow to deactive your Account ..!", 401);
  }
  await prisma.userRole.deleteMany({
    where: {
      userId,
    },
  });
  return prisma.userRole.create({
    data: {
      userId,
      roleId: parseInt(roleId, 10),
    },
  });
};

export const listRoleUser = async (id: number) => {
  return prisma.userRole.findMany({
    where: { userId: id },
    include: {
      user: true,
      role: true,
    },
  });
};

export const getRoleById = async (id: number) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: true,
    },
  });
};

export const updateRole = async (id: number, body: any) => {
  return prisma.role.update({
    where: { id },
    data: body,
  });
};

export const DeleteRole = async (id: number) => {
  await prisma.userRole.deleteMany({
    where: {
      roleId: id,
    },
  });
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: id,
    },
  });
  await prisma.role.delete({
    where: { id },
  });
};
