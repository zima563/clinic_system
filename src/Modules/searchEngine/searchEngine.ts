import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import {
  Get,
  JsonController,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
import MeiliSearch from "meilisearch";

const prisma = new PrismaClient();

const meilisearch = new MeiliSearch({
  host: "http://127.0.0.1:7700", // Replace with your Meilisearch host
  apiKey: "clinic", // Replace with your API key if applicable
});

async function indexData() {
  try {
    console.log("Fetching data for indexing...");

    // Fetch data with required fields
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        specialtyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log(doctors);

    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        gender: true,
        birthdate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const services = await prisma.service.findMany();
    const specialties = await prisma.specialty.findMany();

    console.log("Data fetched. Preparing to index...");

    // Index data to Meilisearch with unique IDs
    await meilisearch
      .index("doctors")
      .addDocuments(doctors, { primaryKey: "id" });
    console.log("Doctors indexed successfully.");

    await meilisearch
      .index("patients")
      .addDocuments(patients, { primaryKey: "id" });
    console.log("Patients indexed successfully.");

    await meilisearch
      .index("services")
      .addDocuments(services, { primaryKey: "id" });
    console.log("Services indexed successfully.");

    await meilisearch
      .index("specialties")
      .addDocuments(specialties, { primaryKey: "id" });
    console.log("Specialties indexed successfully.");

    console.log("Data indexed successfully.");
  } catch (error) {
    console.error("Error indexing data:", error);
  }
}

@JsonController("/api/search")
export class searchControllers {
  @Get("/")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("search"))
  async search(
    @Req() req: Request,
    @QueryParams() query: any,
    @Res() res: Response
  ) {
    const { keyword } = query;
    if (!keyword) {
      return res
        .status(400)
        .json({ message: "Keyword is required for search" });
    }
    // Ensure data is indexed before searching
    await indexData();

    const results = await Promise.all([
      meilisearch.index("doctors").search(keyword),
      meilisearch.index("patients").search(keyword),
      meilisearch.index("services").search(keyword),
      meilisearch.index("specialties").search(keyword),
    ]);

    return res.status(200).json({
      doctors: results[0].hits,
      patients: results[1].hits,
      services: results[2].hits,
      specialties: results[3].hits,
    });
  }
}
