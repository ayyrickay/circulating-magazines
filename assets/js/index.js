const numberFormat = d3.format(".2f")
const sources = ["./assets/data/rawData/saev-geodata.json", "./assets/data/rawData/saev-circulation.json"];
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
  // console.log('generating new scale based on', us1ChartRenderOption)
  if (us1ChartRenderOption === 'percentOfTotal' || us1ChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
    console.log(chartGroup.all(), getTopValue(chartGroup))
    return [0, getTopValue(chartGroup)]
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

const getTopValue = (group) => {
  // console.log(d3.max(group.all(), d => d.value), group.all())
  return d3.max(group.all(), d => d.value) // TODO: Parse value string if needed
}

const lineTip = d3.tip()
  .attr('class', 'tooltip')
  .offset([-10, 0])
  .html((d) => {
    console.log(d)
    return `
    <div class="tooltip-data">
      <h4 class="key">Date</h4>
      <p>${d.data.key.format('mmm dd, yyyy')}</p>
    </div>
    <div class="tooltip-data">
      <h4 class="key">Circulation</h4>
      <p> ${d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} issues</p>
    </div>
    `
  })

  const mapTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-10, 0])
    .html((d) => {
      console.log(d)
      return `
      <div class="tooltip-data">
        <h4 class="key">State</h4>
        <p>${d.properties.name}</p>
      </div>
      <div class="tooltip-data">
        <h4 class="key">Circulation</h4>
        <p> ${d.properties.density.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} issues</p>
      </div>
      `
    })

// const industryChart = dc.bubbleChart("#industry-chart")
// const roundChart = dc.bubbleChart("#round-chart")

Promise.all(sources.map(url => d3.json(url)))
.then((data) => {

  const title1GeoData = data[0].filter(data => {
    return data["Title"] === "Saturday Evening Post" && stateCodes[data["State/Region"]]
  })

  const title1Circulation = data[1].filter(data => {
    return data["magazine"] === "Saturday Evening Post"
  })

  title1Circulation.forEach(d => {
    d.actual_issue_date = new Date(d.year, d.month-1, d.day)
  })

  title1GeoData.forEach(d => {
    const periodEndingComponents = d['Period Ending'].split('/')
    d.periodEnding = new Date(`19${periodEndingComponents[2]}`, parseInt(periodEndingComponents[0])-1, periodEndingComponents[1])
  })

  const geodata = crossfilter(title1GeoData)
  const circulation = crossfilter(title1Circulation)

  // Generate dimensions and groups for choropleth
  const title1States = geodata.dimension(d => d.State)
  const stateRegion = geodata.dimension((d) => d["State/Region"])
  const samplePeriodEnd = geodata.dimension(d => d.periodEnding)
  const salesByState = stateRegion.group().reduceSum((d) => d["Total"])
  const totalSalesByState = salesByState.all().reduce((a, b) => ({value: a.value + b.value}))

  console.log(totalSalesByState.value)
  const salesByStateOverPop = stateRegion.group().reduceSum(d => d["Total"] / 100 ) // TODO: Replace 100 with a STATE_POPULATION variable
  const salesByStateOverTotal = stateRegion.group().reduceSum(d => d["Total"] / totalSalesByState.value * 100) // percentage

  // generate dimensions and groups for line/range chart
  const title1Dates = circulation.dimension(d => d.actual_issue_date)
  const genericCirculationGroup = title1Dates.group().all()
  const title1CirculationByDate = title1Dates.group().reduceSum(d => d._circulation)

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

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.customUpdate = () => {
          // console.log(`Returned group is ${JSON.stringify(returnGroup().all())}`)
          us1Chart.colorDomain(generateScale(returnGroup()))
          us1Chart.group(returnGroup())
        }
        us1Chart.width(us1Width)
                .height(us1Height)
                .dimension(title1States)
                .group(returnGroup())
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
                .renderTitle(false)
                .on('pretransition', (chart) => {
                    console.log(chart.selectAll('g'))
                    chart.selectAll('g')
                        .call(mapTip)
                        .on('mouseover.mapTip', mapTip.show)
                        .on('mouseout.mapTip', mapTip.hide);
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
              return d.value
          })
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .renderTitle(false)
          .on('renderlet', (chart) => {
            chart.selectAll('circle').on('mouseover', (selected) => {
              samplePeriodEnd.filter(d => {
                const currentIssueDate = new Date(selected.x)
                const periodEnding = new Date(d)
                const periodStart = new Date(new Date(periodEnding).setMonth(periodEnding.getMonth() - 6))
                return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
              })
              console.log('initial', samplePeriodEnd)
              us1Chart.colorDomain(generateScale(returnGroup()))
              us1Chart.redraw()
            })

            chart.selectAll('circle').on('mouseleave', (selected) => {
              samplePeriodEnd.filter(null)
              console.log('after', us1Chart.filters())
              us1Chart.colorDomain(generateScale(returnGroup()))
              us1Chart.redraw()
            })
          })
          .on('pretransition', (chart) => {
              chart.selectAll('circle')
                  .call(lineTip)
                  .on('mouseover.lineTip', lineTip.show)
                  .on('mouseout.lineTip', lineTip.hide);
          })
          .render()


        lineChart1Range
          .width(lineChart1Width-50)
          .height(40)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(title1Dates)
          .group(title1CirculationByDate)
          .valueAccessor(d => d.value)
          .centerBar(true)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .round(d3.timeMonth.round)
          .alwaysUseRounding(true)
          .xUnits(() => 200)

        lineChart1Range.yAxis().ticks(0)

        // Establish global chart filter method
        dc.chartRegistry.list().forEach((chart) => {
          chart.on('filtered', () => {
            us1Chart.customUpdate()
          })
        })

        dc.renderAll()
    })
})
