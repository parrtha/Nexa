import { Battery, Calculator, Chrome, FolderDown, MonitorUp, Volume2 } from "lucide-react";

export default function QuickActions({ onCommand }) {
  const actions = [
    ["Open Calculator", "open calculator", Calculator],
    ["Open Chrome", "open chrome", Chrome],
    ["Downloads", "open downloads", FolderDown],
    ["Battery", "check battery", Battery],
    ["Volume Up", "increase volume", Volume2],
    ["Screenshot", "take screenshot", MonitorUp]
  ];

  return (
    <div className="quick-grid">
      {actions.map(([label, command, Icon]) => (
        <button key={label} className="quick-card" onClick={() => onCommand(command)}>
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
