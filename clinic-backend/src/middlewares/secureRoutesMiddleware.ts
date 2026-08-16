import { ProtectRoutesMiddleware } from "./protectedRoute";
import { roleOrPermissionMiddleware } from "./roleOrPermission";

export const secureRouteWithPermissions = (permission: string) => {
  return [ProtectRoutesMiddleware, roleOrPermissionMiddleware(permission)];
};
