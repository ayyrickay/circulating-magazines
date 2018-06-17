const numberFormat = d3.format(".2f")
const sources = ["./assets/data/geodata.json", "./assets/data/circulation.json"];
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const us2Chart = dc.geoChoroplethChart("#us2-chart")
const lineChart=dc.compositeChart("#line-chart")
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

const filterByMagazine = (sourceGroup, magazine) => {
    return {
        all: () => {
            return sourceGroup.all().filter((d) => {
              const dimensions = d.key.split(',')
              d.key = dimensions[1]
              return dimensions[0] === magazine
            });
        }
    }
}

const filterCirculationByMagazine = (sourceGroup, magazine) => {
    return {
        all: () => {
            return sourceGroup.all().filter((d) => {
              console.log('BEFORE', d)
              const dimensions = d.key ? d.key.split(',') : [null, null]
              d.key = dimensions[1]
              console.log('AFTER', d)
              return dimensions[0] === magazine
            });
        }
    }
}

// const industryChart = dc.bubbleChart("#industry-chart")
// const roundChart = dc.bubbleChart("#round-chart")

Promise.all(sources.map(url => d3.json(url)))
.then((data) => {
    const geodata = crossfilter(data[0])
    const circulation = crossfilter(data[1])
    const states = geodata.dimension(d => d.State)
    const chart1Key = geodata.dimension((d) => `${d["Title"]},${d["State/Region"]}`)
    const chart2Key = geodata.dimension((d) => `${d["Title"]},${d["State/Region"]}`)
    const chart1Group = chart1Key.group().reduceSum((d) => d["Total"])
    const chart2Group = chart2Key.group().reduceSum((d) => d["Total"])

    d3.json("./assets/geo/us-states.json").then(function (statesJson) {
        console.log("loading state json")
        us1Chart.dimension(states)
                .group(filterByMagazine(chart1Group, "New Yorker"))
                .colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                .colorDomain([0, 50000])
                .colorCalculator(function (d) { return d ? us1Chart.colors()(d) : '#ccc' })
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(document.getElementById('us2-chart').offsetWidth * 1.2, document.getElementById('us2-chart').offsetHeight * 2.1))
                  .translate([document.getElementById('us2-chart').offsetWidth / 2, document.getElementById('us2-chart').offsetHeight / 2])
                )
                .valueAccessor(function(kv) {
                    console.log(kv)
                    return kv.value
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })

        us2Chart.dimension(states)
                .group(filterByMagazine(chart2Group, "Saturday Evening Post"))
                .colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                .colorDomain([0, 1000000])
                .colorCalculator(function (d) { return d ? us2Chart.colors()(d) : '#ccc' })
                .overlayGeoJson(statesJson.features, "state", function (d) {
                    return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(document.getElementById('us2-chart').offsetWidth * 1.2, document.getElementById('us2-chart').offsetHeight * 2.1))
                  .translate([document.getElementById('us2-chart').offsetWidth / 2, document.getElementById('us2-chart').offsetHeight / 2])
                )
                .valueAccessor(function(kv) {
                    console.log(kv)
                    return kv.value
                })
                .title(function (d) {
                    return "State: " + d.key + "\nCirculation Total: " + d.value ? d.value : 0
                })

        const all = circulation.groupAll()
        const lineChartYear = circulation.dimension(d => d.year)
        const lineChartYear1 = circulation.dimension(d => `${d.magazine},${d.year}`)
        const lineChartYear2 = circulation.dimension(d => `${d.magazine},${d.year}`)

        const circulationGroup1 = lineChartYear1.group().reduceSum(d => d.circulation)
        const circulationGroup2 = lineChartYear2.group().reduceSum(d => d.circulation)

        lineChart.width(1160)
            .height(250)
            .margins({ top: 10, right: 10, bottom: 20, left: 40 })
            .dimension(lineChartYear)
            .transitionDuration(500)
            .elasticY(true)
            .brushOn(false)
            .valueAccessor(function (d) {
                return d.value;
            })
            .title(function (d) {
                return "\nNumber of Povetry: " + d.key;

            })
            .x(d3.scaleTime().domain([1925, 2001]))
            .compose([
                dc.lineChart(lineChart).group(filterCirculationByMagazine(circulationGroup1, "New Yorker")),
                dc.lineChart(lineChart).group(filterCirculationByMagazine(circulationGroup2, "Saturday Evening Post"))
            ])

        dc.renderAll()
    })
})
