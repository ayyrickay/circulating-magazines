// set dimensions and margins
const margin = {top: 20, right: 20, bottom: 30, left: 75}
const width = 960
const height = 500
const adjustedWidth = +width - margin.left - margin.right
const adjustedHeight = +height - margin.top - margin.bottom

// const parseTime = d3.timeFormat('%d-%b-%y')
bisectDate = d3.bisector((d) => d.date).left

const x = d3.scaleTime().range([0, adjustedWidth])
const y = d3.scaleLinear().range([adjustedHeight, 0])

const valueline = d3.line()
  .x((d) => x(d.date))
  .y((d) => y(d.circulation))

const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)

const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

d3.csv('./assets/data/life-issue-circulation.csv', (err, data) => {
  if (err) throw err

  const formattedData = data.map((d) => {
    const date = new Date(d.year, d.month, d.day)
    const circulation = +d._circulation

    return Object.assign(d, {date}, {circulation})
  })

  function mousemove() {
      const x0 = x.invert(d3.mouse(this)[0])
      const i = bisectDate(formattedData, x0, 1)
      const d0 = formattedData[i - 1]
      const d1 = formattedData[i]
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0
      focus.attr("transform", `translate(${x(d.date)}, ${y(d.circulation)})`)
      focus.select("text").text(() => d.circulation)
      focus.select(".x-hover-line").attr("y2", adjustedHeight - y(d.circulation))
      focus.select(".y-hover-line").attr("x2", adjustedWidth + adjustedWidth);
    }

  x.domain(d3.extent(formattedData, (d) => d.date))
  y.domain([0, d3.max(formattedData, (d) => d.circulation)])

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${adjustedHeight})`)
    .call(d3.axisBottom(x))

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y).ticks(6).tickFormat((d) => `${parseInt(d / 1000)}k`))

  g.append('path')
    .datum(formattedData)
    .attr('class', 'line')
    .attr('d', valueline)

  const focus = g.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", adjustedHeight);

  focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", adjustedWidth)
      .attr("x2", adjustedWidth);

  focus.append("circle")
      .attr("r", 7.5);

  focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em");

  svg.append("rect")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("class", "overlay")
      .attr("width", adjustedWidth)
      .attr("height", adjustedHeight)
      .on("mouseover", () => { focus.style("display", null); })
      .on("mouseout", () => { focus.style("display", "none"); })
      .on("mousemove", mousemove);
})
