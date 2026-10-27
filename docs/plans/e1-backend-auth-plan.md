# Plan de Implementación Backend — Épica E1: Autenticación, Roles y Gestión de Usuarios

## 1. Objetivo y Alcance
Implementar de principio a fin la **Épica E1 (Autenticación y roles)** en `unicen_backend` cumpliendo estrictamente con las reglas arquitectónicas, de nombrado, JSDoc y testing de [`unicen_backend/AGENTS.md`](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/AGENTS.md) y las decisiones técnicas de [`unicen_backend/docs/decisions.md`](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/docs/decisions.md).

### Historias de Usuario Cubiertas
- **HU-01 · Iniciar sesión (🔴 Must):** `POST /api/auth/login` devuelve `{ accessToken, user: { id, name, email, role } }`. Hash `bcrypt`, error `401` genérico ante credenciales inválidas (sin revelar si el email existe).
- **HU-02 · Proteger el acceso por rol (🔴 Must):** `JwtAuthGuard` global, `@Public()` para rutas abiertas, `RolesGuard` + `@Roles(...)`. Sin token o vencido → `401`; rol no autorizado → `403`.
- **HU-03 · Cerrar sesión y ver mi perfil (🔴 Must):** `GET /api/auth/me` devuelve los datos actualizados del usuario autenticado `{ id, name, email, role }`.
- **HU-04 · Gestionar usuarios (🟡 Should):** `POST /api/users` y `GET /api/users` exclusivos para `Role.ADMIN`. Email único (`409 Conflict` si ya existe) y rol obligatorio.
- **HU-19 · Token PASETO (⚪ Could):** `PasetoTokenService` implementa `TokenService` y se conmuta mediante variable de entorno (`TOKEN_PROVIDER=jwt|paseto`) sin modificar casos de uso ni guards.

---

## 2. Arquitectura y Patrones Aplicados (`unicen_backend/AGENTS.md`)

```mermaid
flowchart TD
    subgraph Presentation["Presentation / Controllers"]
        AC["AuthController (/api/auth)"]
        UC["UsersController (/api/users)"]
    end

    subgraph Guards["Global Shared Guards & Filters"]
        JAG["JwtAuthGuard (Global APP_GUARD)"]
        RG["RolesGuard (Global APP_GUARD)"]
        DEF["DomainExceptionFilter (Global Filter)"]
    end

    subgraph AuthModule["Module: auth"]
        LUC["LoginUseCase.execute()"]
        GPUC["GetProfileUseCase.execute()"]
        TSI["<<interface>> TokenService"]
        JTS["JwtTokenService (JWT)"]
        PTS["PasetoTokenService (PASETO v3.local)"]
    end

    subgraph UsersModule["Module: users (CRUD)"]
        US["UsersService"]
        UR["Repository<UserEntity> (TypeORM)"]
    end

    JAG -->|verifies token via| TSI
    AC --> LUC
    AC --> GPUC
    UC --> US
    LUC --> US
    LUC --> TSI
    GPUC --> US
    TSI <|.. JTS
    TSI <|.. PTS
    US --> UR
```

- **Patrón Adapter / Factory (`BD-008`):** `TOKEN_SERVICE` inyecta dinámicamente `JwtTokenService` o `PasetoTokenService` según `ConfigService.get('TOKEN_PROVIDER')`.
- **Desacoplamiento del Guard (`JwtAuthGuard`):** Para que el cambio entre JWT y PASETO sea 100% transparente en toda la API sin tocar los guards (`HU-19`), `JwtAuthGuard` extrae el Bearer token del header `Authorization` y delega su verificación directamente en `TokenService.verify(token)`.
- **Uniformidad de errores (`BD-011`):** Todos los errores de dominio y HTTP se normalizan al contrato `{ statusCode, message, error }`.

---

## 3. Cambios Propuestos por Componente

### 3.1. Configuración y Variables de Entorno (`src/config/`)

#### [MODIFY] [env.validation.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/config/env.validation.ts)
Agregar validación de `TOKEN_PROVIDER` (`'jwt' | 'paseto'`, por defecto `'jwt'`), cambiar el default de `JWT_EXPIRES_IN` a `'8h'` (según `BD-008`) y permitir `PASETO_SECRET` opcional (con fallback a `JWT_SECRET` derivado a 32 bytes).

