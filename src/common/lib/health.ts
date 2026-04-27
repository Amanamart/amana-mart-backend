import { prisma } from './prisma';
import { meilisearch } from '../../modules/search/meilisearch.client';
import { r2Client, R2_BUCKET_NAME } from './r2';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

interface ServiceHealth {
  status: 'ok' | 'error' | 'unconfigured';
  latencyMs?: number;
  message?: string;
}

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    meilisearch: ServiceHealth;
    redis: ServiceHealth;
    r2: ServiceHealth;
    rabbitmq: ServiceHealth;
  };
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (e: any) {
    return { status: 'error', message: e.message };
  }
}

async function checkMeilisearch(): Promise<ServiceHealth> {
  if (!meilisearch) {
    return { status: 'unconfigured', message: 'MEILISEARCH_HOST or MEILISEARCH_MASTER_KEY not set' };
  }
  const start = Date.now();
  try {
    await meilisearch.health();
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (e: any) {
    return { status: 'error', message: e.message };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  if (!process.env.REDIS_URL) {
    return { status: 'unconfigured', message: 'REDIS_URL not set' };
  }
  // Redis client not yet integrated — mark as unconfigured for now
  return { status: 'unconfigured', message: 'Redis client not yet initialized in code' };
}

async function checkR2(): Promise<ServiceHealth> {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID) {
    return { status: 'unconfigured', message: 'R2_ENDPOINT or R2_ACCESS_KEY_ID not set' };
  }
  const start = Date.now();
  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }));
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (e: any) {
    return { status: 'error', message: e.message };
  }
}

async function checkRabbitMQ(): Promise<ServiceHealth> {
  if (!process.env.RABBITMQ_URL) {
    return { status: 'unconfigured', message: 'RABBITMQ_URL not set' };
  }
  return { status: 'unconfigured', message: 'RabbitMQ client not yet initialized in code' };
}

export async function getHealthReport(): Promise<HealthReport> {
  const [database, meilisearchHealth, redis, r2, rabbitmq] = await Promise.all([
    checkDatabase(),
    checkMeilisearch(),
    checkRedis(),
    checkR2(),
    checkRabbitMQ(),
  ]);

  const services = { database, meilisearch: meilisearchHealth, redis, r2, rabbitmq };

  // Determine overall status
  const hasError = Object.values(services).some(s => s.status === 'error');
  const hasUnconfigured = Object.values(services).some(s => s.status === 'unconfigured');
  
  let status: HealthReport['status'] = 'healthy';
  if (hasError) status = 'unhealthy';
  else if (hasUnconfigured) status = 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    services,
  };
}
