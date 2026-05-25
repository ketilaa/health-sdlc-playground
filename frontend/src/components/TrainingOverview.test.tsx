import "@testing-library/jest-dom";
import React from "react";
import { render, screen, within, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrainingOverview } from "./TrainingOverview";
import { halfMarathonFixture, liveDatasets } from "../data/halfMarathonFixture";
import { DatasetLoader } from "../data/loader";

const immediateLoader: DatasetLoader = {
  loadDefault: async () => halfMarathonFixture,
  listSelectableDatasets: async () => liveDatasets,
};

async function renderAndWaitForLoaded() {
  render(<TrainingOverview loader={immediateLoader} />);
  await waitFor(() =>
    expect(screen.queryByTestId("dataset-loading")).not.toBeInTheDocument()
  );
}

describe("TrainingOverview", () => {
  it("displays the default dataset name in the top-bar picker", async () => {
    await renderAndWaitForLoaded();
    const selector = screen.getByTestId("dataset-selector");
    expect(selector).toBeVisible();
    expect(selector).toHaveTextContent(
      "Half-Marathon Build-Up — 8 Week Consistent Plan"
    );
  });

  it("renders exactly 8 week rows including Week 8 and Week 1", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    expect(rows).toHaveLength(8);
    expect(screen.getByText("Week 8")).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
  });

  it("sorts weeks newest-first (Week 8 first, Week 1 last)", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    expect(rows[0]).toHaveTextContent("Week 8");
    expect(rows[rows.length - 1]).toHaveTextContent("Week 1");
  });

  it("week rows show only overview-relevant aggregates, not pace/HR/trend", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    rows.forEach((row) => {
      expect(within(row).getByTestId("week-total-distance")).toBeInTheDocument();
      expect(within(row).getByTestId("week-total-duration")).toBeInTheDocument();
      expect(within(row).getByTestId("week-activity-count")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("week-average-pace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("week-average-heart-rate")).not.toBeInTheDocument();
    expect(screen.queryByTestId("week-trend")).not.toBeInTheDocument();
  });

  it("shows 7 weeks with 3 activities and 1 week with 2 activities", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    const threes = rows.filter((r) => r.textContent?.includes("3 activities"));
    const twos = rows.filter((r) => r.textContent?.includes("2 activities"));
    expect(threes).toHaveLength(7);
    expect(twos).toHaveLength(1);
  });

  it("drill-down on Week 8 reveals 3 activities including Long run, Restorative run, Intervals", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    const week8 = rows.find((r) => r.textContent?.includes("Week 8"))!;
    await act(async () => {
      await userEvent.click(within(week8).getByRole("button"));
    });
    const panel = within(week8).getByTestId("week-activities");
    expect(panel).toBeVisible();
    const activities = within(panel).getAllByTestId("activity-row");
    expect(activities).toHaveLength(3);
    expect(within(panel).getByText("Long run")).toBeInTheDocument();
    expect(within(panel).getByText("Restorative run")).toBeInTheDocument();
    expect(within(panel).getByText("Intervals")).toBeInTheDocument();
  });

  it("drill-down on Week 4 (sickness) shows 2 activities and a skipped marker", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    const week4 = rows.find((r) => r.textContent?.includes("Week 4"))!;
    await act(async () => {
      await userEvent.click(within(week4).getByRole("button"));
    });
    const panel = within(week4).getByTestId("week-activities");
    expect(panel).toBeVisible();
    const activities = within(panel).getAllByTestId("activity-row");
    expect(activities).toHaveLength(2);
    const skipped = within(panel).getByTestId("skipped-activity");
    expect(skipped).toBeVisible();
    expect(within(panel).getByText(/Skipped due to sickness/)).toBeInTheDocument();
  });

  it("activity rows show only overview-relevant fields, not pace or HR", async () => {
    await renderAndWaitForLoaded();
    const rows = screen.getAllByTestId("week-row");
    const week8 = rows.find((r) => r.textContent?.includes("Week 8"))!;
    await act(async () => {
      await userEvent.click(within(week8).getByRole("button"));
    });
    const activities = screen.getAllByTestId("activity-row");
    activities.forEach((a) => {
      expect(within(a).getByTestId("activity-date")).toBeInTheDocument();
      expect(within(a).getByTestId("activity-type")).toBeInTheDocument();
      expect(within(a).getByTestId("activity-distance")).toBeInTheDocument();
      expect(within(a).getByTestId("activity-duration")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("activity-pace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("activity-heart-rate")).not.toBeInTheDocument();
  });

  it("does not list any 'Test Fixture' option in the dataset selector dropdown", async () => {
    // Provide an extra test-fixture option to confirm filtering.
    const loader: DatasetLoader = {
      loadDefault: async () => halfMarathonFixture,
      listSelectableDatasets: async () => [
        ...liveDatasets,
        {
          id: "hidden-test",
          name: "Test Fixture — Hidden Plan",
          isTestFixture: true,
          weeks: [],
        },
      ],
    };
    render(<TrainingOverview loader={loader} />);
    await waitFor(() =>
      expect(screen.queryByTestId("dataset-loading")).not.toBeInTheDocument()
    );
    const selector = screen.getByTestId("dataset-selector");
    await act(async () => {
      await userEvent.click(selector);
    });
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).queryByText(/Test Fixture/i)).not.toBeInTheDocument();
  });

  it("shows dataset-loading before week rows and removes it once data is loaded", async () => {
    let resolveLoad: (d: typeof halfMarathonFixture) => void;
    const slowLoader: DatasetLoader = {
      loadDefault: () =>
        new Promise((res) => {
          resolveLoad = res;
        }),
      listSelectableDatasets: async () => liveDatasets,
    };
    render(<TrainingOverview loader={slowLoader} />);
    // Loading visible, no week rows yet.
    expect(screen.getByTestId("dataset-loading")).toBeVisible();
    expect(screen.queryAllByTestId("week-row")).toHaveLength(0);

    await act(async () => {
      resolveLoad!(halfMarathonFixture);
    });

    await waitFor(() =>
      expect(screen.queryByTestId("dataset-loading")).not.toBeInTheDocument()
    );
    expect(screen.getAllByTestId("week-row").length).toBeGreaterThan(0);
  });
});