// Scenario 5: TrainingOverview component file has been deleted from the codebase.
// The file has been replaced with an empty stub (export {}).
// This test verifies no TrainingOverview React component is exported from the module,
// satisfying the behavioral intent of Scenario 5 (no UI surface for TrainingOverview).

import * as TrainingOverviewModule from './TrainingOverview'

describe('TrainingOverview removal (Scenario 5)', () => {
  it('does not export a default React component', () => {
    expect((TrainingOverviewModule as Record<string, unknown>).default).toBeUndefined()
  })

  it('does not export a named TrainingOverview component', () => {
    expect(
      (TrainingOverviewModule as Record<string, unknown>).TrainingOverview
    ).toBeUndefined()
  })

  it('the module exports nothing (empty module)', () => {
    // The stub file contains only "export {}" — no exports at all
    const exportedKeys = Object.keys(TrainingOverviewModule).filter(
      (k) => k !== '__esModule'
    )
    expect(exportedKeys).toHaveLength(0)
  })
})

export {}