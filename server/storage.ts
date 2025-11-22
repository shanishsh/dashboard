import { randomUUID } from "crypto";
import type { DatasetFile, DatasetSummary } from "@shared/schema";

export interface IStorage {
  saveDataset(dataset: Omit<DatasetFile, "id">): Promise<DatasetFile>;
  getDataset(id: string): Promise<DatasetFile | undefined>;
  getAllDatasets(): Promise<DatasetSummary[]>;
  deleteDataset(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private datasets: Map<string, DatasetFile>;

  constructor() {
    this.datasets = new Map();
  }

  async saveDataset(dataset: Omit<DatasetFile, "id">): Promise<DatasetFile> {
    const id = randomUUID();
    const newDataset: DatasetFile = { ...dataset, id };
    this.datasets.set(id, newDataset);
    return newDataset;
  }

  async getDataset(id: string): Promise<DatasetFile | undefined> {
    return this.datasets.get(id);
  }

  async getAllDatasets(): Promise<DatasetSummary[]> {
    return Array.from(this.datasets.values()).map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      uploadedAt: dataset.uploadedAt,
      rowCount: dataset.rowCount,
      columnCount: dataset.columnCount,
    }));
  }

  async deleteDataset(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }
}

export const storage = new MemStorage();
