import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";
import bcrypt from "bcrypt";

export const addUser = async (res: Response, body: any) => {
  body.password = bcrypt.hashSync(body.password, 10);
  let user = await prisma.user.create({ data: body });
  return res.status(201).json(user);
};

export const getAllUser = async (res: Response, query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  const apiFeatures = new ApiFeatures(prisma.user, query);

  await apiFeatures.filter(baseFilter).sort().limitedFields().search("user");

  await apiFeatures.paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("user");
  return res.status(200).json({
    data: result,
    pagination: pagination,
  });
};

export const profile = async (req: Request, res: Response) => {
  let user = req.user;
  return res.status(201).json(user);
};

export const getUser = async (res: Response, id: number) => {
  let user = await getUserById(id);
  if (!user) throw new ApiError("user not found", 404);
  return res.status(201).json(user);
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

export const updateUser = async (res: Response, id: number, body: any) => {
  let user = await getUserById(id);
  if (!user) throw new ApiError("user not found", 404);
  await prisma.user.update({
    where: { id },
    data: body,
  });
  return res.status(201).json({ message: "user updated successfully", user });
};

export const changePassword = async (res: Response, id: number, body: any) => {
  let user = await getUserById(id);
  if (!user) throw new ApiError("user not found", 404);
  if (!bcrypt.compareSync(body.currentPassword, user.password)) {
    throw new ApiError("Your Current Password is incorrect");
  }
  body.password = bcrypt.hashSync(body.password, 8);
  await prisma.user.update({
    where: { id },
    data: {
      password: body.password,
    },
  });
  return res.status(201).json({ message: "user updated successfully" });
};

export const deactiveUser = async (
  res: Response,
  id: number,
  userId: number
) => {
  let user = await getUserById(id);
  if (!user) throw new ApiError("user not found", 404);
  if (userId === id) {
    throw new ApiError("you not allow to deactive your Account ..!", 401);
  }
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
  let updatedUser = await getUserById(id);

  return res
    .status(201)
    .json({ message: "user Deactivated successfully", updatedUser });
};

export const deleteUser = async (res: Response, id: number, userId: number) => {
  let user = await getUserById(id);
  if (!user) throw new ApiError("user not found", 404);
  if (userId === id) {
    throw new ApiError("you not allow to delete your Account ..!", 401);
  }
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
  let updatedUser = await getUserById(id);

  return res
    .status(201)
    .json({ message: "user Deleted successfully", updatedUser });
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

export const login = async (res: Response, body: any) => {
  let user = await findUser(body);

  if (!(user && bcrypt.compareSync(body.password, user.password))) {
    throw new ApiError("email or password incorrect");
  } else {
    // Generate JWT token
    let token = jwt.sign({ userId: user.id }, process.env.JWT_KEY!);

    // Fetch user's direct permissions
    const userPermissions = await getUserPermissions(user);

    // Fetch user's role
    const userRole = await getUserRole(user);

    // Fetch permissions related to the user's role
    const rolePermissions = userRole
      ? await getPermissionRelatedWithRole(userRole)
      : [];

    // Extract unique permissions for the response
    const allPermissions = new Set([
      ...userPermissions.map((up) => up.permission.name),
      ...rolePermissions.map((rp) => rp.permission.name),
    ]);

    // Return response with token and combined unique permissions
    return res.status(200).json({
      token,
      permissions: Array.from(allPermissions),
    });
  }
};
