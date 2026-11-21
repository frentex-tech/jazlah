import { Module } from '@nestjs/common';
import { AuditModule } from '@infra/audit/audit.module';
import { RedisService } from '@infra/redis/redis.service';
import { ActiveCoverageZonesCache } from './active-coverage-zones.cache';
import { AdminCoverageController } from './controllers/admin.controller';
import { PublicCoverageController } from './controllers/public.controller';
import { COVERAGE_REDIS } from './coverage-redis.constants';
import { CoverageZonesService } from './coverage-zones.service';
import { CoverageService } from './coverage.service';

/**
 * The coverage module: the delivery areas as PostGIS polygons and the check whether we
 * deliver to a point (FR-LOC-02, FR-LOC-03). CRUD-shaped, one service per
 * sub-resource: the zones (CoverageZonesService, admins' changes, audited) and the
 * check (CoverageService, on the cached active zones list).
 *
 * CoverageService is exported: customers mark each saved address covered or not;
 * checkout and kitchen assignment will ask it too.
 */
@Module({
  imports: [AuditModule],
  controllers: [AdminCoverageController, PublicCoverageController],
  providers: [
    CoverageZonesService,
    CoverageService,
    ActiveCoverageZonesCache,
    { provide: COVERAGE_REDIS, useExisting: RedisService },
  ],
  exports: [CoverageService],
})
export class CoverageModule {}
