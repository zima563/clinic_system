import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";

export const patientExist = async (phone: string) => {
  if (phone) {
    let patient = await prisma.patient.findUnique({
      where: { phone },
    });
    if (patient) {
      throw new ApiError("patient's phone already exist");
    }
  }
};
