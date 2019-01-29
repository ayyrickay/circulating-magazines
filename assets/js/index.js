const numberFormat = d3.format(".2f")
const titleSelector = document.getElementById('title-select')
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const lineChart1 = dc.lineChart("#line-chart-1")
const lineChart1Range = dc.barChart("#line-chart-1-range")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const lineChart1Width = document.getElementById('line-chart-1').offsetWidth
const lineChart1Height = document.getElementById('line-chart-1').offsetHeight
const state = {
  isClicked: false,
  selectedMagazine: 'saev',
  totalSalesByState: null,
  us1ChartRenderOption: 'rawData'
}

titleSelector.value = 'Saturday Evening Post'

new Awesomplete(titleSelector, {
  autoFirst: true,
  list: [
    {value: "saev", label: "Saturday Evening Post"},
    {value: "neyo", label: "New Yorker"},
    {value: "vafa", label: "Vanity Fair"},
    {value: "blma", label: "Black Mask"},
    {value: "coll", label: "Collier's"},
    {value: "amma", label: "American Magazine"},
    {value: "stsm", label: "Street & Smith Combination"},
    {value: "adve", label: "Adventure"}
  ],
  replace: (suggestion) => {
    titleSelector.value = suggestion.label;
  }
})

const changeRenderOption = (event) => {
  if (state.isClicked) {
    state.us1ChartRenderOption = event.target.value
    us1Chart.customUpdate()
    dc.redrawAll()
  } else {
    document.getElementById('renderOption1').checked = true
    document.getElementById('renderOption2').checked = false
  }
}

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
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return data / statePopulation
  } else {
    return data
  }
}

const generateScale = (chartGroup) => {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
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

  dc.renderAll()
  us1Chart.transitionDuration(750)
  lineChart1.transitionDuration(750)
}

const getTopValue = (group) => d3.max(group.all(), d => {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return d.value.sampled_total_sales / d.value.state_population
  } else {
    return d.value.sampled_total_sales
  }
})

