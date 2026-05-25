import '@testing-library/jest-dom'
import path from 'path'
import fs from 'fs'

// Scenario 5: TrainingOverview component file has been deleted from the codebase.
// This test asserts the file does not exist on disk.

describe('TrainingOverview file deletion (Scenario 5)', () => {
  it('the file frontend/src/components/TrainingOverview.tsx does not exist', () => {
    const filePath = path.resolve(__dirname, './TrainingOverview.tsx')
    expect(fs.existsSync(filePath)).toBe(false)
  })
})

export {}