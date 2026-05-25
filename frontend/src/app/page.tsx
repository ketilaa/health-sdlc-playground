import { TrainingOverview } from "../components/TrainingOverview";

export default function Page() {
  return (
    <>
      <p style={{ position: "absolute", left: -10000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        a space to explore health datasets
      </p>
      <TrainingOverview />
    </>
  );
}