const renderCharts = (data) => {
  const title1GeoData = data[0].filter(data => {
    if (!data) {return false}
    return stateCodes[data.state_region]
  })

  const title1Circulation = data[1]

  title1Circulation.forEach(d => {
    d.actual_issue_date = new Date(d.actual_issue_date)
  })

  const geodata = crossfilter(title1GeoData)
  const circulation = crossfilter(title1Circulation)

  // Reducer function for raw geodata
  const geoReducerAdd = (p, v) => {
    ++p.count
    p.sampled_mail_subscriptions += v.sampled_mail_subscriptions
    p.sampled_single_copy_sales += v.sampled_single_copy_sales
    p.sampled_total_sales += v.sampled_total_sales
    p.state_population = v.state_population // only valid for population viz
    return p
  }
  const geoReducerRemove = (p, v) => {
    --p.count
    p.sampled_mail_subscriptions -= v.sampled_mail_subscriptions
    p.sampled_single_copy_sales -= v.sampled_single_copy_sales
    p.sampled_total_sales -= v.sampled_total_sales
    p.state_population = v.state_population // only valid for population viz
    return p
  }

  // generic georeducer
  const geoReducerDefault = () => ({
    count: 0,
    sampled_mail_subscriptions: 0,
    sampled_single_copy_sales: 0,
    sampled_total_sales: 0,
    state_population: 0
  })

  // Generate dimensions and groups for choropleth
  const stateRegion = geodata.dimension((d) => d.state_region)
  const samplePeriodEnd = geodata.dimension(d => d.sample_period_ending)
  const salesByState = stateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  // generate dimensions and groups for line/range chart
  const title1Dates = circulation.dimension(d => d.actual_issue_date)
  const genericCirculationGroup = title1Dates.group().all()
  const title1CirculationByDate = title1Dates.group().reduce((p, v) => {
        ++p.count
        p.issue_circulation += v.issue_circulation
        p.price = v.price
        p.type = v.type
        p.publishing_company = v.publishing_company
        p.titles_included = v.titles_included
        p.editor = v.editor
        return p
    },
    /* callback for when data is removed from the current filter results */
    (p, v) => {
        --p.count;
        p.issue_circulation -= v.issue_circulation
        p.price = v.price
        p.type = v.type
        p.publishing_company = v.publishing_company
        p.titles_included = v.titles_included
        p.editor = v.editor
        return p
    },
    /* initialize p */
    () => ({
            count: 0,
            issue_circulation: 0,
            price: "",
            type: "",
            publishing_company: "",
            titles_included: "",
            editor: ""
        })
    )

  const renderNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const generateMapTipText = (sampled_total_sales, state_population) => {
    if (state.us1ChartRenderOption === 'percentOfPopulation') {
      return `${(sampled_total_sales / state_population).toFixed(3)} issues per person`
    } else {
      return `${renderNumberWithCommas(sampled_total_sales)} issues`
    }
  }

  const mapTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-10, 0])
    .html((d) => {
      const selectedItem = salesByState.all().filter(item => item.key === d.properties.name)[0]
      if(!selectedItem) {
        return `<div class="tooltip-data"></div>`
      }
      const {key, value: {sampled_total_sales, sampled_mail_subscriptions, sampled_single_copy_sales, state_population}} = selectedItem
      return `
      <div class="tooltip-data">
        <h4 class="key">State</h4>
        <p>${key}</p>
      </div>
      ${state.isClicked ?
        `<div class="tooltip-data flex sb">
        ${sampled_mail_subscriptions ?
          `<div class="half-em-margin">
            <h4 class="key">Mail Subscriptions</h4>
            <p> ${renderNumberWithCommas(sampled_mail_subscriptions)}</p>
           </div>
          `
        : ''}
        ${sampled_single_copy_sales ?
          `<div class="half-em-margin">
            <h4 class="key">Single Copy Sales</h4>
            <p> ${renderNumberWithCommas(sampled_single_copy_sales)}</p>
           </div>`
        : ''}
        </div>
        <div class="tooltip-data flex sb">
          <div class="half-em-margin">
            <h4 class="key">% of State Population</h4>
            <p> ${(sampled_total_sales/state_population * 100).toFixed(3)}%</p>
          </div>
          <div class="half-em-margin">
            <h4 class="key">% of Total Circulation</h4>
            <p> ${(sampled_total_sales/state.totalSalesByState.value.sampled_total_sales * 100).toFixed(3)}%</p>
          </div>
        </div>
        <div class="tooltip-data">
          <h4 class="key">Total Circulation</h4>
          <p> ${generateMapTipText(sampled_total_sales, state_population)}</p>
        </div>
        `
        : `
          <div class="tooltip-data">
            <h4 class="key">Data</h4>
            <p> Please select a specific issue for more detailed data</p>
          </div>
        `}
      `
    })

    const lineTip = d3.tip()
      .attr('class', 'tooltip')
      .offset([-10, 0])
      .html(({data: {key, value: {issue_circulation, price, type, publishing_company, editor}}}) => {
        return `
        <div class="tooltip-data">
          <h4 class="key">Date</h4>
          <p>${key.format('mmm dd, yyyy')}</p>
        </div>
        <div class="tooltip-data">
          <h4 class="key">Circulation</h4>
          <p> ${issue_circulation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} issues</p>
        </div>
        <div class="tooltip-data flex sb">
          <div class="half-em-margin">
            <h4 class="key">Editor</h4>
            <p>${editor ? editor : 'Unkown'}</p>
          </div>
          <div class="half-em-margin">
            <h4 class="key">Price</h4>
            <p>${price ? price : 'Unknown'}</p>
          </div>
        </div>
        <div class="tooltip-data">
          <h4 class="key">Publishing Company</h4>
          <p>${publishing_company ? publishing_company : 'Unkown'}</p>
        </div>
        `
      })

    const filterChoroplethByIssue = (selected) => {
      if (!state.isClicked) {
        samplePeriodEnd.filter(d => {
          const currentIssueDate = new Date(selected.x)
          const periodEnding = new Date(d)
          const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getYear(), 6, 1)) // error is definitely on this line
          return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
        })

        us1Chart.redraw()
      }
    }

    const resetCharts = () => {
      samplePeriodEnd.filter(null)
      state.isClicked = false

      document.getElementById('renderOption1').checked = true
      document.getElementById('renderOption2').checked = false
      document.getElementById('clearIssueFilterButton').style.visibility = 'hidden'
      state.us1ChartRenderOption = 'rawData'

      lineTip.hide()
      lineChart1.on('pretransition', (chart) => {
          chart.selectAll('circle')
              .call(lineTip)
              .on('mouseover.lineTip', lineTip.show)
              .on('mouseout.lineTip', lineTip.hide)
      })
      .on('renderlet.mouseover', (chart) => {
        chart.selectAll('circle').on('mouseover.hover', (selected) => {
          samplePeriodEnd.filter(d => {
            const currentIssueDate = new Date(selected.x)
            const periodEnding = new Date(d)
            const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 6, 1)) // error is definitely on this line
            return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
          })

          us1Chart.colorDomain(generateScale(salesByState))
          us1Chart.redraw()
        })

        chart.selectAll('circle').on('mouseleave.hover', (selected) => {
          samplePeriodEnd.filter(null)
          us1Chart.colorDomain(generateScale(salesByState))
          us1Chart.redraw()
        })
      })

      us1Chart.customUpdate()
      us1Chart.colorDomain(generateScale(salesByState))
      us1Chart.redraw()
    }

    window.addEventListener("awesomplete-selectcomplete", (e) => {
                    state.selectedMagazine = e.text.value
                    resetCharts()
                    generateCharts()
                }, false)

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.customUpdate = () => {
          us1Chart.group(salesByState)
          us1Chart.redraw()
        }
        us1Chart.width(us1Width)
                .height(us1Height)
                .dimension(stateRegion)
                .group(salesByState)
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain(generateScale(salesByState))
                .colorAccessor(d => {
                  return d ? d : 0
                })
                .overlayGeoJson(statesJson.features, "state", d => {
                  return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(getWidth('us1-chart') * 2.5, getHeight('us1-chart') * 1.7))
                  .translate([getWidth('us1-chart') / 2.5, getHeight('us1-chart') / 2.5])
                )
                .valueAccessor(kv => {
                  if (kv.value !== undefined) {
                    if (state.us1ChartRenderOption === 'percentOfPopulation') {
                      return kv.value.sampled_total_sales / kv.value.state_population
                    } else {
                      return kv.value.sampled_total_sales
                    }
                  }
                })
                .renderTitle(false)
                .on('renderlet.click', (chart) => {
                  chart.selectAll('path').on('click', () => {})
                })
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(mapTip)
                        .on('mouseover.mapTip', mapTip.show)
                        .on('mouseout.mapTip', mapTip.hide);
                })
                .on('filtered', (chart, filter) => {
                  // console.log(chart.filters())
                  // console.log(filter)
                })
                .on("preRender", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })
                .on("preRedraw", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                });

        lineChart1.unClick = resetCharts

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
          .valueAccessor(d => d.value.issue_circulation)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .renderTitle(false)
          .on('renderlet.click', (chart) => {
            chart.selectAll('circle').on('click', (selected) => {
              document.getElementById('clearIssueFilterButton').style.visibility = 'visible'
              lineTip.show(selected)
              samplePeriodEnd.filter(d => {
                const currentIssueDate = new Date(selected.x)
                const periodEnding = new Date(d)
                const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 6, 1)) // error is definitely on this line
                return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
              })
              state.isClicked = true
              state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
              us1Chart.colorDomain(generateScale(salesByState))
              us1Chart.redraw()
              // squishy logic
              chart.selectAll('circle').on('mouseleave', null)
                .on('mouseover.lineTip', null)
                .on('mouseout.lineTip', null)
                .on('mouseover.hover', null)
                .on('mouseleave.hover', null)
            })
          })
          .on('renderlet.mouseover', (chart) => {
            chart.selectAll('circle').on('mouseover.hover', (selected) => {
              samplePeriodEnd.filter(d => {
                const currentIssueDate = new Date(selected.x)
                const periodEnding = new Date(d)
                const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 6, 1)) // error is definitely on this line
                return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
              })

              us1Chart.colorDomain(generateScale(salesByState))
              us1Chart.redraw()
            })

            chart.selectAll('circle').on('mouseleave.hover', (selected) => {
              samplePeriodEnd.filter(null)
              us1Chart.colorDomain(generateScale(salesByState))
              us1Chart.redraw()
            })

          })
          .on('pretransition', (chart) => {
              chart.selectAll('circle')
                  .call(lineTip)
                  .on('mouseover.lineTip', lineTip.show)
                  .on('mouseout.lineTip', lineTip.hide)
          })
          .render()


        lineChart1Range
          .width(lineChart1Width-50)
          .height(40)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(title1Dates)
          .group(title1CirculationByDate)
          .valueAccessor(d => d.value.issue_circulation)
          .centerBar(true)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .round(d3.timeMonth.round)
          .alwaysUseRounding(true)
          .xUnits(() => 200)
          .y(d3.scaleLinear().domain([0, d3.max(title1CirculationByDate.all(), d => d.value.issue_circulation)]))

        lineChart1Range.yAxis().ticks(0)

        // Establish global chart filter method
        dc.chartRegistry.list().forEach((chart) => {
          chart.on('filtered', () => {
            us1Chart.customUpdate()
          })
        })

        dc.renderAll()
    })
}

const generateCharts = () => {
  Promise.all([`./assets/data/${state.selectedMagazine}-geodata.json`, `./assets/data/${state.selectedMagazine}-circulation.json`].map(url => d3.json(url)))
  .then(renderCharts)
}

generateCharts()
