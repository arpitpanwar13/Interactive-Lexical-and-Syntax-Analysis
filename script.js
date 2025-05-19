console.log("script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");

  const form = document.getElementById('codeForm');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Submit button clicked");

    const language = document.getElementById('language').value;
    const sourceCode = document.getElementById('sourceCode').value;

    // Check for empty input
    if (!sourceCode.trim()) {
      alert("Please enter some source code.");
      return;
    }

    fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, sourceCode })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Syntax Error: " + data.error);
        console.error("Parse error:", data.error);
      } else {
        console.log("Parse tree received:", data);
        renderTree(data);
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      alert("Unable to connect to the backend. Make sure the server is running.");
    });
  });
});

// D3.js parse tree rendering function with zoom and pan
function renderTree(data) {
  const width = 1200;
  const height = 1100;




  // Select SVG and clear previous content
  const svg = d3.select("#treeSvg");
  svg.selectAll("*").remove();

  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  // Create a group that will be zoomed and panned
  const svgGroup = svg.append("g");

  // Enable zoom and pan behavior
  svg.call(
    d3.zoom().on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    })
  );

  // Create the root hierarchy and tree layout
  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([width - 150, height - 150]);
  treeLayout(root);

  // Draw links between nodes
  svgGroup.selectAll("line")
    .data(root.links())
    .enter()
    .append("line")
    .attr("x1", d => d.source.x + 75)
    .attr("y1", d => d.source.y + 75)
    .attr("x2", d => d.target.x + 75)
    .attr("y2", d => d.target.y + 75)
    .attr("stroke", "#999");

  // Draw nodes as circles
  svgGroup.selectAll("circle")
    .data(root.descendants())
    .enter()
    .append("circle")
    .attr("cx", d => d.x + 75)
    .attr("cy", d => d.y + 75)
    .attr("r", 18)
    .attr("fill", "#4a90e2");

  // Draw node labels
  svgGroup.selectAll("text")
    .data(root.descendants())
    .enter()
    .append("text")
    .attr("x", d => d.x + 75)
    .attr("y", d => d.y + 75)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(d => d.data.name);
}