```ts
import * as Joi from "joi";

/**
 * Validation schema for environment variables at application startup.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  TOKEN_PROVIDER: Joi.string().valid("jwt", "paseto").default("jwt"),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default("8h"),
  PASETO_SECRET: Joi.string().min(16).optional(),
});
```

#### [MODIFY] [.env.example](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/.env.example)
Documentar `TOKEN_PROVIDER=jwt` y `JWT_EXPIRES_IN=8h`.

---

### 3.2. Errores de Dominio, Guards y Decoradores (`src/shared/`)

#### [MODIFY] [domain.errors.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/shared/errors/domain.errors.ts)
Añadir errores de dominio específicos para autenticación y unicidad de email:
- `InvalidCredentialsError` (`code = 'INVALID_CREDENTIALS'`, mensaje por defecto: `'Credenciales inválidas'`).
- `DuplicateUserEmailError` (`code = 'DUPLICATE_USER_EMAIL'`, mensaje por defecto: `'El correo electrónico ya se encuentra registrado'`).

```ts
/**
 * Thrown when login credentials are invalid or the account is inactive.
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = "INVALID_CREDENTIALS";

  constructor(message = "Credenciales inválidas") {
    super(message);
  }
}

/**
 * Thrown when attempting to register a user with an already existing email.
 */
export class DuplicateUserEmailError extends DomainError {
  readonly code = "DUPLICATE_USER_EMAIL";

  constructor(message = "El correo electrónico ya se encuentra registrado") {
    super(message);
  }
}
```

#### [MODIFY] [domain-exception.filter.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/shared/filters/domain-exception.filter.ts)
Mapear `InvalidCredentialsError` → `401 Unauthorized` y `DuplicateUserEmailError` → `409 Conflict`, manteniendo el formato `{ statusCode, message, error }`.

#### [MODIFY] [current-user.decorator.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/shared/decorators/current-user.decorator.ts)
Definir la interfaz tipada `AuthenticatedUser` y añadir JSDoc obligatorio:
```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "../enums/role.enum";

/**
 * Represents the authenticated user attached to the HTTP request.
 */
export interface AuthenticatedUser {
  id: string;
  sub: string;
  email: string;
  role: Role;
}

/**
 * Extracts the authenticated user or a specific property from the request.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

#### [MODIFY] [jwt-auth.guard.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/shared/guards/jwt-auth.guard.ts)
Actualizar `JwtAuthGuard` para verificar tokens mediante `TOKEN_SERVICE` (soportando tanto JWT como PASETO de forma transparente) y lanzar `UnauthorizedException` (`401`) cuando el token falte, sea inválido o haya expirado.

```ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  TOKEN_SERVICE,
  TokenService,
} from "../../modules/auth/token.service.interface";
import { AuthenticatedUser } from "../decorators/current-user.decorator";

/**
 * Global authentication guard that validates Bearer tokens (JWT or PASETO).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validates if the current request is public or carries a valid Bearer token.
   * @param context - Execution context of the request.
   * @returns True if access is granted.
   * @throws {UnauthorizedException} When the token is missing, invalid or expired.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No autenticado. Token requerido.");
    }

    try {
      const payload = await this.tokenService.verify(token);
      request.user = {
        id: payload.sub,
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada.");
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
```

#### [MODIFY] [roles.guard.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/shared/guards/roles.guard.ts)
Lanzar explícitamente `ForbiddenException("No tienes permisos suficientes para acceder a este recurso")` (`403`) con mensaje claro cuando el rol no coincida.

---

### 3.3. Módulo de Usuarios (`src/modules/users/`) — HU-04

#### [MODIFY] [user.entity.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/users/user.entity.ts)
Completar las columnas en `snake_case` según las reglas de base de datos de `AGENTS.md`:
```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../../shared/enums/role.enum";

/**
 * User ORM entity representing application accounts across all roles.
 */
@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ type: "enum", enum: Role })
  role: Role;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
