import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  InvalidObjectState,
  NoSuchBucket,
  NoSuchKey,
  NotFound,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { StorageConfig } from '@config/storage-config.type';
import { StorageError } from '../storage.errors';
import { S3StorageProvider } from './s3.provider';

/** Credentials that are obviously not real: test data carries none. */
const CONFIG: StorageConfig = {
  provider: 's3',
  endpoint: 'http://storage.example.invalid',
  region: 'us-east-1',
  forcePathStyle: true,
  accessKeyId: 'example-access-key',
  secretAccessKey: 'example-secret-key',
  publicBucket: 'example-public',
  privateBucket: 'example-private',
  publicBaseUrl: 'http://storage.example.invalid/example-public',
  uploadUrlExpirySeconds: 300,
  downloadUrlExpirySeconds: 300,
};
const LOCATION = { bucket: 'example-private', key: 'vendor/document/x' };
const METADATA = { httpStatusCode: 0, attempts: 1, totalRetryDelay: 0 };

/** A service error as the SDK builds it: name, fault and HTTP status. */
function serviceError(
  name: string,
  status: number,
  fault: 'client' | 'server' = status >= 500 ? 'server' : 'client',
): S3ServiceException {
  return new S3ServiceException({
    name,
    $fault: fault,
    $metadata: { ...METADATA, httpStatusCode: status },
    message: name,
  });
}

function systemError(code: string): Error {
  return Object.assign(new Error(`connect ${code}`), { code });
}

/** A provider whose SDK client answers every `send` with `outcome`, recording the commands. */
function providerAnswering(outcome: () => unknown): {
  provider: S3StorageProvider;
  commands: unknown[];
} {
  const commands: unknown[] = [];
  const send = (command: unknown): Promise<unknown> => {
    commands.push(command);
    return Promise.resolve().then(outcome);
  };
  const client = { send, destroy: () => undefined } as unknown as S3Client;
  return { provider: new S3StorageProvider(CONFIG, client), commands };
}

async function failureOf(work: Promise<unknown>): Promise<StorageError> {
  const error: unknown = await work.then(
    () => undefined,
    (thrown: unknown) => thrown,
  );
  if (!(error instanceof StorageError)) {
    throw new Error(`expected a StorageError, got ${String(error)}`);
  }
  return error;
}

