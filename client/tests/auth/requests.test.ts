// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exchangeCode, fetchProfile } from '@/auth/requests';

const config = {
  issuer: 'http://localhost:3000',
  clientId: 'game-client',
  scope: 'openid',
  profileUrl: 'http://localhost:3000/profile',
};

const fetchMock = vi.fn();
const json = (body: unknown, ok = true, status = 200) => ({ ok, status, json: async () => body });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('exchangeCode', () => {
  it('POSTs the public-client form with a timeout signal and no secret', async () => {
    fetchMock.mockResolvedValue(json({ access_token: 'at' }));
    await expect(exchangeCode(config, 'c1', 'v1')).resolves.toEqual({ accessToken: 'at' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('http://localhost:3000/oauth/token');
    expect(init.method).toBe('POST');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = init.body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({
      grant_type: 'authorization_code',
      code: 'c1',
      code_verifier: 'v1',
      redirect_uri: new URL('/', window.location.origin).toString(),
      client_id: 'game-client',
    });
    expect(body.has('client_secret')).toBe(false);
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue(json({}, false, 400));
    await expect(exchangeCode(config, 'c', 'v')).rejects.toThrow('token_exchange_failed_400');
  });

  it.each([{}, { access_token: 5 }, { access_token: '' }, null])('throws when access_token is not a string: %o', async (body) => {
    fetchMock.mockResolvedValue(json(body));
    await expect(exchangeCode(config, 'c', 'v')).rejects.toThrow('token_response_invalid');
  });
});

describe('fetchProfile', () => {
  it('sends the bearer token with a timeout signal', async () => {
    fetchMock.mockResolvedValue(json({ sub: 'u1' }));
    await expect(fetchProfile(config, 'at')).resolves.toEqual({ sub: 'u1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('http://localhost:3000/oauth/userinfo');
    expect(init.headers.Authorization).toBe('Bearer at');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('rejects a malformed userinfo and accepts a minimal one', async () => {
    fetchMock.mockResolvedValue(json(null));
    await expect(fetchProfile(config, 'at')).rejects.toThrow('userinfo_invalid');
    fetchMock.mockResolvedValue(json({ sub: 'u1', name: 5 }));
    await expect(fetchProfile(config, 'at')).rejects.toThrow('userinfo_invalid');
    fetchMock.mockResolvedValue(json({ sub: 'u1' }));
    await expect(fetchProfile(config, 'at')).resolves.toEqual({ sub: 'u1' });
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValue(json({}, false, 401));
    await expect(fetchProfile(config, 'at')).rejects.toThrow('userinfo_failed_401');
  });
});
