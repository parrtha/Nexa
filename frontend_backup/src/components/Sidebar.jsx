import { Activity, Command, History, Home, Settings2, Sparkles } from "lucide-react";

export default function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "commands", label: "Commands", icon: Command },
    { id: "history", label: "History", icon: History },
    { id: "system", label: "System", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings2 }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={20} /></div>
        <div>
          <strong>NEXA</strong>
          <span>Windows Assistant</span>
        </div>
      </div>

      <nav>
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="online-dot" />
        <div>
          <strong>Local Mode</strong>
          <small>No AI API</small>
        </div>
      </div>
    </aside>
  );
}
