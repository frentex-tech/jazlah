import { Module } from '@nestjs/common';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_VERIFIER } from '@common/auth/access-token-verifier.constants';
import { AuthenticationGuard } from '@common/guards/authentication.guard';
import { OrganisationStatusGuard } from '@common/guards/organisation-status.guard';
import { RouteAudienceCheck } from '@common/guards/route-audience.check';
import { VendorRouteCheck } from '@common/guards/vendor-route.check';
import { AuditModule } from '@infra/audit/audit.module';
import { RateLimitModule } from '@infra/rate-limit/rate-limit.module';
import { SmsModule } from '@integrations/sms';
import { CustomersModule } from '@modules/customers';
import { OrdersModule } from '@modules/orders';
import { UsersModule } from '@modules/users';
import { VendorsModule } from '@modules/vendors';
import { AdminAuthController } from './api/controllers/admin.controller';
import { CustomerAuthController } from './api/controllers/customer.controller';
import { KitchenAuthController } from './api/controllers/kitchen.controller';
import { PublicAuthController } from './api/controllers/public.controller';
import { VendorAuthController } from './api/controllers/vendor.controller';
import { DeleteCustomerAccountUseCase } from './application/delete-customer-account.use-case';
import { GetCurrentUserUseCase } from './application/get-current-user.use-case';
import { GetCustomerMeUseCase } from './application/get-customer-me.use-case';
import { LogoutAllUseCase } from './application/logout-all.use-case';
import { LogoutUseCase } from './application/logout.use-case';
import { RefreshSessionUseCase } from './application/refresh-session.use-case';
import { RequestOtpUseCase } from './application/request-otp.use-case';
import { VerifyOtpUseCase } from './application/verify-otp.use-case';
import { ACCESS_TOKENS } from './domain/ports/access-tokens.port';
import { APPLICANT_DATA } from './domain/ports/applicant-data.port';
import { AUTH_SESSION_REPOSITORY } from './domain/ports/auth-session.repository.port';
import { CLOCK } from './domain/ports/clock.port';
import { CUSTOMER_DATA } from './domain/ports/customer-data.port';
import { CUSTOMER_PROFILES } from './domain/ports/customer-profiles.port';
import { DETACHED_WORK } from './domain/ports/detached-work.port';
import { OTP_CHALLENGE_REPOSITORY } from './domain/ports/otp-challenge.repository.port';
import { OTP_CODES } from './domain/ports/otp-codes.port';
import { OTP_REQUEST_LIMIT } from './domain/ports/otp-request-limit.port';
import { OTP_SENDER } from './domain/ports/otp-sender.port';
import { REFRESH_TOKEN_REPOSITORY } from './domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_SECRETS } from './domain/ports/refresh-token-secrets.port';
import { USER_ACCOUNTS } from './domain/ports/user-accounts.port';
import { CustomersServiceCustomerData } from './infrastructure/customers-service-customer-data';
import { CustomersServiceCustomerProfiles } from './infrastructure/customers-service-customer-profiles';
import { HmacOtpCodes } from './infrastructure/hmac-otp-codes';
import { JwtAccessTokens } from './infrastructure/jwt-access-tokens';
import { PrismaAuthSessionRepository } from './infrastructure/prisma-auth-session.repository';
import { PrismaOtpChallengeRepository } from './infrastructure/prisma-otp-challenge.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma-refresh-token.repository';
import { RandomRefreshTokenSecrets } from './infrastructure/random-refresh-token-secrets';
import { RateLimitedOtpRequests } from './infrastructure/rate-limited-otp-requests';
import { SmsOtpSender } from './infrastructure/sms-otp-sender';
import { SystemClock } from './infrastructure/system-clock';
import { TrackedDetachedWork } from './infrastructure/tracked-detached-work';
import { UsersServiceUserAccounts } from './infrastructure/users-service-user-accounts';
import { VendorsApplicantData } from './infrastructure/vendors-applicant-data';

/**
 * Authentication: signing in with a phone number and a code sent by SMS, sessions,
 * and the global guard. The reference four-layer module:
 *
 * - `api/` holds one controller per audience and the DTOs;
 * - `application/` one use case per class;
 * - `domain/` the entities with their rules and the ports, in plain TypeScript;
 * - `infrastructure/` what implements the ports.
 *
 * This file is the only place that knows which class implements which port: every port
 * is bound here to its token, and use cases inject tokens.
 *
 * It also registers the global guards: the authentication guard, then the organisation
 * status guard (a suspended vendor is refused on every vendor route), in that order.
 * AppModule imports this module after RateLimitModule, so both run after the rate limits
 * (`http.md`, "Guard order"); no other module registers a global guard. RouteAudienceCheck
 * refuses to start with an endpoint that has neither an audience nor `@Public()`, and
 * VendorRouteCheck with a vendor route that could escape the status guard. The
 * VendorStatusChecker comes from VendorsModule, which is why it is imported here; the
 * account deletion also erases what VendorsModule and CustomersModule keep about the
 * customer, and sign-in and `me` read the customer's profile from CustomersModule.
 */
@Module({
  imports: [
    DiscoveryModule,
    // Secrets and options are given at each call (JwtAccessTokens), never as defaults.
    JwtModule.register({}),
    RateLimitModule,
    SmsModule,
    AuditModule,
    UsersModule,
    VendorsModule,
    CustomersModule,
    OrdersModule,
  ],
  controllers: [
    PublicAuthController,
    CustomerAuthController,
    VendorAuthController,
    KitchenAuthController,
    AdminAuthController,
  ],
  providers: [
    RequestOtpUseCase,
    VerifyOtpUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    GetCurrentUserUseCase,
    GetCustomerMeUseCase,
    DeleteCustomerAccountUseCase,
    JwtAccessTokens,
    { provide: ACCESS_TOKENS, useExisting: JwtAccessTokens },
    { provide: ACCESS_TOKEN_VERIFIER, useExisting: JwtAccessTokens },
    {
      provide: OTP_CHALLENGE_REPOSITORY,
      useClass: PrismaOtpChallengeRepository,
    },
    { provide: AUTH_SESSION_REPOSITORY, useClass: PrismaAuthSessionRepository },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    { provide: OTP_CODES, useClass: HmacOtpCodes },
    { provide: REFRESH_TOKEN_SECRETS, useClass: RandomRefreshTokenSecrets },
    { provide: OTP_SENDER, useClass: SmsOtpSender },
    { provide: OTP_REQUEST_LIMIT, useClass: RateLimitedOtpRequests },
    { provide: USER_ACCOUNTS, useClass: UsersServiceUserAccounts },
    { provide: CUSTOMER_PROFILES, useClass: CustomersServiceCustomerProfiles },
    { provide: CUSTOMER_DATA, useClass: CustomersServiceCustomerData },
    { provide: APPLICANT_DATA, useClass: VendorsApplicantData },
    { provide: CLOCK, useClass: SystemClock },
    { provide: DETACHED_WORK, useClass: TrackedDetachedWork },
    RouteAudienceCheck,
    VendorRouteCheck,
    // In this order: Nest runs global guards in registration order.
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: OrganisationStatusGuard },
  ],
})
export class AuthModule {}
