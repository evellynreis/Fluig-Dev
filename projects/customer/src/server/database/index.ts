import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  DatasetRecord,
  DatasetVersionRecord,
  HistoryRecord,
} from "@/types/dataset";

type Store = {
  datasets: DatasetRecord[];
  versions: DatasetVersionRecord[];
  history: HistoryRecord[];
};

const empty = (): Store => ({
  datasets: [],
  versions: [],
  history: [],
});

let queue: Promise<unknown> = Promise.resolve();

export function storageMode(): "local-json" {
  return "local-json";
}

function filePath() {
  return path.resolve(
    process.cwd(),
    process.env.FLUIG_DEV_DATA_DIR?.trim() || ".data",
    "fluig-dev-store.json",
  );
}

async function readStore(): Promise<Store> {
  try {
    const value = JSON.parse(
      await readFile(filePath(), "utf8"),
    ) as Partial<Store>;

    return {
      datasets: Array.isArray(value.datasets) ? value.datasets : [],
      versions: Array.isArray(value.versions) ? value.versions : [],
      history: Array.isArray(value.history) ? value.history : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return empty();
    }

    throw error;
  }
}

async function mutate<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  const job = queue.then(async () => {
    const store = await readStore();
    const result = await fn(store);

    const target = filePath();
    await mkdir(path.dirname(target), { recursive: true });

    const temp = target + ".tmp";

    await writeFile(temp, JSON.stringify(store, null, 2), "utf8");

    await rename(temp, target);

    return result;
  });

  queue = job.then(
    () => undefined,
    () => undefined,
  );

  return job;
}

export async function listDatasets(search = "") {
  const store = await readStore();
  const query = search.trim().toLowerCase();

  return store.datasets
    .filter(
      (dataset) =>
        !query ||
        `${dataset.name} ${dataset.description} ${dataset.dataSource}`
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDataset(id: string) {
  const store = await readStore();

  return store.datasets.find((dataset) => dataset.id === id) ?? null;
}

export async function createDataset(
  input: Omit<DatasetRecord, "id" | "version" | "createdAt" | "updatedAt">,
) {
  return mutate((store) => {
    const now = new Date().toISOString();

    const record: DatasetRecord = {
      ...input,
      id: randomUUID(),
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    store.datasets.unshift(record);

    store.versions.unshift({
      id: randomUUID(),
      datasetId: record.id,
      version: 1,
      code: record.code,
      createdAt: now,
    });

    return record;
  });
}

export async function updateDataset(
  id: string,
  patch: Partial<Omit<DatasetRecord, "id" | "createdAt">>,
) {
  return mutate((store) => {
    const index = store.datasets.findIndex((dataset) => dataset.id === id);

    if (index < 0) {
      return null;
    }

    const current = store.datasets[index];

    const updated: DatasetRecord = {
      ...current,
      ...patch,
      id,
      createdAt: current.createdAt,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };

    store.datasets[index] = updated;

    store.versions.unshift({
      id: randomUUID(),
      datasetId: id,
      version: updated.version,
      code: updated.code,
      createdAt: updated.updatedAt,
    });

    return updated;
  });
}

export async function deleteDataset(id: string) {
  return mutate((store) => {
    const before = store.datasets.length;

    store.datasets = store.datasets.filter((dataset) => dataset.id !== id);

    store.versions = store.versions.filter(
      (version) => version.datasetId !== id,
    );

    store.history = store.history.filter((item) => item.datasetId !== id);

    return before !== store.datasets.length;
  });
}

export async function duplicateDataset(id: string) {
  const original = await getDataset(id);

  if (!original) {
    return null;
  }

  // Preserva também eventuais campos novos adicionados ao DatasetRecord.
  const input = { ...original } as Partial<DatasetRecord>;

  delete input.id;
  delete input.version;
  delete input.createdAt;
  delete input.updatedAt;

  return createDataset(
    input as Omit<DatasetRecord, "id" | "version" | "createdAt" | "updatedAt">,
  );
}

export async function listVersions(id: string) {
  const store = await readStore();

  return store.versions
    .filter((version) => version.datasetId === id)
    .sort((a, b) => b.version - a.version);
}

export async function addHistory(
  input: Omit<HistoryRecord, "id" | "createdAt">,
) {
  return mutate((store) => {
    const record: HistoryRecord = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    store.history.unshift(record);
    store.history = store.history.slice(0, 500);

    return record;
  });
}

export async function listHistory(limit = 100) {
  const store = await readStore();

  return store.history.slice(0, Math.max(1, Math.min(limit, 500)));
}

export async function getDashboardStats() {
  const store = await readStore();

  return {
    datasetCount: store.datasets.length,

    generationCount: store.history.filter((item) => item.action === "generate")
      .length,

    recentHistory: store.history.slice(0, 6),

    recentDatasets: store.datasets
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  };
}
