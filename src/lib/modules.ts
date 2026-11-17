import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  BrainCircuit,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  Network,
  Orbit,
  ScanText,
  Settings,
  Share2,
  Swords,
} from "lucide-react";

export interface ResearchModule {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  description: string;
  group: "core" | "research" | "analysis" | "system";
}

export const RESEARCH_MODULES: ResearchModule[] = [
  { id: "overview", name: "Overview", path: "/overview", icon: LayoutDashboard, description: "Platform summary and quick navigation", group: "core" },
  { id: "neural-studio", name: "Neural Studio", path: "/neural-studio", icon: Network, description: "Interactive neural network visualization laboratory", group: "research" },
  { id: "transformer-lab", name: "Transformer Lab", path: "/transformer-lab", icon: ScanText, description: "Transformer architecture and attention explorer", group: "research" },
  { id: "vector-explorer", name: "Vector Explorer", path: "/vector-explorer", icon: Orbit, description: "3D embedding space visualization", group: "research" },
  { id: "agent-simulator", name: "Agent Simulator", path: "/agent-simulator", icon: Bot, description: "Multi-agent orchestration simulation", group: "research" },
  { id: "rag-observatory", name: "RAG Observatory", path: "/rag-observatory", icon: Database, description: "Retrieval-augmented generation pipeline", group: "research" },
  { id: "model-arena", name: "Model Arena", path: "/model-arena", icon: Swords, description: "Model specification comparison dashboard", group: "analysis" },
  { id: "evaluation-lab", name: "Evaluation Lab", path: "/evaluation-lab", icon: Gauge, description: "Classification metrics and confusion analysis", group: "analysis" },
  { id: "training-observatory", name: "Training Observatory", path: "/training-observatory", icon: Activity, description: "Simulated training run monitoring", group: "analysis" },
  { id: "intelligence-graph", name: "Intelligence Graph", path: "/intelligence-graph", icon: Share2, description: "Interactive AI knowledge graph", group: "analysis" },
  { id: "system-monitor", name: "System Monitor", path: "/system-monitor", icon: Cpu, description: "Simulated infrastructure telemetry", group: "system" },
  { id: "settings", name: "Settings", path: "/settings", icon: Settings, description: "Workspace and interface preferences", group: "system" },
];

export const MODULE_ICON_FALLBACK = BrainCircuit;

export function moduleForPath(pathname: string): ResearchModule | undefined {
  return RESEARCH_MODULES.find((m) => pathname.startsWith(m.path));
}
