import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";

export const addDoctor = async (body: any) => {
  return prisma.doctor.create({
    data: {
      ...body,
    },
  });
};

export const updateDoctor = async (
  id: number,
  fileName: string | undefined,
  body: any
) => {
  return prisma.doctor.update({
    where: { id },
    data: {
      image: fileName,
      ...body,
    },
  });
};

export const getDoctors = async (query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  // Initialize ApiFeatures with the Prisma model and the search query
  const apiFeatures = new ApiFeatures(prisma.doctor, query);

  // Apply filters, sorting, field selection, search, and pagination
  await apiFeatures.filter(baseFilter).sort().limitedFields().search("doctor"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount();

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("doctor");
  result.map((doc: any) => {
    doc.image = process.env.base_url + doc.image;
  });

  return { result, pagination };
};

export const getDoctor = async (id: number) => {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          userName: true,
        },
      },
    },
  });
};

export const deactiveOrActive = async (id: number) => {
  await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};
