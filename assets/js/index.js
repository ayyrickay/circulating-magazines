const numberFormat = d3.format(".2f")
const sources = ["./assets/data/geodata.json", "./assets/data/circulation.json"];
const us1Chart = dc.geoChoroplethChart("#us1-chart")
let us1ChartRenderOption = 'rawData'
// const us2Chart = dc.geoChoroplethChart("#us2-chart")
const lineChart1 = dc.lineChart("#line-chart-1")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const lineChart1Width = document.getElementById('line-chart-1').offsetWidth
const lineChart1Height = document.getElementById('line-chart-1').offsetHeight


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

// Replace this method; it doesn't so much repair the geokey as it generates a new group
const repairGeoKey = (sourceGroup) => {
  console.log(sourceGroup.all().length)
    return {
        all: () => {
            return sourceGroup.all().map((d) => {
              const dimensions = d.key.split(',')
              d.key = dimensions[0]
              return d
            })
        }
    }
}

window.onresize = (event) => {
  const newlineChart1Width = document.getElementById('line-chart').offsetWidth - 75
  const newlineChart1Height = document.getElementById('line-chart').offsetHeight - 50
  lineChart1.width(newlineChart1Width).height(newlineChart1Height).transitionDuration(0)
  us1Chart.projection(d3.geoAlbersUsa()
    .scale(Math.min(document.getElementById('us1-chart').offsetWidth * 1.2, document.getElementById('us1-chart').offsetHeight * 1.5))
    .translate([document.getElementById('us1-chart').offsetWidth / 2, document.getElementById('us1-chart').offsetHeight / 2.5])
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
//     const chart1Key = geodata.dimension((d) => `${d["Title"]},${d["State/Region"]}`)
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
  const title1Circulation = crossfilter(title1Data)
  const title1States = title1Circulation.dimension(d => d.state_region)
  const chart1Key = title1Circulation.dimension((d) => `${d.state_region},${d.sampled_issue_date}`)
  const chart1Group = chart1Key.group().reduceSum(d => d.sampled_total_sales)
  const chart1Total = chart1Group.all().reduce((a, b) => ({value: a.value + b.value}))
  const dimension1 = title1Circulation.dimension(d => d.actual_issue_date)
  const genericCirculationGroup = dimension1.group().all()
  const circulationGroup1 = dimension1.group().reduceSum(d => d.issue_circulation)
  let circulationValuesMap = {}

  const generateValuesMap = () => {
    console.log('running values map')
    for(let i = 0; i < genericCirculationGroup.length; i++) {
        circulationValuesMap[genericCirculationGroup[i].key] = genericCirculationGroup[i].value
    }
    console.log(circulationValuesMap)
  }

  generateValuesMap()

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.updateColorScale = () => us1Chart.colorDomain(generateScale(chart1Group))
        us1Chart.width(us1Width)
                .height(us1Height)
                .dimension(title1States)
                .group(repairGeoKey(chart1Group))
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain(generateScale(chart1Group))
                .colorAccessor(d => {
                  return d ? d : 0
                })
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(document.getElementById('us1-chart').offsetWidth * 1.2, document.getElementById('us1-chart').offsetHeight * 1.5))
                  .translate([document.getElementById('us1-chart').offsetWidth / 2, document.getElementById('us1-chart').offsetHeight / 2.5])
                )
                .valueAccessor(function(kv) {
                    // console.log('Running value accessor', kv)
                    return transformValue(kv.value, 1000, chart1Total.value) // TODO: replace 1000 with some semblance of state population data
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })
                .on('filtered', () => {
                  console.log(circulationGroup1.all()[0])
                  generateValuesMap()
                })

        lineChart1
          .width(lineChart1Width-50)
          .height(lineChart1Height-50)
          .xUnits(d3.timeMonths)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(dimension1)
          .group(circulationGroup1)
          .colors(colorScales.blue[colorScales.blue.length - 1])
          .elasticY(true)
          .brushOn(false)
          .valueAccessor(function (d) {
              return d.value / circulationValuesMap[d.key]
          })
          .title(function (d) {
              return `${d.key.format('mmm dd, yyyy')}\nCirculation: ${d.value / circulationValuesMap[d.key]} `
          })
          .x(d3.scaleTime().domain([new Date(1925, 0, 1), new Date(1927, 0, 1)]))
          .render()

        dc.renderAll()
    })
})
