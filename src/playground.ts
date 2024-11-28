import * as d3 from "d3";

const svg = d3.select("body")
  .append("svg")
  .attr("width", 900)
  .attr("height", 700);

svg.append("circle")
  .attr("cx", 400)
  .attr("cy", 300)
  .attr("r", 50)
  .style("fill", "blue");

svg.append("circle")
  .attr("cx", 500)
  .attr("cy", 400)
  .attr("r", 50)
  .style("fill", "blue");

svg.append('rect')
  .attr('x', 10)
  .attr('y', 120)
  .attr('width', 600)
  .attr('height', 40)
  .attr('stroke', 'black')
  .attr('fill', '#69a3b2');