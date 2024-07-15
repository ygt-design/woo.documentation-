const createD3Visualization = (contents, container, loadingIndicator) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const linkDistance = 250;
  const charge = -400;

  // Prepare nodes and links
  const nodes = [];
  const links = [];

  contents.forEach((content, i) => {
    const channelName = content.channel;
    const channelId = content.channelId; // Get the channel ID
    content.blocks.forEach((block, j) => {
      nodes.push({
        id: `${channelName}-${j}`,
        title: block.title || block.content,
        channel: channelName,
        channelId: channelId, // Store the channel ID
        block,
      });
      if (j > 0) {
        links.push({
          source: `${channelName}-${j - 1}`,
          target: `${channelName}-${j}`,
          channel: channelName,
        });
      }
    });
  });

  const svgContainer = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(
      d3
        .zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => svg.attr("transform", event.transform))
    );

  const svg = svgContainer.append("g");

  // Determine regions for each channel
  const regions = {};
  const columns = Math.ceil(Math.sqrt(contents.length));
  const rows = Math.ceil(contents.length / columns);
  const regionWidth = width / columns;
  const regionHeight = height / rows;

  contents.forEach((content, i) => {
    const column = i % columns;
    const row = Math.floor(i / columns);
    regions[content.channel] = {
      x: column * regionWidth + regionWidth / 2,
      y: row * regionHeight + regionHeight / 2,
    };
  });

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
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "x",
      d3.forceX().x((d) => regions[d.channel].x)
    )
    .force(
      "y",
      d3.forceY().y((d) => regions[d.channel].y)
    );

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "blue");

  const label = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label-text")
    .text((d) => {
      const words = d.title.split(" ");
      return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : d.title;
    })
    .attr("fill", "blue")
    .attr("x", 6)
    .attr("y", -6);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("fill", "blue")
    .attr("stroke", "blue")
    .attr("r", 5)
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

  // Define the infoDiv inside the createD3Visualization function
  const infoDiv = d3
    .select("body")
    .append("div")
    .attr("class", "info")
    .style("display", "none");

  // Remove the loading indicator after creating the visualization
  loadingIndicator.remove();

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    label.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  function handleMouseOver(event, d) {
    d3.selectAll(".node").style("opacity", 0.2);
    d3.selectAll(".link").style("opacity", 0.2);
    d3.selectAll(".label-text").style("opacity", 0.2);

    d3.select(this)
      .style("fill", "magenta")
      .style("stroke", "magenta")
      .style("opacity", 1);
    d3.selectAll(".link")
      .filter((l) => l.source.id === d.id || l.target.id === d.id)
      .style("stroke", "magenta")
      .style("opacity", 1);

    d3.selectAll(".node")
      .filter((n) => n.channel === d.channel)
      .style("fill", "magenta")
      .style("stroke", "magenta")
      .style("opacity", 1);
    d3.selectAll(".label-text")
      .filter((n) => n.channel === d.channel)
      .style("fill", "magenta")
      .style("opacity", 1);
  }

  function handleMouseOut() {
    d3.selectAll(".node")
      .style("fill", "blue")
      .style("stroke", "blue")
      .style("opacity", 1);
    d3.selectAll(".link").style("stroke", "blue").style("opacity", 1);
    d3.selectAll(".label-text").style("fill", "blue").style("opacity", 1);
  }

  function handleClick(event, d) {
    infoDiv
      .style("left", `${event.pageX}px`)
      .style("top", `${event.pageY}px`)
      .style("display", "block")
      .html(`Node ID: ${d.id}<br>Content: ${d.block.title || d.block.content}`);

    showChannelContentWithLoading(d.channelId, d.channel); // Open the channel content with channel name

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
