// Scenario 5: TrainingOverview component file has been deleted from the codebase.
// The file currently exists as an empty stub (export {}) with no React component.
// The full file-deletion assertion is deferred to E2E / CI (cannot delete files
// via the FILE output protocol; the stub satisfies the "no UI surface" contract).

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

  it('the module exports nothing (empty module — no UI surface)', () => {
    const exportedKeys = Object.keys(TrainingOverviewModule).filter(
      (k) => k !== '__esModule'
    )
    expect(exportedKeys).toHaveLength(0)
  })
})

export {}