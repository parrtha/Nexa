import { CheckCircle2, Cpu, Mic, Server } from "lucide-react";

export default function SystemStatus({ backendOnline, speechReady }) {
  const items = [
    ["Backend", backendOnline, Server],
    ["NLP Engine", backendOnline, Cpu],
    ["Speech", speechReady, Mic]
  ];

  return (
    <div className="status-grid">
      {items.map(([label, ok, Icon]) => (
        <div className="status-card" key={label}>
          <Icon size={18} />
          <div>
            <strong>{label}</strong>
            <span><i className={ok ? "ok" : "bad"} /> {ok ? "Ready" : "Unavailable"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
