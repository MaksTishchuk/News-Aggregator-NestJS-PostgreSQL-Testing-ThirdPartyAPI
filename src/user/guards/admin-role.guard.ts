import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {UserRoleEnum} from "../entities/enum/user-role.enum";
import {UserService} from "../user.service";

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request?.user) {
      const { email } = request.user;
      const user = await this.userService.getUserByEmail(email);
      return user.role === UserRoleEnum.ADMIN;
    }

    return false;
  }
}