"use client";

import React, { useEffect, useState } from "react";
import { Dataset, WeekAggregate, sortedWeeksNewestFirst } from "../domain/dataset";
import { DatasetLoader, defaultLoader } from "../data/loader";
import { WeekRow } from "./WeekRow";
import { DatasetSelector } from "./DatasetSelector";

interface Props {
  loader?: DatasetLoader;
}

export function TrainingOverview({ loader = defaultLoader }: Props) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selectableDatasets, setSelectableDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [ds, options] = await Promise.all([
        loader.loadDefault(),
        loader.listSelectableDatasets(),
      ]);
      if (!mounted) return;
      setDataset(ds);
      setSelectableDatasets(options);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loader]);

  const sortedWeeks: WeekAggregate[] = dataset
    ? sortedWeeksNewestFirst(dataset.weeks)
    : [];

  return (
    <div>
      <header className="top-bar">
        <DatasetSelector
          currentName={dataset?.name ?? ""}
          options={selectableDatasets}
        />
      </header>
      <main aria-busy={loading} aria-live="polite">
        <div className="page-header">
          <h1>Training Overview</h1>
          <p className="subtitle">8 weeks · most recent first</p>
        </div>
        {loading && (
          <div data-testid="dataset-loading" aria-label="Loading training data">
            Loading training data…
          </div>
        )}
        {!loading && (
          <div className="week-list">
            {sortedWeeks.map((week) => (
              <WeekRow key={week.weekNumber} week={week} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}