```

#### [NEW] [create-user.dto.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/users/dto/create-user.dto.ts)
DTO de entrada con validaciones `class-validator` y decoradores `@ApiProperty`:
- `name`: `@IsString()`, `@IsNotEmpty()`, `@MaxLength(150)`
- `email`: `@IsEmail()`, `@IsNotEmpty()`, `@MaxLength(255)`
- `password`: `@IsString()`, `@MinLength(6)`, `@MaxLength(72)`
- `role`: `@IsEnum(Role)`

#### [NEW] [user-response.dto.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/users/dto/user-response.dto.ts)
DTO de salida que garantiza que `passwordHash` jamás se exponga:
- Propiedades: `id`, `name`, `email`, `role`, `isActive`, `createdAt`.
- Método estático `fromEntity(entity: UserEntity): UserResponseDto`.

#### [MODIFY] [users.service.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/users/users.service.ts)
Implementar métodos con JSDoc completo:
- `create(dto: CreateUserDto): Promise<UserResponseDto>`:
  - Normaliza `email = dto.email.trim().toLowerCase()`.
  - Verifica si ya existe con `findByEmail(email)`; si existe, lanza `DuplicateUserEmailError` (`409`).
  - Genera `passwordHash = await bcrypt.hash(dto.password, 10)`.
  - Persiste y retorna `UserResponseDto.fromEntity(saved)`.
- `findAll(role?: Role): Promise<UserResponseDto[]>`: retorna todos los usuarios ordenados por `createdAt DESC` (filtrable opcionalmente por `role`).
- `findByEmail(email: string): Promise<UserEntity | null>`: busca por email normalizado.
- `findById(id: string): Promise<UserEntity | null>`: busca por UUID.

#### [MODIFY] [users.controller.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/users/users.controller.ts)
Endpoints protegidos para `Role.ADMIN`:
- `POST /api/users` (`@Roles(Role.ADMIN)`): crea un usuario (administrador, docente o estudiante) y devuelve `201 Created` con `UserResponseDto`.
- `GET /api/users` (`@Roles(Role.ADMIN)`): lista usuarios (admite query param opcional `?role=TEACHER`) y devuelve `200 OK` con `UserResponseDto[]`.

---

### 3.4. Módulo de Autenticación (`src/modules/auth/`) — HU-01, HU-02, HU-03, HU-19

#### [MODIFY] [token.service.interface.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/token.service.interface.ts)
Tipar `role` con el enum `Role` en `TokenPayload`:
```ts
import { Role } from "../../shared/enums/role.enum";

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

/**
 * Payload encoded inside authentication tokens (JWT or PASETO).
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Token management service port (Adapter pattern).
 */
