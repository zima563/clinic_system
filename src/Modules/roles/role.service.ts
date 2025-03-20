import { Response } from "express";
import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

export const roleExist = async (name: string) => {
  return prisma.role.findFirst({ where: { name } });
};

export const createRole = async (res: Response, body: any) => {
  if (await roleExist(body.name))
    throw new ApiError("this role name already exist", 409);

  const role = await prisma.role.create({ data: body });
  return res.status(200).json(role);
};

export const listRole = async (res: Response, query: any) => {
  const apiFeatures = new ApiFeatures(prisma.role, query);

  await apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount(); // Get the total count for pagination

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("role");

  return res.status(200).json({
    data: result,
    pagination: pagination,
  });
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
  res: Response,
  userId: number,
  roleId: string,
  id: number
) => {
  if (!(await getUser(userId))) {
    throw new ApiError("user not found", 404);
  } else if (!(await getRole(roleId))) {
    throw new ApiError("role not found", 404);
  }
  if (userId === id) {
    throw new ApiError("you not allow to change your Role ..!", 401);
  }
  await prisma.userRole.deleteMany({
    where: {
      userId,
    },
  });
  await prisma.userRole.create({
    data: {
      userId,
      roleId: parseInt(roleId, 10),
    },
  });
  return res.json({ message: "assigning role to user successfully" });
};

export const listRoleUser = async (res: Response, id: number) => {
  let all = await prisma.userRole.findMany({
    where: { userId: id },
    include: {
      user: true,
      role: true,
    },
  });
  res.status(200).json(all);
};

export const getRoleById = async (id: number) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: true,
    },
  });
};

export const updateRole = async (res: Response, id: number, body: any) => {
  if (!(await getRoleById(id))) throw new ApiError("role not found");

  if (await roleExist(body.name)) {
    throw new ApiError("this role name already exist", 409);
  }
  await prisma.role.update({
    where: { id },
    data: body,
  });
  return res.status(200).json({ message: "role updated successfully" });
};

export const DeleteRole = async (res: Response, id: number) => {
  if (!(await getRoleById(id))) {
    throw new ApiError("role not found");
  }
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
  return res.status(200).json({ message: "role deleted successfully" });
};
