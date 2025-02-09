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

    if (this.searchQuery.createdAt) {
      const date = new Date(this.searchQuery.createdAt);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
      this.prismaQuery.where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
      delete filterObj.createdAt;
    }

    if (this.searchQuery.dateTime) {
      const date = new Date(this.searchQuery.dateTime);
      const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
      this.prismaQuery.where.dateTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
      delete filterObj.dateTime;
    }

    if (this.searchQuery.ex !== undefined) {
      this.prismaQuery.where.ex = this.searchQuery.ex === "1";
      delete filterObj.ex;
    }

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
      } else if (modelName === "doctor") {
        this.prismaQuery.where = {
          OR: [
            keyword
              ? { name: { contains: keyword, mode: "insensitive" } }
              : undefined,
            keyword
              ? { phone: { contains: keyword, mode: "insensitive" } }
              : undefined,
          ].filter(Boolean),
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

    if (modelName === "user") {
      this.prismaQuery.include = {
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
      };
    } else if (modelName === "schedule") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
        doctorId: false,
        servicesId: false,
        dates: {
          select: {
            id: true,
            fromTime: true,
            toTime: true,
            day: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      };
    } else if (modelName === "visit") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
        details: {
          select: {
            id: true,
            price: true,
            patient: {
              select: {
                id: true,
                name: true,
              },
            },
            schedule: {
              select: {
                id: true,
                price: true,
                service: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
                doctor: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            date: {
              select: {
                id: true,
                fromTime: true,
                toTime: true,
              },
            },
          },
        },
      };
    } else if (modelName === "doctor") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
        specialty: {
          select: {
            title: true,
            icon: true,
          },
        },
      };
    } else if (modelName === "invoice") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
        VisitInvoice: {
          select: {
            visit: {
              select: {
                details: {
                  select: {
                    patient: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        details: {
          select: {
            id: true,
            description: true,
          },
        },
      };
    } else if (modelName === "service") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
      };
    } else if (modelName === "specialty") {
      this.prismaQuery.include = {
        creator: {
          select: {
            userName: true,
          },
        },
      };
    } else if (modelName === "role") {
      this.prismaQuery.include = {
        rolePermissions: {
          select: {
            permission: true,
          },
        },
      };
    } else if (modelName === "appointment") {
      this.prismaQuery.include = {
        select: {
          id: true,
          dateTime: true,
          status: true,
          creator: {
            select: {
              userName: true,
            },
          },
          schedule: {
            select: {
              price: true,
              service: {
                select: {
                  id: true,
                  title: true,
                },
              },
              doctor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          date: {
            select: {
              fromTime: true,
              toTime: true,
            },
          },
          patient: {
            select: {
              name: true,
            },
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
