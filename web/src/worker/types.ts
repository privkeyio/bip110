export interface MonitorPeriod {
  periodNum: number;
  startBlock: number;
  endBlock: number;
  signalingCount: number;
  totalBlocks: number;
  pct: number;
}

export interface MonitorData {
  bip: string;
  tip: number;
  chainTip: number;
  periodNum: number;
  periodStart: number;
  periodEnd: number;
  totalBlocks: number;
  signalingCount: number;
  pct: number;
  periods: MonitorPeriod[];
  synced: boolean;
  updatedAt: string;
}

export interface MonitorBlock {
  hash: string;
  height: number;
  nTx: number;
  signaling: boolean;
  time: number;
  version: number;
}

export interface MonitorBlocksPayload {
  blocks: MonitorBlock[];
  updatedAt: string;
}

export interface MonitorMetadata {
  title: string;
  description: string;
  imageAlt: string;
  imageUrl: string;
  canonicalUrl: string;
}

export interface ChainBlock {
  hash: string;
  height: number;
  nTx: number;
  time: number;
}

export interface ChainSide {
  tip: number;
  tipHash: string;
  tipTime: number;
  blocksSinceFork: number;
  blocks: ChainBlock[];
}

export interface ChainsData {
  forkHeight: number;
  lastSharedHeight: number;
  blake2b: ChainSide;
  sha256d: ChainSide | null;
  updatedAt: string;
}