export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
```

#### [NEW] [paseto-token.service.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/paseto-token.service.ts)
Implementación `PasetoTokenService` cumpliendo **HU-19**:
- Usa `node:crypto` nativo de Node 22 para emitir y verificar tokens con formato estándar `v3.local.<payload_autenticado_cifrado>` (AES-256-CTR + HMAC-SHA384 autenticado / AES-256-GCM con clave derivada por SHA-256 desde `PASETO_SECRET` o `JWT_SECRET`), evitando incompatibilidades ESM/CommonJS en Jest.
- Incluye claims `sub`, `email`, `role`, `iat` y `exp` (calculado a partir de `JWT_EXPIRES_IN`, p. ej. `8h`), validando firma autenticada y expiración en `verify()`.

#### [NEW] [login.dto.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/dto/login.dto.ts) y [auth-response.dto.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/dto/auth-response.dto.ts)
- `LoginDto`: `email` (`@IsEmail()`, `@IsNotEmpty()`), `password` (`@IsString()`, `@IsNotEmpty()`).
- `AuthUserDto`: `{ id: string; name: string; email: string; role: Role }`.
- `LoginResponseDto`: `{ accessToken: string; user: AuthUserDto }`.

#### [MODIFY] [login.use-case.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/login.use-case.ts)
Implementación completa del caso de uso de inicio de sesión:
- Inyecta `UsersService` y `@Inject(TOKEN_SERVICE) tokenService: TokenService`.
- Busca usuario por `email.trim().toLowerCase()`.
- Si no existe o `!user.isActive`, lanza `InvalidCredentialsError("Credenciales inválidas")`.
- Verifica contraseña con `bcrypt.compare(dto.password, user.passwordHash)`. Si no coincide, lanza `InvalidCredentialsError("Credenciales inválidas")`.
- Firma el token con `{ sub: user.id, email: user.email, role: user.role }` y devuelve `{ accessToken, user: { id, name, email, role } }`.

#### [NEW] [get-profile.use-case.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/get-profile.use-case.ts)
Caso de uso para **HU-03 (`GET /api/auth/me`)**:
- Recibe `userId: string`.
- Consulta `usersService.findById(userId)`.
- Si no existe o `!user.isActive`, lanza `InvalidCredentialsError("Usuario no encontrado o inactivo")`.
- Devuelve `AuthUserDto` (`{ id, name, email, role }`).

#### [MODIFY] [auth.controller.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/auth.controller.ts)
- `@Public()` `@Post("login")` `@HttpCode(HttpStatus.OK)` → ejecuta `loginUseCase.execute(dto)`.
- `@Get("me")` `@ApiBearerAuth()` → extrae `@CurrentUser() user: AuthenticatedUser` y ejecuta `getProfileUseCase.execute(user.id)`.

#### [MODIFY] [auth.module.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/modules/auth/auth.module.ts)
- Importa `UsersModule`.
- Registra `JwtTokenService`, `PasetoTokenService`, y el factory provider `TOKEN_SERVICE` que selecciona la implementación según `TOKEN_PROVIDER`.
- Registra `LoginUseCase` y `GetProfileUseCase`.
- Exporta `TOKEN_SERVICE`.

---

### 3.5. Migración Inicial de Usuarios y Seed Idempotente (`src/database/`)

#### [NEW] Migración `CreateUsersTable` en `src/database/migrations/`
Crea el tipo enum `users_role_enum` (`'ADMIN'`, `'TEACHER'`, `'STUDENT'`) y la tabla `users` con sus restricciones (`PRIMARY KEY (id)`, `UNIQUE (email)`).

#### [MODIFY] [seed.ts](file:///c:/Users/LOQ/Documents/JOBS/UNICEN_TEST/unicen_backend/src/database/seeds/seed.ts)
Asegura de forma idempotente (`upsert` o verificación por email) los usuarios base de prueba:
- `admin@unicen.edu.bo` / `Admin123!` (`Role.ADMIN` — "Administrador UNICEN")
- `docente@unicen.edu.bo` / `Teacher123!` (`Role.TEACHER` — "Dr. Carlos Mendoza")
- `estudiante@unicen.edu.bo` / `Student123!` (`Role.STUDENT` — "Ana Sofía Vargas")

---

## 4. Plan de Pruebas y Verificación Backend

### 4.1. Tests Unitarios (Jest)
1. **`src/modules/auth/login.use-case.spec.ts`:**
   - `returns accessToken and user when credentials are valid`
   - `throws InvalidCredentialsError when email does not exist`
   - `throws InvalidCredentialsError when password does not match`
   - `throws InvalidCredentialsError when user is inactive`
2. **`src/modules/auth/get-profile.use-case.spec.ts`:**
   - `returns authenticated user profile when user exists and is active`
   - `throws InvalidCredentialsError when user does not exist or is inactive`
3. **`src/modules/auth/paseto-token.service.spec.ts` y `jwt-token.service.spec.ts`:**
   - `signs and verifies a valid token payload`
   - `rejects a tampered or expired token`
4. **`src/modules/users/users.service.spec.ts`:**
   - `creates a user with hashed password and returns UserResponseDto without passwordHash`
   - `throws DuplicateUserEmailError when email already exists`
5. **`src/shared/guards/roles.guard.spec.ts` & `jwt-auth.guard.spec.ts`:**
   - `allows access on @Public() routes without token`
   - `throws UnauthorizedException when Bearer token is missing or invalid`
   - `throws ForbiddenException when user role is not in @Roles()`

### 4.2. Comandos de Verificación
```bash
cd unicen_backend
npm run lint
npm run build
npm test
```
