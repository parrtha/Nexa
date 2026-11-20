import {
  CheckCircle2,
  Clock3,
  XCircle,
  Zap
} from "lucide-react";

function formatTime(timestamp) {
  if (!timestamp) return "Just now";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function CommandHistory({ history }) {
  if (!history.length) {
    return (
      <div className="empty-history">
        <Clock3 size={22} />
        <span>
          No commands yet. Try asking Nexa to open Calculator.
        </span>
      </div>
    );
  }

  return (
    <div className="history-list">
     {history.map((item, index) => (
    <div key={`${item.timestamp}-${index}-${item.command}-${item.intent}`}>

          {/* Status icon */}
          <div className={`history-icon ${item.success ? "success-icon" : "failed-icon"}`}>
            {item.success ? (
              <CheckCircle2 size={18} />
            ) : (
              <XCircle size={18} />
            )}
          </div>

          {/* Command information */}
          <div className="history-main">
            <strong>{item.text}</strong>

            <div className="history-meta">
              <span className="history-intent">
                <Zap size={12} />
                {item.intent || "UNKNOWN"}
              </span>

              <span className="history-time">
                <Clock3 size={12} />
                {formatTime(item.timestamp || item.id)}
              </span>
            </div>
          </div>

          {/* Result */}
          <div
            className={`history-status ${
              item.success ? "success" : "failed"
            }`}
          >
            {item.success ? "Completed" : "Failed"}
          </div>

        </div>
      ))}
    </div>
  );
}