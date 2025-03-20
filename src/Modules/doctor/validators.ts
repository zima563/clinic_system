import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";

export const validateDoctor = async (phone: string) => {
  if (phone) {
    if (await prisma.doctor.findFirst({ where: { phone } })) {
      throw new ApiError("doctor with this phone already exists");
    }
  }
};

export const validateSpecialty = async (id: string) => {
  if (id) {
    if (
      !(await prisma.specialty.findUnique({
        where: { id: parseInt(id, 10) },
      }))
    ) {
      throw new ApiError("specialtyId not found");
    }
  }
};

export const validatePhone = async (phone: string, id: number) => {
  if (phone) {
    if (
      await prisma.doctor.findFirst({
        where: { phone, NOT: { id } },
      })
    ) {
      throw new ApiError("doctor with this phone already exists");
    }
  }
};
