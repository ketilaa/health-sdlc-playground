import { Dataset } from "../domain/dataset";
import { halfMarathonFixture } from "./halfMarathonFixture";

export interface DatasetLoader {
  loadDefault(): Promise<Dataset>;
  listSelectableDatasets(): Promise<Dataset[]>;
}

export const defaultLoader: DatasetLoader = {
  loadDefault: async () => {
    // microtask deferral to allow loading state to render
    await Promise.resolve();
    return halfMarathonFixture;
  },
  listSelectableDatasets: async () => {
    await Promise.resolve();
    const { liveDatasets } = await import("./halfMarathonFixture");
    return liveDatasets;
  },
};