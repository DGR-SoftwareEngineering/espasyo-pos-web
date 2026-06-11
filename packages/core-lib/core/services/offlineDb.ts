import { openDB, IDBPDatabase } from "idb";
import type { CreateSaleParams } from "../../api/commons/types";

export interface OfflineSaleRecord {
  localId: string;
  createdAt: string;
  payload: CreateSaleParams;
  syncStatus: "pending" | "synced" | "failed";
  syncError?: string;
  saleNumber?: string;
}

interface EspasyoOfflineDB {
  offlineSales: {
    key: string;
    value: OfflineSaleRecord;
  };
  productCache: {
    key: string;
    value: { items: unknown[]; cachedAt: string };
  };
  targetSalesCache: {
    key: string;
    value: { data: unknown; cachedAt: string };
  };
}

const DB_NAME = "espasyo-offline-v1";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EspasyoOfflineDB>> | null = null;

function getDb() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<EspasyoOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("offlineSales", { keyPath: "localId" });
        db.createObjectStore("productCache");
        db.createObjectStore("targetSalesCache");
      },
    });
  }
  return dbPromise;
}

// ===== Offline Sales =====

export async function addOfflineSale(sale: OfflineSaleRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put("offlineSales", sale);
}

export async function getPendingOfflineSales(): Promise<OfflineSaleRecord[]> {
  const db = await getDb();
  if (!db) return [];
  const all = await db.getAll("offlineSales");
  return all.filter((s) => s.syncStatus === "pending");
}

export async function countPendingOfflineSales(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const all = await db.getAll("offlineSales");
  return all.filter((s) => s.syncStatus === "pending").length;
}

export async function markSaleSynced(
  localId: string,
  saleNumber: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const record = await db.get("offlineSales", localId);
  if (record) {
    await db.put("offlineSales", {
      ...record,
      syncStatus: "synced",
      saleNumber,
    });
  }
}

export async function markSaleFailed(
  localId: string,
  error: string,
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const record = await db.get("offlineSales", localId);
  if (record) {
    await db.put("offlineSales", {
      ...record,
      syncStatus: "failed",
      syncError: error,
    });
  }
}

export async function removeOfflineSale(localId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete("offlineSales", localId);
}

// ===== Product Cache =====

export async function cacheProducts(items: unknown[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put(
    "productCache",
    { items, cachedAt: new Date().toISOString() },
    "data",
  );
}

export async function getCachedProducts(): Promise<unknown[]> {
  const db = await getDb();
  if (!db) return [];
  const record = await db.get("productCache", "data");
  return record?.items ?? [];
}

// ===== Target Sales Cache =====

export async function cacheTargetSales(data: unknown): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put(
    "targetSalesCache",
    { data, cachedAt: new Date().toISOString() },
    "data",
  );
}

export async function getCachedTargetSales(): Promise<unknown | null> {
  const db = await getDb();
  if (!db) return null;
  const record = await db.get("targetSalesCache", "data");
  return record?.data ?? null;
}
