import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, GraphLink } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, FileText, Settings, Award } from 'lucide-react';

interface KnowledgeGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  onNodeClick?: (node: GraphNode) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Local state for copy of nodes to support dragging
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  
  // Navigation states
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  
  // Hover state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Mouse tracking for delta movement
  const dragStart = useRef({ x: 0, y: 0 });

  // Sync data props
  useEffect(() => {
    if (data && data.nodes) {
      setNodes(JSON.parse(JSON.stringify(data.nodes)));
      setLinks(JSON.parse(JSON.stringify(data.links)));
    }
  }, [data]);

  // Handle Zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + zoomFactor, 2.5));
    } else {
      setZoom(prev => Math.max(prev - zoomFactor, 0.4));
    }
  };

  // Dragging and Panning logic
  const handleMouseDown = (e: React.MouseEvent<any>, nodeId: string | null = null) => {
    if (nodeId) {
      // Node dragging
      setDraggedNodeId(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    } else {
      // Canvas panning
      setIsPanning(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNodeId) {
      // Update dragged node position
      const dx = (e.clientX - dragStart.current.x) / zoom;
      const dy = (e.clientY - dragStart.current.y) / zoom;

      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === draggedNodeId) {
            return {
              ...node,
              x: node.x + dx,
              y: node.y + dy
            };
          }
          return node;
        })
      );
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else if (isPanning) {
      // Update canvas panning offset
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Get highlights helper
  const getConnectedNodesAndLinks = (activeId: string | null) => {
    if (!activeId) return { nodeIds: new Set<string>(), linkIds: new Set<string>() };
    
    const connectedNodeIds = new Set<string>([activeId]);
    const connectedLinkIds = new Set<string>();

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sourceId === activeId) {
        connectedNodeIds.add(targetId);
        connectedLinkIds.add(link.id);
      } else if (targetId === activeId) {
        connectedNodeIds.add(sourceId);
        connectedLinkIds.add(link.id);
      }
    });

    return { nodeIds: connectedNodeIds, linkIds: connectedLinkIds };
  };

  const { nodeIds: activeNodeIds, linkIds: activeLinkIds } = getConnectedNodesAndLinks(hoveredNodeId);

  // Helper to resolve link endpoints coordinates
  const getLinkCoords = (link: GraphLink) => {
    const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (sourceNode && targetNode) {
      return {
        x1: sourceNode.x,
        y1: sourceNode.y,
        x2: targetNode.x,
        y2: targetNode.y
      };
    }
    return { x1: 0, y1: 0, x2: 0, y2: 0 };
  };

  // Helper to color nodes depending on type
  const getNodeColor = (type: string, id: string) => {
    const isMuted = hoveredNodeId !== null && !activeNodeIds.has(id);
    const opacity = isMuted ? 'opacity-30' : 'opacity-100';

    switch (type) {
      case 'user':
        return { fill: '#1e3a8a', stroke: '#2563eb', className: `fill-blue-900 stroke-blue-600 ${opacity}` };
      case 'category':
        return { fill: '#475569', stroke: '#94a3b8', className: `fill-slate-600 stroke-slate-400 ${opacity}` };
      case 'document':
        return { fill: '#2563eb', stroke: '#93c5fd', className: `fill-blue-600 stroke-blue-300 ${opacity}` };
      case 'skill':
        return { fill: '#0f766e', stroke: '#2dd4bf', className: `fill-teal-700 stroke-teal-400 ${opacity}` };
      default:
        return { fill: '#64748b', stroke: '#cbd5e1', className: `fill-slate-500 stroke-slate-300 ${opacity}` };
    }
  };

  return (
    <div className="relative w-full h-[550px] border border-slate-200 rounded-lg bg-white overflow-hidden select-none shadow-sm">
      {/* Control Buttons Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn} 
          className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 text-slate-600 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 text-slate-600 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleReset} 
          className="p-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 text-slate-600 transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Graph Info Legend */}
      <div className="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded shadow-sm flex flex-col gap-1.5 text-xs text-slate-600 z-10">
        <div className="font-semibold text-slate-700 mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-900 border border-blue-600 inline-block"></span>
          <span>User Profile (Alex Mercer)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400 inline-block"></span>
          <span>SaaS Document Categories</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-300 inline-block"></span>
          <span>Verified Document Uploads</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-700 border border-teal-400 inline-block"></span>
          <span>Extracted Skills</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
          * Drag nodes to arrange. Double-click or click to open documents.
        </div>
      </div>

      {/* Main SVG workspace */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Connections */}
          {links.map((link) => {
            const coords = getLinkCoords(link);
            const isMuted = hoveredNodeId !== null && !activeLinkIds.has(link.id);
            const strokeColor = link.type === 'skill-link' ? '#ccfbf1' : '#e2e8f0';
            const strokeWidth = hoveredNodeId !== null && activeLinkIds.has(link.id) ? 2 : 1.2;

            return (
              <line
                key={link.id}
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke={hoveredNodeId !== null && activeLinkIds.has(link.id) ? '#3b82f6' : strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={link.type === 'skill-link' ? '4 4' : undefined}
                className="transition-all duration-200"
                style={{ opacity: isMuted ? 0.15 : 0.8 }}
              />
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColor(node.type, node.id);
            const isHovered = hoveredNodeId === node.id;
            const textOpacity = hoveredNodeId !== null && !activeNodeIds.has(node.id) ? 'opacity-25' : 'opacity-100';

            return (
              <g 
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="node-interactive"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.type === 'document' && onNodeClick) {
                    onNodeClick(node);
                  }
                }}
              >
                <circle
                  r={node.r + (isHovered ? 2 : 0)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className={`${colors.className} transition-all duration-150`}
                />
                
                {/* Text Labels */}
                <text
                  y={node.r + 15}
                  textAnchor="middle"
                  className={`text-[9px] font-medium tracking-tight fill-slate-700 ${textOpacity} transition-all pointer-events-none select-none`}
                >
                  {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                </text>

                {/* Micro-icons on node center */}
                {node.type === 'document' && (
                  <g transform="translate(-5, -5) scale(0.6)" className="pointer-events-none stroke-white fill-none opacity-80">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" />
                    <polyline points="14 2 14 8 20 8" strokeWidth="2" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
