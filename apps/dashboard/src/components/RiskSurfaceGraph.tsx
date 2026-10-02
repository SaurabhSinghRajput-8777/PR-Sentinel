import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface RiskGraphProps {
  prNumber: number;
}

export const RiskSurfaceGraph: React.FC<RiskGraphProps> = ({ prNumber }) => {
  const nodes: Node[] = useMemo(
    () => [
      {
        id: "pr",
        position: { x: 50, y: 150 },
        data: { label: `PR #${prNumber} (Risk: 84)` },
        sourcePosition: Position.Right,
        style: {
          background: "#181818",
          color: "#d8ff3e",
          border: "1px solid #d8ff3e",
          borderRadius: "4px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          padding: "10px",
          fontWeight: "bold",
        },
      },
      {
        id: "auth-session",
        position: { x: 300, y: 60 },
        data: { label: "src/auth/session.ts [CRITICAL]" },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: {
          background: "#1e1010",
          color: "#ff6b6b",
          border: "1px solid #ff4d4d",
          borderRadius: "4px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "8px",
        },
      },
      {
        id: "auth-jwt",
        position: { x: 300, y: 240 },
        data: { label: "src/auth/jwt.ts [HIGH]" },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: {
          background: "#1e160e",
          color: "#ffa94d",
          border: "1px solid #f97316",
          borderRadius: "4px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "8px",
        },
      },
      {
        id: "redis-pool",
        position: { x: 580, y: 60 },
        data: { label: "redis.pool.reconnect() [BLAST RADIUS]" },
        targetPosition: Position.Left,
        style: {
          background: "#141414",
          color: "#a5a5a0",
          border: "1px dashed #686863",
          borderRadius: "4px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "8px",
        },
      },
      {
        id: "middleware",
        position: { x: 580, y: 240 },
        data: { label: "src/middleware/guard.ts [DEPENDENT]" },
        targetPosition: Position.Left,
        style: {
          background: "#141414",
          color: "#a5a5a0",
          border: "1px solid #383838",
          borderRadius: "4px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "8px",
        },
      },
    ],
    [prNumber]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "e-pr-session",
        source: "pr",
        target: "auth-session",
        animated: true,
        style: { stroke: "#ff4d4d", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#ff4d4d" },
      },
      {
        id: "e-pr-jwt",
        source: "pr",
        target: "auth-jwt",
        style: { stroke: "#f97316", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
      },
      {
        id: "e-session-redis",
        source: "auth-session",
        target: "redis-pool",
        style: { stroke: "#686863", strokeDasharray: "4 4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#686863" },
      },
      {
        id: "e-jwt-middleware",
        source: "auth-jwt",
        target: "middleware",
        style: { stroke: "#383838" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#383838" },
      },
    ],
    []
  );

  return (
    <div className="h-[360px] w-full rounded border border-[#262626] bg-[#0c0c0c] overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#1f1f1f" gap={16} size={1} />
        <Controls className="bg-[#181818] border border-[#262626] fill-[#f5f5f0]" />
        <MiniMap
          nodeColor={(n) => (n.id === "pr" ? "#d8ff3e" : n.id.includes("session") ? "#ff4d4d" : "#444")}
          maskColor="rgba(8, 8, 8, 0.8)"
          className="bg-[#121212] border border-[#262626]"
        />
      </ReactFlow>
    </div>
  );
};
