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
        position: { x: 50, y: 140 },
        data: { label: `PR #${prNumber} · RISK: 84 [CRITICAL]` },
        sourcePosition: Position.Right,
        style: {
          background: "#111111",
          color: "#f7f5f0",
          border: "2px solid #e63920",
          borderRadius: "0px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          padding: "10px 14px",
          fontWeight: 700,
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        },
      },
      {
        id: "auth-session",
        position: { x: 340, y: 50 },
        data: { label: "src/auth/session.ts\n⚠ UNBOUNDED RETRY LOOP" },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: {
          background: "#f7f5f0",
          color: "#c02810",
          border: "2px solid #e63920",
          borderRadius: "0px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          fontWeight: 600,
          padding: "10px 12px",
          whiteSpace: "pre-line",
          lineHeight: 1.4,
          boxShadow: "0 2px 8px rgba(230, 57, 32, 0.15)",
        },
      },
      {
        id: "auth-jwt",
        position: { x: 340, y: 230 },
        data: { label: "src/auth/jwt.ts\n⚡ WEAK SECRET FALLBACK" },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: {
          background: "#f7f5f0",
          color: "#c2410c",
          border: "1.5px solid #f97316",
          borderRadius: "0px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          fontWeight: 600,
          padding: "10px 12px",
          whiteSpace: "pre-line",
          lineHeight: 1.4,
        },
      },
      {
        id: "redis-pool",
        position: { x: 640, y: 50 },
        data: { label: "redis.pool.reconnect()\nBLAST: HTTP 504 TIMEOUT" },
        targetPosition: Position.Left,
        style: {
          background: "#efece6",
          color: "#555550",
          border: "1px dashed #e63920",
          borderRadius: "0px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "10px 12px",
          whiteSpace: "pre-line",
          lineHeight: 1.4,
        },
      },
      {
        id: "middleware",
        position: { x: 640, y: 230 },
        data: { label: "src/middleware/guard.ts\nDEPENDENCY: ROUTE PROTECT" },
        targetPosition: Position.Left,
        style: {
          background: "#efece6",
          color: "#555550",
          border: "1px solid #d4d0c7",
          borderRadius: "0px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          padding: "10px 12px",
          whiteSpace: "pre-line",
          lineHeight: 1.4,
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
        style: { stroke: "#e63920", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#e63920" },
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
        style: { stroke: "#e63920", strokeDasharray: "4 4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#e63920" },
      },
      {
        id: "e-jwt-middleware",
        source: "auth-jwt",
        target: "middleware",
        style: { stroke: "#888880" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#888880" },
      },
    ],
    []
  );

  return (
    <div className="h-[360px] w-full border border-[#d4d0c7] bg-[#f7f5f0] overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#d4d0c7" gap={20} size={1} />
        <Controls className="bg-[#f7f5f0] border border-[#d4d0c7] fill-[#111111]" />
        <MiniMap
          nodeColor={(n) => (n.id === "pr" ? "#e63920" : n.id.includes("session") ? "#e63920" : "#d4d0c7")}
          maskColor="rgba(239, 236, 230, 0.75)"
          className="bg-[#f7f5f0] border border-[#d4d0c7]"
        />
      </ReactFlow>
    </div>
  );
};
