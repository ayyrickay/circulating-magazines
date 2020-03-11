import {titleCleanup} from './DataFormat.js'
import {geoReducerAdd, geoReducerRemove, geoReducerDefault, circulationReducerAdd, circulationReducerRemove, circulationReducerDefault} from './dc-reducers.js'


export function processData(geo, circulation) {
  const template = {
    stateRegion: {},
    samplePeriodEnd: {},
    salesByState: {
      all: () => []
    },
    dates: {},
    circulationByDate: {}
  }

  if (!geo || !circulation) {
    return template
  }

  const [geodata, circulationData] = titleCleanup(geo, circulation)
  const titleGeodata = crossfilter(geodata)
  const titleCirculation = crossfilter(circulationData)

  const stateRegion = titleGeodata.dimension(d => d.state_region)
  const samplePeriodEnd = titleGeodata.dimension(d => d.sample_period_ending)
  const salesByState = stateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  const dates = titleCirculation.dimension(d => d.actual_issue_date)
  const circulationByDate = dates.group().reduce(circulationReducerAdd, circulationReducerRemove, circulationReducerDefault)

  return {stateRegion, samplePeriodEnd, salesByState, dates, circulationByDate}
}
