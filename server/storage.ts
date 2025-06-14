import { values, type Value, type InsertValue } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getValue(id: number): Promise<Value | undefined>;
  getValues(): Promise<Value[]>;
  createValue(value: InsertValue): Promise<Value>;
}

export class MemStorage implements IStorage {
  private valuesMap: Map<number, Value>;
  currentId: number;

  constructor() {
    this.valuesMap = new Map();
    this.currentId = 1;
  }

  async getValue(id: number): Promise<Value | undefined> {
    return this.valuesMap.get(id);
  }

  async getValues(): Promise<Value[]> {
    return Array.from(this.valuesMap.values());
  }

  async createValue(insertValue: InsertValue): Promise<Value> {
    const id = this.currentId++;
    const value: Value = { 
      id,
      name: insertValue.name!,
      description: insertValue.description!,
      score: insertValue.score ?? 0,
      isCustom: insertValue.isCustom ?? false,
      rating: insertValue.rating ?? null
    };
    this.valuesMap.set(id, value);
    return value;
  }
}

export const storage = new MemStorage();
