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
  const doctors = await prisma.doctor.findMany();
  const patients = await prisma.patient.findMany();
  const services = await prisma.service.findMany();
  const specialties = await prisma.specialty.findMany();

  // Index data to Meilisearch with unique IDs
  await meilisearch
    .index("doctors")
    .addDocuments(doctors, { primaryKey: "id" });

  await meilisearch
    .index("patients")
    .addDocuments(patients, { primaryKey: "id" });

  await meilisearch
    .index("services")
    .addDocuments(services, { primaryKey: "id" });

  await meilisearch
    .index("specialties")
    .addDocuments(specialties, { primaryKey: "id" });
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
