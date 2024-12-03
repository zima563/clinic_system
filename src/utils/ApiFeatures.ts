import { PrismaClient, User } from '@prisma/client';

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

  filter(baseFilter = {}) {
    let filterObj = { ...baseFilter,...this.searchQuery };
    let excludedFields = ["page", "sort", "limit", "fields", "keyword"];
    excludedFields.forEach((val) => {
      delete filterObj[val];
    });

    // Add `parentId` to the query if it's provided in the search query
    if (filterObj.parentId) {
      this.prismaQuery.where.parentId = filterObj.parentId === 'null' ? null : parseInt(filterObj.parentId, 10);
    }

    // Add `categoryId` to the query if it's provided in the search query
    if (filterObj.categoryId) {
      this.prismaQuery.where.categoryId = parseInt(filterObj.categoryId, 10);
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
      : { createdAt: 'asc' };
    this.prismaQuery.orderBy = sortBy;
    return this;
  }

  limitedFields() {
    if (this.searchQuery.fields) {
      const fields = this.searchQuery.fields.split(",").map((field: string) => field.trim());
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
    if (this.searchQuery.keyword) {
      const keyword = this.searchQuery.keyword.toLowerCase();
      if (modelName === "product") {
        this.prismaQuery.where = {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
        };
      } else {
        this.prismaQuery.where = {
          ...this.prismaQuery.where,
          name: { contains: keyword, mode: 'insensitive' },
        };
      }
    }
    return this;
  }

  async paginateWithCount(countDocuments: number) {
    const page = this.searchQuery.page * 1 || 1;
    const limit = this.searchQuery.limit * 1 || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

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
