import * as d3 from "d3";


class Node {
  id: string;
  status: "idle" | "requesting" | "locked" | "failed"; // make dry
  x: number;
  y: number;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.status = "idle";
    this.x = x;
    this.y = y;
  }

  setStatus(newStatus: "idle" | "requesting" | "locked" | "failed") {
    this.status = newStatus;
  }
}

class LockState {
  owner: string | null = null;
  queue: string[] = [];

  requestLock(nodeId: string): string {
    if (!this.owner) {
      this.owner = nodeId;
      return `${nodeId} acquired the lock.`;
    } else {
      this.queue.push(nodeId);
      return `${nodeId} is queue for the lock.`;
    }
  }

  releaseLock(nodeId: string): string {
    if (this.owner !== nodeId) {
      return `Node ${nodeId} cannot release the lock (it's owned by ${this.owner}).`;
    }

    this.owner = null; // removing the owner releases the lock

    if (this.queue.length > 0) {
      const nxtNode = this.queue.shift()!;
      this.owner = nxtNode;
      return `Lock passed to ${nxtNode}.`;
    }

    return `Lock released.`;
  }
}


// Coordinates the nodes, locks, and viz
class Simulation {
  lock = new LockState();

  nodes: Node[] = [];
  canvas: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
    this.canvas = svg;
  }

  addNode(id: string, x: number, y: number) {
    const node = new Node(id, x, y);
    this.nodes.push(node);

    const nodeGroup = this.canvas
      .append("g")
      .attr("id", `node-${id}`)
      .on("click", () => this.handleNodeClick(node));

      nodeGroup
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 30)
      .attr("class", "node idle");

    nodeGroup
      .append("text")
      .attr("x", x)
      .attr("y", y + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(id);
  }

  addConnection(sourceId: string, targetId: string) {
    const sourceNode = this.nodes.find(node => node.id === sourceId);
    const targetNode = this.nodes.find(node => node.id === targetId);
  
    if (!sourceNode || !targetNode) {
      console.error("Invalid source or target node for connection");
      return;
    }
  
    // Add a line to represent the connection
    this.canvas
      .append("line")
      .attr("x1", sourceNode.x)
      .attr("y1", sourceNode.y)
      .attr("x2", targetNode.x)
      .attr("y2", targetNode.y)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("id", `connection-${sourceId}-${targetId}`);
  }

  handleNodeClick(node: Node) {
    if(node.status === "idle") {
      const message = this.lock.requestLock(node.id);
      console.log(message);

      node.setStatus(this.lock.owner === node.id ? "locked" : "requesting");
    } else if (node.status === "locked") {
      const message = this.lock.releaseLock(node.id);
      console.log(message);

      node.setStatus("idle");
    }

    this.updateNodeVisuals();
  }

  updateNodeVisuals() {
    this.nodes.forEach((node) => {
      const nodeGroup = this.canvas.select(`#node-${node.id}`);
      nodeGroup
      .select("circle")
      .attr("class", `node ${node.status}`);
    });

  }
}


const svg = d3.select("body").append("svg").attr("width", 980).attr("height", 680);
const sim = new Simulation(svg);


// default nodes
sim.addNode("Node1", 200, 300);
sim.addNode("Node2", 400, 300);
sim.addNode("Node3", 600, 300);

// TODO: fix spacing issues
document.getElementById("add-node")!.addEventListener("click", () => {
  const id = `Node${sim.nodes.length +1}`;
  const x = 100 + sim.nodes.length * 100;
  const y = 300;
  sim.addNode(id, x, y);
})