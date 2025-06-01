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
  const [oneShotExample, setOneShotExample] = useState('');
  const [evaluationPrompt, setEvaluationPrompt] = useState('');
  const [breadth, setBreadth] = useState(3);
  const [autoSolve, setAutoSolve] = useState(false);
  const [maxDepth, setMaxDepth] = useState(3);
  const [llmModel, setLlmModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [generationMethod, setGenerationMethod] = useState('sample');
  const [evaluationMethod, setEvaluationMethod] = useState('value');
  const [searchMethod, setSearchMethod] = useState('bfs');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editValue, setEditValue] = useState('');

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
    const baseSpacing = 600;
    const spacing = baseSpacing / Math.pow(2, childLevel);
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

  const handleResetFields = () => {
    setPrompt('');
    setOneShotExample('');
    setEvaluationPrompt('');
    setBreadth(3);
    setMaxDepth(3);
    setAutoSolve(false);
  };

  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    idCounter = 2;
  };

  const handleEditSubmit = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: editValue } }
          : n
      )
    );
    setEditingNodeId(null);
    setEditValue('');
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        padding: '10px', 
        position: 'absolute', 
        zIndex: 10, 
        background: 'white', 
        borderRadius: '8px', 
        left: 10, 
        top: 10,
        border: '1px solid black',
        width: '300px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Main Problem Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter problem prompt"
            style={{ 
              width: '95%', 
              padding: '8px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.4',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>One-shot Example</label>
          <textarea
            value={oneShotExample}
            onChange={(e) => setOneShotExample(e.target.value)}
            placeholder="Enter one-shot example"
            style={{ 
              width: '95%', 
              padding: '8px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.4',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Evaluation Prompt</label>
          <textarea
            value={evaluationPrompt}
            onChange={(e) => setEvaluationPrompt(e.target.value)}
            placeholder="Enter evaluation prompt"
            style={{ 
              width: '95%', 
              padding: '8px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.4',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>LLM Model</label>
          <select 
            value={llmModel} 
            onChange={(e) => setLlmModel(e.target.value)}
            style={{ width: '100%', padding: '4px' }}
          >
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Temperature: {temperature}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Generation Method</label>
          <select 
            value={generationMethod} 
            onChange={(e) => setGenerationMethod(e.target.value)}
            style={{ width: '100%', padding: '4px' }}
          >
            <option value="sample">Sample</option>
            <option value="propose">Propose</option>
          </select>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Evaluation Method</label>
          <select 
            value={evaluationMethod} 
            onChange={(e) => setEvaluationMethod(e.target.value)}
            style={{ width: '100%', padding: '4px' }}
          >
            <option value="value">Value</option>
            <option value="vote">Vote</option>
          </select>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Search Method</label>
          <select 
            value={searchMethod} 
            onChange={(e) => setSearchMethod(e.target.value)}
            style={{ width: '100%', padding: '4px' }}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="astar">A*</option>
          </select>
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

        <div style={{ marginBottom: '8px' }}>
          <label><input type="checkbox" checked={autoSolve} onChange={(e) => setAutoSolve(e.target.checked)} /> Auto-solve</label>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handlePromptSubmit} 
            style={{ 
              padding: '6px 12px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit Prompt
          </button>
          <button 
            onClick={handleResetFields} 
            style={{ 
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Fields
          </button>
          <button 
            onClick={handleClearGraph} 
            style={{ 
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Graph
          </button>
        </div>
      </div>

      <ReactFlow
        colorMode="light"
        nodes={nodes.map((n) => ({
          ...n,
          style: n.data.rank === 1 ? { border: '2px solid gold', background: '#fffbea' } : {},
          data: {
            ...n.data,
            label: (
              <div style={{ textAlign: 'center' }}>
                <div><strong>{n.data.label}</strong></div>
                {n.data.score !== undefined && (
                  <div style={{ fontSize: '0.75em', color: 'gray' }}>
                    Score: {n.data.score} | Rank: {n.data.rank}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingNodeId(n.id);
                      setEditValue(n.data.label);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => expandNode(n)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✨️
                  </button>
                </div>
                {editingNodeId === n.id && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                  }}>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        width: '300px',
                        height: '100px',
                        padding: '8px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingNodeId(null)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(n.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                    </div>
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
