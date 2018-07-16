const numberFormat = d3.format(".2f")
const sources = ["./assets/data/geodata.json", "./assets/data/circulation.json"];
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const us2Chart = dc.geoChoroplethChart("#us2-chart")
const composite=dc.compositeChart("#line-chart")
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

  const title1Circulation = crossfilter(title1Data)
  const title1States = title1Circulation.dimension(d => d.state_region)
  const chart1Key = title1Circulation.dimension((d) => `${d.state_region},${d.sampled_issue_date}`)
  const chart1Group = chart1Key.group().reduceSum(d => d.sampled_total_sales)

  const title2Circulation = crossfilter(title2Data)
  const title2States = title2Circulation.dimension(d => d.state_region)
  const chart2Key = title2Circulation.dimension((d) => `${d.state_region}, ${d.sampled_issue_date}`)
  const chart2Group = chart2Key.group().reduceSum(d => d.sampled_total_sales)

  console.log(getTopValue(chart1Group), getTopValue(chart2Group))
  console.log(repairGeoKey(chart1Group).all().length)
    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        console.log("loading state json")
        us1Chart.dimension(title1States)
                .group(repairGeoKey(chart1Group))
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain([0, getTopValue(chart1Group)])
                .colorAccessor(d => d ? d : 0)
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(document.getElementById('us2-chart').offsetWidth * 1.2, document.getElementById('us2-chart').offsetHeight * 2.1))
                  .translate([document.getElementById('us2-chart').offsetWidth / 2, document.getElementById('us2-chart').offsetHeight / 2])
                )
                .valueAccessor(function(kv) {
                    // console.log(kv)
                    return kv.value
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })

        us2Chart.dimension(title2States)
                .group(repairGeoKey(chart2Group))
                .colors(d3.scaleQuantize().range(colorScales.red))
                .colorDomain([0, getTopValue(chart2Group)])
                .colorAccessor(d => d ? d : 0)
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(document.getElementById('us2-chart').offsetWidth * 1.2, document.getElementById('us2-chart').offsetHeight * 2.1))
                  .translate([document.getElementById('us2-chart').offsetWidth / 2, document.getElementById('us2-chart').offsetHeight / 2])
                )
                .valueAccessor(function(kv) {
                    // console.log(kv)
                    return kv.value
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })


        const dimension1 = title1Circulation.dimension(dc.pluck('actual_issue_date'))
        const lineChartYear1 = title1Circulation.dimension(d => d.actual_issue_date)
        const lineChartYear2 = title2Circulation.dimension(d => d.actual_issue_date)

        const circulationGroup1 = lineChartYear1.group().reduceSum(d => d.issue_circulation)
        const circulationGroup2 = lineChartYear2.group().reduceSum(d => d.issue_circulation)

        composite
          .width(1100)
          .height(250)
          .xUnits(d3.timeMonths)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .elasticY(true)
          .brushOn(false)
          .valueAccessor(function (d) {
              return d.value;
          })
          .title(function (d) {
              return `${d.key.format('mmm dd, yyyy')}\nCirculation: ${d.value} `
          })
          .x(d3.scaleTime().domain([new Date(1925, 0, 1), new Date(1927, 0, 1)]))
          .renderHorizontalGridLines(true)
          .compose([
            dc.lineChart(composite)
              .dimension(dimension1)
              .colors('blue')
              .group(circulationGroup1, 'New Yorker'),
            dc.lineChart(composite)
              .dimension(dimension1)
              .colors('red')
              .group(circulationGroup2, 'Saturday Evening Post')
          ])
          .render()

        dc.renderAll()
    })
})
