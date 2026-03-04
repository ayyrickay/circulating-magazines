import assert from 'assert'
import { processData } from '../assets/js/helpers/CrossfilterGenerator.js'

describe('CrossfilterGenerator', () => {
  it('should return a template when geo or circulation data is missing', () => {
    const output = processData(null, null)

    assert.deepEqual(Object.keys(output).sort(), [
      'circulationByDate',
      'dates',
      'salesByState',
      'samplePeriodEnd',
      'stateRegion',
      'titleCirculation',
      'titleGeoData'
    ])
    assert.deepEqual(output.salesByState.all(), [])
  })
})
