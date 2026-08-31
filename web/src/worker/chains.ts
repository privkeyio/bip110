import { BLAKE2B_FORK_HEIGHT, LAST_SHARED_HEIGHT } from "../lib/chains";
import { defaultCache, jsonResponse } from "./monitor-data";
import type { ChainBlock, ChainSide, ChainsData } from "./types";

const BLAKE2B_UPSTREAM = "https://mempool.guide/api/blocks";
const SHA256D_UPSTREAM = "https://mempool.space/api/blocks";
const MAX_CHAIN_BLOCKS = 10;

export const CHAINS_API_PATH = "/api/chains";
export const CHAINS_CACHE_TTL_SECONDS = 60;

type CacheStatus = "HIT" | "MISS" | "BYPASS";

interface CachedChainsResponse {
  response: Response;
  cacheStatus: CacheStatus;
}

export async function handleChainsApiRequest(
  request: Request,
  ctx: ExecutionContext,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: { allow: "GET, HEAD" },
      },
    );
  }

  const { response, cacheStatus } = await fetchCachedChainsResponse(
    request,
    ctx,
  );
  const headers = new Headers(response.headers);
  headers.set("x-bip110-chains-cache", cacheStatus);

  return new Response(request.method === "HEAD" ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export async function readChainsData(
  request: Request,
  ctx: ExecutionContext,
): Promise<ChainsData> {
  const { response } = await fetchCachedChainsResponse(request, ctx);

  if (!response.ok) {
    throw new Error(`chain data unavailable: ${response.status}`);
  }

  return (await response.clone().json()) as ChainsData;
}

async function fetchCachedChainsResponse(
  request: Request,
  ctx: ExecutionContext,
): Promise<CachedChainsResponse> {
  const cache = defaultCache();
  const cacheKey = chainsCacheKey(request);
  const cached = await cache.match(cacheKey);

  if (cached) {
    return { response: cached, cacheStatus: "HIT" };
  }

  const [blake2b, sha256d] = await Promise.all([
    fetchChainSide(BLAKE2B_UPSTREAM),
    fetchChainSide(SHA256D_UPSTREAM),
  ]);

  // The BLAKE2b side is what this page is about; without it there is nothing
  // to show. A missing SHA256d side just renders as unavailable.
  if (!blake2b || blake2b.tip < BLAKE2B_FORK_HEIGHT) {
    return unavailableResponse(502);
  }

  const data: ChainsData = {
    forkHeight: BLAKE2B_FORK_HEIGHT,
    lastSharedHeight: LAST_SHARED_HEIGHT,
    blake2b,
    sha256d: sha256d && sha256d.tip >= BLAKE2B_FORK_HEIGHT ? sha256d : null,
    updatedAt: new Date().toISOString(),
  };
  const response = jsonResponse(data, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": `public, max-age=${CHAINS_CACHE_TTL_SECONDS}`,
    },
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));

  return { response, cacheStatus: "MISS" };
}

async function fetchChainSide(upstream: string): Promise<ChainSide | null> {
  try {
    const response = await fetch(upstream, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) return null;

    return chainSide(await response.json());
  } catch {
    return null;
  }
}

export function chainSide(value: unknown): ChainSide {
  if (!Array.isArray(value)) {
    throw new Error("chain API response must be an array");
  }

  const blocks = value
    .slice(0, MAX_CHAIN_BLOCKS)
    .map(chainBlock)
    .sort((a, b) => b.height - a.height);
  const tip = blocks[0];

  if (!tip) {
    throw new Error("chain API response was empty");
  }

  return {
    tip: tip.height,
    tipHash: tip.hash,
    tipTime: tip.time,
    blocksSinceFork: tip.height - LAST_SHARED_HEIGHT,
    blocks,
  };
}

function chainBlock(value: unknown): ChainBlock {
  if (typeof value !== "object" || value === null) {
    throw new Error("chain API block must be an object");
  }

  const block = value as Record<string, unknown>;
  const { id: hash, height, timestamp: time, tx_count: nTx } = block;

  if (typeof hash !== "string" || !/^[0-9a-f]{64}$/.test(hash)) {
    throw new Error("chain API block id must be a block hash");
  }

  if (
    !Number.isInteger(height) ||
    !Number.isInteger(time) ||
    !Number.isInteger(nTx)
  ) {
    throw new Error("chain API block fields must be integers");
  }

  return {
    hash,
    height: height as number,
    nTx: nTx as number,
    time: time as number,
  };
}

function chainsCacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.pathname = CHAINS_API_PATH;
  url.search = "";

  return new Request(url.toString(), { method: "GET" });
}

function unavailableResponse(status: number): CachedChainsResponse {
  return {
    response: jsonResponse(
      { error: "Chain data unavailable" },
      {
        status,
        headers: { "cache-control": "no-store" },
      },
    ),
    cacheStatus: "BYPASS",
  };
}
