"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureRouteWithPermissions = void 0;
const protectedRoute_1 = require("./protectedRoute");
const roleOrPermission_1 = require("./roleOrPermission");
const secureRouteWithPermissions = (permission) => {
    return [protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)(permission)];
};
exports.secureRouteWithPermissions = secureRouteWithPermissions;
//# sourceMappingURL=secureRoutesMiddleware.js.map