const numberFormat = d3.format(".2f")
const sources = ["./assets/data/geodata.json", "./assets/data/circulation.json"];
const us1Chart = dc.geoChoroplethChart("#us1-chart")
let us1ChartRenderOption = 'rawData'
// const us2Chart = dc.geoChoroplethChart("#us2-chart")
const lineChart1 = dc.lineChart("#line-chart-1")
const lineChart1Range = dc.barChart("#line-chart-1-range")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const lineChart1Width = document.getElementById('line-chart-1').offsetWidth
const lineChart1Height = document.getElementById('line-chart-1').offsetHeight

const getWidth = (element) => {
  if (document.getElementById(element)) {
    return document.getElementById('line-chart-1').offsetWidth
  } else {
    console.error(`No element found with ID ${element}`)
    return 0
  }
}

const getHeight = (element) => {
  if (document.getElementById(element)) {
    return document.getElementById('line-chart-1').offsetHeight
  } else {
    console.error(`No element found with ID ${element}`)
    return 0
  }
}


const stateCodes = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'American Samoa': 'AS',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'District Of Columbia': 'DC',
  'Federated States Of Micronesia': 'FM',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Guam': 'GU',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Marshall Islands': 'MH',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Northern Mariana Islands': 'MP',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Palau': 'PW',
  'Pennsylvania': 'PA',
  'Puerto Rico': 'PR',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virgin Islands': 'VI',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
}

const colorScales = {
  red: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
  blue: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
  teal: ['#B2DFDB', '#4DB6AC', '#009688', '#00796B', '#004D40'],
  purple: ['#E1BEE7', '#BA68C8', '#9C27B0', '#7B1FA2', '#4A148C']
}

const transformValue = (data, statePopulation, total) => {
  if (us1ChartRenderOption === 'percentOfPopulation') {
    return data / statePopulation
  } else if (us1ChartRenderOption === 'percentOfTotal') {
    return data / total * 100
  } else {
    return data
  }
}

const generateScale = (chartGroup) =>  {
  console.log('generating new scale based on', us1ChartRenderOption)
  if (us1ChartRenderOption === 'percentOfTotal' || us1ChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
    return [0, getTopValue(chartGroup)]
  }
}

// Complex method; it doesn't so much repair the geokey as it generates a new group
const repairGeoKey = (sourceGroup) => {

  // repair the key for the group (focus on state, not the deduped dates)
  const cleanGeoGroup = sourceGroup.all().map((d) => {
    const dimensions = d.key.split(',')
    d.key = dimensions[0]
    return d
  })

  // Create an object to collapse states into one group
  const consolidatedObject = {}

  for (let i = 0; i < cleanGeoGroup.length - 1; i++) {
    if (consolidatedObject[cleanGeoGroup[i].key]) {
      consolidatedObject[cleanGeoGroup[i].key] += cleanGeoGroup[i].value
    } else {
      consolidatedObject[cleanGeoGroup[i].key] = cleanGeoGroup[i].value
    }
  }

  // Transform object back into array of objects
  const consolidatedArray = Object.keys(consolidatedObject).map((key) => {
    return {key: key, value: consolidatedObject[key]}
  })

  // return object array as a pseudo crossfilter 'group'
  return {
      all: () => {
          return consolidatedArray
      }
  }
}

window.onresize = (event) => {
  lineChart1.width(getWidth('line-chart-1') - 50).height(getHeight('line-chart-1') - 50).transitionDuration(0)
  us1Chart
    .projection(d3.geoAlbersUsa()
      .scale(Math.min(getWidth('us1-chart') * 2.5, getHeight('us1-chart') * 1.7))
      .translate([getWidth('us1-chart') / 2.5, getHeight('us1-chart') / 2.5])
    )
    .transitionDuration(0)
  // us2Chart.projection(d3.geoAlbersUsa()
  //   .scale(Math.min(document.getElementById('us2-chart').offsetWidth * 1.2, document.getElementById('us2-chart').offsetHeight * 1.5))
  //   .translate([document.getElementById('us2-chart').offsetWidth / 2, document.getElementById('us2-chart').offsetHeight / 2.5])
  // ).transitionDuration(0)

  dc.renderAll()
  us1Chart.transitionDuration(750)
  // us2Chart.transitionDuration(750)
  lineChart1.transitionDuration(750)
}

const filterCirculationByMagazine = (sourceGroup, magazine) => {
    return {
        all: () => {
          // console.log('sourcegroup', sourceGroup.all())
            return sourceGroup.all().filter((d) => {
              const dimensions = d.key ? d.key.split(',') : [null, null]
              d.key = dimensions[1]
              return dimensions[0] === magazine
            })
        }
    }
}

const filterCirculationData = (sourceGroup) => {
    return {
        all:function () {
            return sourceGroup.all().filter(function(d) {
                return d
            })
        }
    }
}

const getTopValue = (group) => {
  return group.top(60)[59].value
}

// const industryChart = dc.bubbleChart("#industry-chart")
// const roundChart = dc.bubbleChart("#round-chart")

