"use client";

import { PageHeader, Panel, PanelHeader, Select, SimulatedBanner, Toggle } from "@/components/ui";
import { useLocalStorage } from "@/hooks";

export default function SettingsPage() {
  const [anim, setAnim] = useLocalStorage("nx-anim-enabled", true);
  const [precision, setPrecision] = useLocalStorage("nx-matrix-precision", "2");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Interface preferences are stored in your browser's localStorage. Nothing leaves your machine."
      />
      <SimulatedBanner>All preferences are local, harmless, and reset if you clear site data.</SimulatedBanner>

      <Panel>
        <PanelHeader title="Interface" sub="Visual and interaction preferences" />
        <div className="space-y-4 p-4">
          <Toggle label="Enable background motion and ambient animation" checked={anim} onChange={setAnim} />
          <Select
            label="Numeric precision for attention / similarity matrices"
            value={precision}
            options={[
              { value: "1", label: "1 decimal" },
              { value: "2", label: "2 decimals" },
              { value: "3", label: "3 decimals" },
            ]}
            onChange={setPrecision}
          />
        </div>
      </Panel>
    </div>
  );
}
