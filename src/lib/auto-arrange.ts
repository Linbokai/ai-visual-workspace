interface NodePosition {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

interface ArrangeOptions {
  horizontalGap?: number;
  verticalGap?: number;
  startX?: number;
  startY?: number;
  columns?: number;
}

/**
 * Auto-arrange nodes in a grid layout
 */
export function autoArrangeNodes(
  nodes: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>,
  options: ArrangeOptions = {}
): Map<string, { x: number; y: number }> {
  const {
    horizontalGap = 60,
    verticalGap = 40,
    startX = 50,
    startY = 50,
    columns = 4,
  } = options;

  const positions = new Map<string, { x: number; y: number }>();
  const defaultWidth = 280;
  const defaultHeight = 300;

  let currentX = startX;
  let currentY = startY;
  let rowMaxHeight = 0;
  let col = 0;

  for (const node of nodes) {
    const w = node.measured?.width || defaultWidth;
    const h = node.measured?.height || defaultHeight;

    positions.set(node.id, { x: currentX, y: currentY });

    rowMaxHeight = Math.max(rowMaxHeight, h);
    col++;

    if (col >= columns) {
      col = 0;
      currentX = startX;
      currentY += rowMaxHeight + verticalGap;
      rowMaxHeight = 0;
    } else {
      currentX += w + horizontalGap;
    }
  }

  return positions;
}

/**
 * Arrange nodes in a flow layout (left to right with connections)
 */
export function autoArrangeFlow(
  nodes: Array<{ id: string; position: { x: number; y: number }; measured?: { width?: number; height?: number } }>,
  edges: Array<{ source: string; target: string }>,
  options: { horizontalGap?: number; verticalGap?: number } = {}
): Map<string, { x: number; y: number }> {
  const { horizontalGap = 200, verticalGap = 80 } = options;

  // Build adjacency list
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    if (!children.has(edge.source)) children.set(edge.source, []);
    children.get(edge.source)!.push(edge.target);
    if (!parents.has(edge.target)) parents.set(edge.target, []);
    parents.get(edge.target)!.push(edge.source);
  }

  // Find roots (no parents)
  const roots = nodes.filter((n) => !parents.has(n.id) || parents.get(n.id)!.length === 0);

  // BFS to assign layers
  const layers = new Map<string, number>();
  const queue: string[] = [];
  for (const root of roots) {
    layers.set(root.id, 0);
    queue.push(root.id);
  }

  // Process unconnected nodes
  for (const node of nodes) {
    if (!layers.has(node.id)) {
      layers.set(node.id, 0);
      queue.push(node.id);
    }
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    const layer = layers.get(id)!;
    const ch = children.get(id) || [];
    for (const childId of ch) {
      const existing = layers.get(childId);
      if (existing === undefined || existing < layer + 1) {
        layers.set(childId, layer + 1);
        queue.push(childId);
      }
    }
  }

  // Group by layer
  const layerGroups = new Map<number, string[]>();
  for (const [nodeId, layer] of layers) {
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(nodeId);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const defaultWidth = 280;
  const defaultHeight = 300;

  for (const [layer, nodeIds] of layerGroups) {
    const x = 50 + layer * (defaultWidth + horizontalGap);
    nodeIds.forEach((nodeId, index) => {
      const y = 50 + index * (defaultHeight + verticalGap);
      positions.set(nodeId, { x, y });
    });
  }

  return positions;
}
