import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

let idCounter = 3;
const getId = () => `${idCounter++}`;

const mockGenerateThoughts = (parentLabel, breadth) => {
  const thoughts = Array.from({ length: breadth }, (_, i) => ({
    label: `${parentLabel}.${i + 1}`,
    thought: `Thought generated from ${parentLabel} - option ${i + 1}`,
  }));
  return thoughts;
};

const mockEvaluateThoughts = (thoughts) => {
  const scored = thoughts.map(t => ({
    ...t,
    score: parseFloat(Math.random().toFixed(2))
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((t, idx) => ({
    ...t,
    rank: idx + 1
  })).sort(() => Math.random() - 0.5); // shuffle again after ranking
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Root', level: 0 } },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [prompt, setPrompt] = useState('');
  const [breadth, setBreadth] = useState(3);
  const [autoSolve, setAutoSolve] = useState(false);
  const [maxDepth, setMaxDepth] = useState(3);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const expandNode = (parentNode) => {
    const parentId = parentNode.id;
    const rawThoughts = mockGenerateThoughts(parentNode.data.label, breadth);
    const children = mockEvaluateThoughts(rawThoughts);
    const yOffset = 150;

    const parentLevel = parentNode.data.level || 0;
    const childLevel = parentLevel + 1;
    const baseSpacing = 5000;
    const spacing = baseSpacing / Math.pow(3, childLevel);
    const totalWidth = (children.length - 1) * spacing;

    const newNodes = children.map((child, idx) => {
      const id = getId();
      return {
        id,
        position: {
          x: parentNode.position.x - totalWidth / 2 + idx * spacing,
          y: parentNode.position.y + yOffset,
        },
        data: {
          label: child.label,
          score: child.score,
          rank: child.rank,
          level: childLevel,
          parentId,
        },
      };
    });

    const newEdges = newNodes.map(n => ({
      id: `e${parentId}-${n.id}`,
      source: parentId,
      target: n.id,
      style: n.data.rank === 1 ? { stroke: 'gold', strokeWidth: 2.5 } : {},
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);

    if (autoSolve && childLevel < maxDepth) {
      const best = newNodes.find(n => n.data.rank === 1);
      if (best) setTimeout(() => expandNode(best), 300);
    }
  };

  const handlePromptSubmit = () => {
    setNodes([
      { id: '1', position: { x: 0, y: 0 }, data: { label: prompt || 'Root', level: 0 } },
    ]);
    setEdges([]);
    idCounter = 2;
    if (autoSolve) {
      setTimeout(() => expandNode({ id: '1', position: { x: 0, y: 0 }, data: { label: prompt || 'Root', level: 0 } }), 300);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: '10px', position: 'absolute', zIndex: 10, background: 'white', borderRadius: '8px', left: 10, top: 10 }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Problem Prompt</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter problem prompt"
            style={{ width: '300px', padding: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Breadth (number of thoughts per node)</label>
          <input
            type="number"
            min="1"
            value={breadth}
            onChange={(e) => setBreadth(parseInt(e.target.value) || 1)}
            placeholder="Breadth"
            style={{ width: '80px', padding: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label><input type="checkbox" checked={autoSolve} onChange={(e) => setAutoSolve(e.target.checked)} /> Auto-solve</label>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Max Depth</label>
          <input
            type="number"
            min="1"
            value={maxDepth}
            onChange={(e) => setMaxDepth(parseInt(e.target.value) || 1)}
            placeholder="Max Depth"
            style={{ width: '80px', padding: '4px' }}
          />
        </div>
        <div>
          <button onClick={handlePromptSubmit} style={{ padding: '6px 12px' }}>Submit Prompt</button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          style: n.data.rank === 1 ? { border: '2px solid gold', background: '#fffbea' } : {},
          data: {
            ...n.data,
            onClick: () => expandNode(n),
            label: (
              <div onClick={() => expandNode(n)} style={{ cursor: 'pointer' }}>
                <div><strong>{n.data.label}</strong></div>
                {n.data.score !== undefined && (
                  <div style={{ fontSize: '0.75em', color: 'gray' }}>
                    Score: {n.data.score} | Rank: {n.data.rank}
                  </div>
                )}
              </div>
            ),
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
