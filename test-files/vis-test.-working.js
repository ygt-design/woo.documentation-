const createD3Visualization = (graph, container) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const linkDistance = 20;
  const charge = -20;

  const tags = ["left", "right", "up", "down"];

  const sortNodesByTag = (nodes) => {
    const sortedNodes = [];
    tags.forEach((tag) => {
      nodes.forEach((node) => {
        if (node.tag.includes(tag)) {
          sortedNodes.push(node);
        }
      });
    });
    return sortedNodes;
  };

  const getLinkColor = (sourceTag, targetTag) => {
    if (sourceTag.includes("left") && targetTag.includes("right"))
      return "blue";
    if (sourceTag.includes("right") && targetTag.includes("left"))
      return "blue";
    if (sourceTag.includes("up") && targetTag.includes("down")) return "blue";
    if (sourceTag.includes("down") && targetTag.includes("up")) return "blue";
    return "blue";
  };

  const getCenterForce = (tag) => {
    if (tag.includes("left")) return [width / 4, height / 2];
    if (tag.includes("right")) return [(3 * width) / 4, height / 2];
    if (tag.includes("up")) return [width / 2, height / 4];
    if (tag.includes("down")) return [width / 2, (3 * height) / 4];
    return [width / 2, height / 2];
  };

  const infoDiv = d3
    .select("body")
    .append("div")
    .attr("class", "info")
    .style("display", "none");

  const zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

  function zoomed(event) {
    svg.attr("transform", event.transform);
  }

  let nodes = graph.nodes.map((d) => ({ id: d.id, tag: d.tag }));
  nodes = sortNodesByTag(nodes);

  const links = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
      sourceTag: nodes[i].tag,
      targetTag: nodes[i + 1].tag,
    });
  }

  const svgContainer = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

  const svg = svgContainer.append("g");

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(linkDistance)
    )
    .force("charge", d3.forceManyBody().strength(charge))
    .force(
      "x",
      d3.forceX().x((d) => {
        if (d.tag.includes("left")) return width / 4;
        if (d.tag.includes("right")) return (3 * width) / 4;
        return width / 2;
      })
    )
    .force(
      "y",
      d3.forceY().y((d) => {
        if (d.tag.includes("up")) return height / 4;
        if (d.tag.includes("down")) return (3 * height) / 4;
        return height / 2;
      })
    )
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", (d) => getLinkColor(d.sourceTag, d.targetTag));

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);

  const label = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "label");

  label
    .append("text")
    .text((d) => d.tag)
    .attr("class", "label-text")
    .attr("x", 6)
    .attr("y", -6);

  function updateLabels() {
    label.selectAll("text").each(function (d) {
      const bbox = this.getBBox();
      label
        .selectAll("rect")
        .attr("x", bbox.x - 2)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 4)
        .attr("height", bbox.height + 4);
    });
  }

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("transform", (d) => `translate(${d.x},${d.y})`);

    updateLabels();
  });

  simulation.force("link").links(links);

  function handleMouseOver(event, d) {
    d3.selectAll(".node").style("opacity", 0.2);
    d3.selectAll(".link").style("opacity", 0.2);
    d3.selectAll(".label").style("opacity", 0.2);

    d3.select(this).style("fill", "magenta").style("opacity", 1);
    d3.selectAll(".link")
      .filter((l) => l.source.id === d.id || l.target.id === d.id)
      .style("stroke", "magenta")
      .style("opacity", 1);

    const tags = d.tag.split(",");
    tags.forEach((tag) => {
      d3.selectAll(".node")
        .filter((n) => n.tag.includes(tag))
        .style("fill", "magenta")
        .style("opacity", 1);
      d3.selectAll(".label")
        .filter((n) => n.tag.includes(tag))
        .style("fill", "magenta")
        .style("opacity", 1);
    });
  }

  function handleMouseOut() {
    d3.selectAll(".node").style("fill", "rgb(0, 0, 255)").style("opacity", 1);
    d3.selectAll(".link")
      .style("stroke", (d) => getLinkColor(d.sourceTag, d.targetTag))
      .style("opacity", 1);
    d3.selectAll(".label").style("fill", "blue").style("opacity", 1);
  }

  function handleClick(event, d) {
    infoDiv
      .style("left", `${event.pageX}px`)
      .style("top", `${event.pageY}px`)
      .style("display", "block")
      .html(`Node ID: ${d.id}`);

    event.stopPropagation();
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
};

d3.select("body").on("click", () => {
  d3.select(".info").style("display", "none");
});
