import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { GetProfileUseCase } from "./get-profile.use-case";
import { JwtTokenService } from "./jwt-token.service";
import { LoginUseCase } from "./login.use-case";
import { PasetoTokenService } from "./paseto-token.service";
import { TOKEN_SERVICE, TokenService } from "./token.service.interface";

/**
 * Module encapsulating authentication; the token provider is chosen via `TOKEN_PROVIDER`.
 */
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: (configService.get<string>("JWT_EXPIRES_IN") ??
            "8h") as NonNullable<JwtModuleOptions["signOptions"]>["expiresIn"],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    GetProfileUseCase,
    JwtTokenService,
    PasetoTokenService,
    {
      provide: TOKEN_SERVICE,
      inject: [ConfigService, JwtTokenService, PasetoTokenService],
      useFactory: (
        configService: ConfigService,
        jwt: JwtTokenService,
        paseto: PasetoTokenService,
      ): TokenService =>
        configService.get<string>("TOKEN_PROVIDER") === "paseto" ? paseto : jwt,
    },
  ],
  exports: [TOKEN_SERVICE],
})
export class AuthModule {}