// Promise.all(sources.map(url => d3.json(url)))
// .then((data) => {
//     const geodata = crossfilter(data[0])
//     const circulation = crossfilter(data[1])
//     const states = geodata.dimension(d => d.State)
//     const stateAndDate = geodata.dimension((d) => `${d["Title"]},${d["State/Region"]}`)
//     const chart2Key = geodata.dimension((d) => `${d["Title"]},${d["State/Region"]}`)

d3.json("./assets/data/joined_data.json").then((unparsedData) => {

  const data = unparsedData.map(d => {
  	d.actual_issue_date = new Date(d.actual_issue_date)
    return d
  })

  const title1Data = data.filter((d) => {
                        return d.magazine_title === 'New Yorker'
                      })

  const title2Data = data.filter((d) => {
                        return d.magazine_title === 'Saturday Evening Post'
                      })

  document.getElementById('magazine-title-1').innerHTML = title1Data[0].magazine_title
  // Create crossfilter
  const title1Circulation = crossfilter(title1Data)

  // Generate dimensions and groups for choropleth
  const title1States = title1Circulation.dimension(d => d.state_region)
  const stateAndDate = title1Circulation.dimension((d) => `${d.state_region},${d.sampled_issue_date}`)
  const salesByState = stateAndDate.group().reduceSum(d => d.sampled_total_sales)
  const totalSalesByState = salesByState.all().reduce((a, b) => ({value: a.value + b.value}))
  const salesByStateOverPop = stateAndDate.group().reduceSum(d => d.sampled_total_sales / d.state_population * 100 ) // percentage
  const salesByStateOverTotal = stateAndDate.group().reduceSum(d => d.sampled_total_sales / totalSalesByState.value * 100) // percentage

  // generate dimensions and groups for line/range chart
  const title1Dates = title1Circulation.dimension(d => d.actual_issue_date)
  const genericCirculationGroup = title1Dates.group().all()
  const title1CirculationByDate = title1Dates.group().reduceSum(d => d.issue_circulation)

  // Generate a map of circulation values
  let circulationValuesMap = {}
  const generateValuesMap = () => {
    for(let i = 0; i < genericCirculationGroup.length; i++) {
        circulationValuesMap[genericCirculationGroup[i].key] = genericCirculationGroup[i].value
    }
    // console.log(circulationValuesMap)
  }

  // Understands how to return the appropriate group for choropleth visualization
  const returnGroup = () => {
    if (us1ChartRenderOption === 'percentOfPopulation') {
      // console.trace('returning pop', salesByStateOverPop)
      return salesByStateOverPop
    } else if (us1ChartRenderOption === 'percentOfTotal') {
      // console.trace('returning total', salesByStateOverTotal)
      return salesByStateOverTotal
    } else {
      // console.trace('returning raw data', salesByState)
      return salesByState
    }
  }

  generateValuesMap()

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.customUpdate = () => {
          // console.log(`Returned group is ${JSON.stringify(returnGroup().all())}`)
          us1Chart.colorDomain(generateScale(returnGroup()))
          us1Chart.group(repairGeoKey(returnGroup()))
        }
        us1Chart.width(us1Width)
                .height(us1Height)
                .dimension(title1States)
                .group(repairGeoKey(returnGroup()))
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain(generateScale(returnGroup()))
                .colorAccessor(d => {
                  return d ? d : 0
                })
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(getWidth('us1-chart') * 2.5, getHeight('us1-chart') * 1.7))
                  .translate([getWidth('us1-chart') / 2.5, getHeight('us1-chart') / 2.5])
                )
                .valueAccessor(function(kv) {
                    return kv.value
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })

        lineChart1
          .width(lineChart1Width-50)
          .height(lineChart1Height-50)
          .xUnits(d3.timeMonths)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(title1Dates)
          .rangeChart(lineChart1Range)
          .group(title1CirculationByDate)
          .colors(colorScales.blue[colorScales.blue.length - 1])
          .elasticY(true)
          .brushOn(false)
          .valueAccessor(function (d) {
              return d.value / circulationValuesMap[d.key]
          })
          .title(function (d) {
            // console.log(d.key)
              return `${d.key.format('mmm dd, yyyy')}\nCirculation: ${d.value / circulationValuesMap[d.key]} `
          })
          .x(d3.scaleTime().domain([new Date(1925, 0, 1), new Date(1927, 0, 1)]))
          .render()


        lineChart1Range
          .width(lineChart1Width-50)
          .height(40)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(title1Dates)
          .group(title1CirculationByDate)
          .valueAccessor(d => d.value / circulationValuesMap[d.key])
          .centerBar(true)
          .x(d3.scaleTime().domain([new Date(1925, 0, 1), new Date(1927, 0, 1)]))
          .round(d3.timeMonth.round)
          .alwaysUseRounding(true)
          .xUnits(() => 200);

        lineChart1Range.yAxis().ticks(0)

        // Establish global chart filter method
        dc.chartRegistry.list().forEach((chart) => {
          chart.on('filtered', () => {
            generateValuesMap()
            us1Chart.customUpdate()
          })
        })

        dc.renderAll()
    })
})
