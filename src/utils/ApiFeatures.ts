import { PrismaClient, User } from "@prisma/client";

class ApiFeatures {
  private prismaModel: any;
  private searchQuery: any;
  private prismaQuery: any;
  private paginationResult?: any;

  constructor(prismaModel: any, searchQuery: any) {
    this.prismaModel = prismaModel;
    this.searchQuery = searchQuery;
    this.prismaQuery = { where: {} };
  }

  get query() {
    return this.prismaQuery;
  }

  filter(baseFilter = {}) {
    let filterObj = { ...baseFilter, ...this.searchQuery };
    let excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "keyword_phone",
      "keyword",
    ];
    excludedFields.forEach((val) => {
      delete filterObj[val];
    });

    if (this.searchQuery.patientId) {
      this.prismaQuery.where.details = {
        some: {
          patientId: this.searchQuery.patientId, // Correct filter on VisitDetail for patientId
        },
      };
      delete filterObj.patientId;
    }
    // Filter by specific day (YYYY-MM-DD)
    if (this.searchQuery.day) {
      const date = new Date(this.searchQuery.day);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
      this.prismaQuery.where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Merge remaining filters
    this.prismaQuery.where = { ...this.prismaQuery.where, ...filterObj };
    return this;
  }

  sort() {
    const sortBy = this.searchQuery.sort
      ? this.searchQuery.sort.split(",").reduce((acc: any, field: string) => {
          const [key, order] = field.split(":");
          acc[key] = order === "desc" ? "desc" : "asc";
          return acc;
        }, {})
      : { createdAt: "asc" };
    this.prismaQuery.orderBy = sortBy;
    return this;
  }

  limitedFields() {
    if (this.searchQuery.fields) {
      const fields = this.searchQuery.fields
        .split(",")
        .map((field: string) => field.trim());
      this.prismaQuery.select = fields.reduce((acc: any, field: string) => {
        acc[field] = true;
        return acc;
      }, {});
    } else {
      delete this.prismaQuery.select;
    }
    return this;
  }

  search(modelName: string) {
    if (this.searchQuery.keyword || this.searchQuery.keyword_phone) {
      const keyword_phone = this.searchQuery.keyword_phone?.toLowerCase() || "";
      const keyword = this.searchQuery.keyword?.toLowerCase() || "";

      if (modelName === "patient") {
        this.prismaQuery.where = {
          OR: [
            keyword_phone ? { phone: { contains: keyword_phone } } : undefined,
            keyword ? { name: { contains: keyword } } : undefined,
          ].filter(Boolean), // إزالة القيم undefined
        };
      } else {
        this.prismaQuery.where = {
          ...this.prismaQuery.where,
          ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
        };
      }
    }
    return this;
  }

  async paginateWithCount() {
    const page = this.searchQuery.page * 1 || 1;
    const limit = this.searchQuery.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Correct where condition for the count query
    const countDocuments = await this.prismaModel.count({
      where: this.prismaQuery.where, // This should now contain the correct where clause
    });

    this.paginationResult = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(countDocuments / limit),
    };

    if (endIndex < countDocuments) {
      this.paginationResult.next = page + 1;
    }
    if (skip > 0) {
      this.paginationResult.prev = page - 1;
    }

    this.prismaQuery.skip = skip;
    this.prismaQuery.take = limit;

    return this;
  }

  async exec(modelName: string) {
    if (!this.prismaQuery.select) {
      delete this.prismaQuery.select;
    }

    // Adjust where conditions based on the model
    if (modelName === "category") {
      this.prismaQuery.include = {
        parentCategory: true,
      };
    } else if (modelName === "product") {
      this.prismaQuery.include = {
        category: true,
      };
    } else if (modelName === "user") {
      this.prismaQuery.include = {
        userRoles: true,
        userPermissions: true,
      };
    } else if (modelName === "schedule") {
      this.prismaQuery.include = {
        dates: true,
      };
    } else if (modelName === "visit") {
      this.prismaQuery.include = {
        details: {
          include: {
            patient: true,
            schedule: true,
          },
        },
      };
    }

    const result = await this.prismaModel.findMany({
      ...this.prismaQuery,
    });

    return {
      result,
      pagination: this.paginationResult,
    };
  }
}

export default ApiFeatures;
