/** Deterministic multi-agent orchestration simulation. No external agents or LLMs. */

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

export const AGENTS: AgentDef[] = [
  { id: "research", name: "Research Agent", role: "Information gathering", description: "Collects and organizes source material for the task.", color: "#00d9ff" },
  { id: "planning", name: "Planning Agent", role: "Decomposition", description: "Breaks objectives into an ordered task plan with dependencies.", color: "#7667ff" },
  { id: "reasoning", name: "Reasoning Agent", role: "Analysis", description: "Synthesizes intermediate results into conclusions.", color: "#a78bfa" },
  { id: "execution", name: "Execution Agent", role: "Action", description: "Carries out concrete work items from the plan.", color: "#38d996" },
  { id: "verification", name: "Verification Agent", role: "QA", description: "Validates outputs against acceptance criteria.", color: "#f2b84b" },
  { id: "memory", name: "Memory Agent", role: "State", description: "Maintains shared working memory and context summaries.", color: "#8793a5" },
];

export interface Step { from: string; to?: string; action: string; ticks: number; kind: "work" | "message" }

export interface Scenario {
  id: string;
  label: string;
  description: string;
  steps: Step[];
}

const S = (from: string, action: string, ticks: number, to?: string, kind: Step["kind"] = "work"): Step => ({ from, action, ticks, to, kind });

export const SCENARIOS: Scenario[] = [
  {
    id: "research-topic",
    label: "Research a technical topic",
    description: "Investigate a technical domain and produce a structured briefing.",
    steps: [
      S("planning", "Decompose topic into 4 sub-questions", 2, "memory", "message"),
      S("memory", "Store task graph + prior context", 1),
      S("research", "Gather sources for sub-questions", 4, "memory", "message"),
      S("memory", "Index retrieved material", 1),
      S("reasoning", "Synthesize findings per sub-question", 3),
      S("reasoning", "Cross-check claims against sources", 2, "verification", "message"),
      S("verification", "Validate citations and coherence", 2),
      S("verification", "Emit structured briefing", 1, "memory", "message"),
    ],
  },
  {
    id: "analyze-architecture",
    label: "Analyze a software architecture",
    description: "Review a codebase architecture for risks and improvement areas.",
    steps: [
      S("planning", "Define analysis dimensions", 2),
      S("research", "Map modules and dependencies", 3, "memory", "message"),
      S("reasoning", "Evaluate coupling and boundaries", 3),
      S("execution", "Draft refactor proposals", 3),
      S("verification", "Check proposals against constraints", 2, "reasoning", "message"),
      S("reasoning", "Finalize risk register", 2, "memory", "message"),
    ],
  },
  {
    id: "project-plan",
    label: "Generate a project plan",
    description: "Produce a phased delivery plan with milestones and owners.",
    steps: [
      S("research", "Collect scope inputs", 2, "memory", "message"),
      S("planning", "Draft milestone sequence", 3),
      S("planning", "Assign work packages", 2, "execution", "message"),
      S("execution", "Assemble plan document", 3),
      S("verification", "Review feasibility and buffers", 2, "planning", "message"),
      S("planning", "Apply revisions", 2, "memory", "message"),
    ],
  },
  {
    id: "review-experiment",
    label: "Review a machine learning experiment",
    description: "Audit an ML experiment run: methodology, metrics, and reproducibility.",
    steps: [
      S("research", "Pull run configs and logs", 2, "memory", "message"),
      S("memory", "Reconstruct experiment timeline", 1),
      S("reasoning", "Audit metric methodology", 3),
      S("verification", "Reproduce metric computations", 3, "reasoning", "message"),
      S("reasoning", "Classify risks (leakage, drift, seeds)", 2),
      S("verification", "Publish review verdict", 2, "memory", "message"),
    ],
  },
];

export type AgentStatus = "idle" | "working" | "messaging" | "done";

export interface AgentState { status: AgentStatus; progress: number; current: string | null }

export interface SimEvent { tick: number; from: string; to?: string; action: string; kind: "work" | "message" }

export interface SimState {
  scenario: Scenario;
  totalTicks: number;
  agents: Record<string, AgentState>;
  events: SimEvent[];
  finished: boolean;
}

export function simulate(scenario: Scenario, tick: number): SimState {
  const agents: Record<string, AgentState> = {};
  AGENTS.forEach((a) => (agents[a.id] = { status: "idle", progress: 0, current: null }));

  const events: SimEvent[] = [];
  let t = 0;
  let finished = t >= scenario.steps.reduce((s, st) => s + st.ticks, 0);

  for (const step of scenario.steps) {
    if (t >= tick) break;
    const start = t;
    const end = Math.min(t + step.ticks, tick);
    const a = agents[step.from];
    if (step.kind === "message" && step.to) {
      if (end > start) {
        events.push({ tick: start, from: step.from, to: step.to, action: step.action, kind: "message" });
      }
    } else if (end > start) {
      events.push({ tick: start, from: step.from, action: step.action, kind: "work" });
    }
    // progress
    a.status = end > start ? (step.kind === "message" ? "messaging" : "working") : a.status;
    a.current = step.action;
    const doneTicks = Math.max(0, Math.min(step.ticks, tick - t));
    a.progress = Math.round((doneTicks / step.ticks) * 100);
    if (end >= t + step.ticks) {
      a.progress = 100;
      a.status = "done";
      a.current = null;
    }
    t = end;
    if (t >= tick) break;
  }

  const totalTicks = scenario.steps.reduce((s, st) => s + st.ticks, 0);
  return { scenario, totalTicks, agents, events, finished: tick >= totalTicks };
}

export function agentById(id: string) {
  return AGENTS.find((a) => a.id === id)!;
}
