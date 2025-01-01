"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ApiFeatures {
    constructor(prismaModel, searchQuery) {
        this.prismaModel = prismaModel;
        this.searchQuery = searchQuery;
        this.prismaQuery = { where: {} };
    }
    get query() {
        return this.prismaQuery;
    }
    filter(baseFilter = {}) {
        let filterObj = Object.assign(Object.assign({}, baseFilter), this.searchQuery);
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
        this.prismaQuery.where = Object.assign(Object.assign({}, this.prismaQuery.where), filterObj);
        return this;
    }
    sort() {
        const sortBy = this.searchQuery.sort
            ? this.searchQuery.sort.split(",").reduce((acc, field) => {
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
                .map((field) => field.trim());
            this.prismaQuery.select = fields.reduce((acc, field) => {
                acc[field] = true;
                return acc;
            }, {});
        }
        else {
            delete this.prismaQuery.select;
        }
        return this;
    }
    search(modelName) {
        var _a, _b;
        if (this.searchQuery.keyword || this.searchQuery.keyword_phone) {
            const keyword_phone = ((_a = this.searchQuery.keyword_phone) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
            const keyword = ((_b = this.searchQuery.keyword) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "";
            if (modelName === "patient") {
                this.prismaQuery.where = {
                    OR: [
                        keyword_phone ? { phone: { contains: keyword_phone } } : undefined,
                        keyword ? { name: { contains: keyword } } : undefined,
                    ].filter(Boolean), // إزالة القيم undefined
                };
            }
            else if (modelName === "doctor") {
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
            }
            else {
                this.prismaQuery.where = Object.assign(Object.assign({}, this.prismaQuery.where), (keyword && { name: { contains: keyword, mode: "insensitive" } }));
            }
        }
        return this;
    }
    paginateWithCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = this.searchQuery.page * 1 || 1;
            const limit = this.searchQuery.limit * 1 || 50;
            const skip = (page - 1) * limit;
            const endIndex = page * limit;
            // Correct where condition for the count query
            const countDocuments = yield this.prismaModel.count({
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
        });
    }
    exec(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.prismaQuery.select) {
                delete this.prismaQuery.select;
            }
            // Adjust where conditions based on the model
            if (modelName === "category") {
                this.prismaQuery.include = {
                    parentCategory: true,
                };
            }
            else if (modelName === "product") {
                this.prismaQuery.include = {
                    category: true,
                };
            }
            else if (modelName === "user") {
                this.prismaQuery.include = {
                    userRoles: true,
                    userPermissions: true,
                };
            }
            else if (modelName === "schedule") {
                this.prismaQuery.include = {
                    dates: true,
                };
            }
            else if (modelName === "visit") {
                this.prismaQuery.include = {
                    details: {
                        include: {
                            patient: true,
                            schedule: true,
                        },
                    },
                };
            }
            else if (modelName === "doctor") {
                this.prismaQuery.include = {
                    specialty: true,
                };
            }
            const result = yield this.prismaModel.findMany(Object.assign({}, this.prismaQuery));
            return {
                result,
                pagination: this.paginationResult,
            };
        });
    }
}
exports.default = ApiFeatures;
