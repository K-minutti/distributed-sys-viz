import * as d3 from "d3";

const svg = d3.select("body")
  .append("svg")
  .attr("width", 800)
  .attr("height", 600);

svg.append("circle")
  .attr("cx", 400)
  .attr("cy", 300)
  .attr("r", 50)
  .style("fill", "green");