describe('S3StorageProvider', () => {
  describe('success paths', () => {
    it('reads metadata with HeadObject', async () => {
      const { provider, commands } = providerAnswering(() => ({
        ContentLength: 42,
        ContentType: 'image/png',
      }));

      await expect(provider.getObjectMetadata(LOCATION)).resolves.toEqual({
        sizeBytes: 42,
        contentType: 'image/png',
      });
      const command: unknown = commands[0];
      expect(command).toBeInstanceOf(HeadObjectCommand);
      expect((command as HeadObjectCommand).input).toEqual({
        Bucket: LOCATION.bucket,
        Key: LOCATION.key,
      });
    });

    it('reads the first bytes with a ranged GetObject', async () => {
      const { provider, commands } = providerAnswering(() => ({
        Body: {
          transformToByteArray: () =>
            Promise.resolve(Uint8Array.from([1, 2, 3, 4, 5])),
        },
      }));

      await expect(provider.readObjectStart(LOCATION, 3)).resolves.toEqual(
        Uint8Array.from([1, 2, 3]),
      );
      const command = commands[0] as GetObjectCommand;
      expect(command).toBeInstanceOf(GetObjectCommand);
      expect(command.input.Range).toBe('bytes=0-2');
    });

    it('deletes with DeleteObject', async () => {
      const { provider, commands } = providerAnswering(() => ({}));

      await provider.deleteObject(LOCATION);
      expect(commands[0]).toBeInstanceOf(DeleteObjectCommand);
    });

    it('signs a POST policy with the size range, the exact type and the key', async () => {
      // A real SDK client: presigning is local and makes no request.
      const provider = new S3StorageProvider(CONFIG);
      const before = Date.now();

      const upload = await provider.createPresignedUpload({
        location: LOCATION,
        contentType: 'application/pdf',
        minSizeBytes: 1,
        maxSizeBytes: 1_024,
        expiresInSeconds: 300,
      });
      provider.onModuleDestroy();

      expect(upload.url).toBe('http://storage.example.invalid/example-private');
      expect(upload.fields).toMatchObject({
        key: LOCATION.key,
        bucket: LOCATION.bucket,
        'Content-Type': 'application/pdf',
      });
      const policy: unknown = JSON.parse(
        Buffer.from(upload.fields.Policy ?? '', 'base64').toString('utf8'),
      );
      expect(policy).toMatchObject({
        conditions: expect.arrayContaining([
          ['content-length-range', 1, 1_024],
          { 'Content-Type': 'application/pdf' },
          { key: LOCATION.key },
          { bucket: LOCATION.bucket },
        ]) as unknown,
      });
      expect(upload.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + 300_000,
      );
    });

    it('presigns a GET that expires', async () => {
      const provider = new S3StorageProvider(CONFIG);

      const download = await provider.createPresignedDownload({
        location: LOCATION,
        expiresInSeconds: 120,
      });
      provider.onModuleDestroy();

      const url = new URL(download.url);
      expect(url.pathname).toBe(`/${LOCATION.bucket}/vendor/document/x`);
      expect(url.searchParams.get('X-Amz-Expires')).toBe('120');
      expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('documented "not found" outcomes are results, not errors', () => {
    it('HeadObject NotFound: no metadata', async () => {
      const { provider } = providerAnswering(() => {
        throw new NotFound({
          $metadata: { ...METADATA, httpStatusCode: 404 },
          message: 'NotFound',
        });
      });
      await expect(provider.getObjectMetadata(LOCATION)).resolves.toBeNull();
    });

    it('GetObject NoSuchKey: no bytes', async () => {
      const { provider } = providerAnswering(() => {
        throw new NoSuchKey({
          $metadata: { ...METADATA, httpStatusCode: 404 },
          message: 'NoSuchKey',
        });
      });
      await expect(provider.readObjectStart(LOCATION, 12)).resolves.toBeNull();
    });

    it('GetObject InvalidRange (an empty object): empty bytes', async () => {
      const { provider } = providerAnswering(() => {
        throw serviceError('InvalidRange', 416);
      });
      await expect(provider.readObjectStart(LOCATION, 12)).resolves.toEqual(
        new Uint8Array(),
      );
    });
  });

  describe('error mapping', () => {
    it.each([
      // [label, error, reason, retryable, code]
      [
        'NoSuchBucket',
        () =>
          new NoSuchBucket({
            $metadata: { ...METADATA, httpStatusCode: 404 },
            message: 'NoSuchBucket',
          }),
        'bucket-missing',
        false,
      ],
      [
        'InvalidObjectState',
        () =>
          new InvalidObjectState({
            $metadata: { ...METADATA, httpStatusCode: 403 },
            message: 'InvalidObjectState',
          }),
        'object-archived',
        false,
      ],
      [
        'AccessDenied (403)',
        () => serviceError('AccessDenied', 403),
        'access-denied',
        false,
      ],
      [
        'InvalidAccessKeyId (403)',
        () => serviceError('InvalidAccessKeyId', 403),
        'access-denied',
        false,
      ],
      [
        'SignatureDoesNotMatch (403)',
        () => serviceError('SignatureDoesNotMatch', 403),
        'access-denied',
        false,
      ],
      [
        'SlowDown (503)',
        () => serviceError('SlowDown', 503),
        'throttled',
        true,
      ],
      ['an unnamed 429', () => serviceError('Unknown', 429), 'throttled', true],
      [
        'InternalError (500)',
        () => serviceError('InternalError', 500),
        'unavailable',
        true,
      ],
      [
        'ServiceUnavailable (503)',
        () => serviceError('ServiceUnavailable', 503),
        'unavailable',
        true,
      ],
      [
        'a 502 from a proxy',
        () => serviceError('Unknown', 502),
        'unavailable',
        true,
      ],
      [
        'RequestTimeout (400)',
        () => serviceError('RequestTimeout', 400),
        'unavailable',
        true,
      ],
      [
        'the SDK request timeout',
        () => Object.assign(new Error('timed out'), { name: 'TimeoutError' }),
        'unavailable',
        true,
      ],
      [
        'ECONNREFUSED (storage down)',
        () => systemError('ECONNREFUSED'),
        'unavailable',
        true,
      ],
      ['ECONNRESET', () => systemError('ECONNRESET'), 'unavailable', true],
      ['ENOTFOUND (DNS)', () => systemError('ENOTFOUND'), 'unavailable', true],
      [
        'an AggregateError of ECONNREFUSED (IPv4 and IPv6)',
        () =>
          new AggregateError([
            systemError('ECONNREFUSED'),
            systemError('ECONNREFUSED'),
          ]),
        'unavailable',
        true,
      ],
      [
        'an undocumented 4xx',
        () => serviceError('InvalidArgument', 400),
        'rejected',
        false,
      ],
      [
        'an undocumented failure with no response',
        () => new Error('socket hang up'),
        'unavailable',
        true,
      ],
    ] as const)('maps %s', async (_label, makeError, reason, retryable) => {
      const { provider } = providerAnswering(() => {
        throw makeError();
      });

      const error = await failureOf(provider.deleteObject(LOCATION));

      expect(error.reason).toBe(reason);
      expect(error.retryable).toBe(retryable);
      expect(error.code).toBe(
        retryable ? ErrorCode.SERVICE_UNAVAILABLE : ErrorCode.INTERNAL_ERROR,
      );
      expect(error.cause).toBeInstanceOf(Error);
    });

    it('maps the same way for every operation', async () => {
      const { provider } = providerAnswering(() => {
        throw serviceError('AccessDenied', 403);
      });

      for (const work of [
        provider.getObjectMetadata(LOCATION),
        provider.readObjectStart(LOCATION, 12),
        provider.deleteObject(LOCATION),
      ]) {
        expect((await failureOf(work)).reason).toBe('access-denied');
      }
    });

    it('keeps the vendor error out of the message a log shows', async () => {
      const { provider } = providerAnswering(() => {
        throw serviceError('SlowDown', 503);
      });

      const error = await failureOf(provider.getObjectMetadata(LOCATION));

      expect(error.message).toBe('SERVICE_UNAVAILABLE: storage throttled');
    });
  });
});
