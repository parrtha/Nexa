export default function NexaCore({ state }) {
  const statusText = {
    listening: "Listening",
    processing: "Processing",
    speaking: "Speaking",
    idle: "Ready",
  };

  return (
    <div className={`nexa-stage ${state}`}>
      {/* Animated rings */}
      <div className="core-orbit orbit-one" />
      <div className="core-orbit orbit-two" />
      <div className="core-orbit orbit-three" />

      {/* Small orbit particles */}
      <span className="core-particle particle-one" />
      <span className="core-particle particle-two" />
      <span className="core-particle particle-three" />
      <span className="core-particle particle-four" />

      {/* Main Core */}
      <div className="core-wrapper">
        <div className="core-shadow" />

        <div className="core">
          <div className="core-inner-glow" />
          <div className="core-scan" />
          <span>N</span>
        </div>
      </div>

      {/* Status */}
      <div className="core-status">
        <span className="core-status-dot" />
        <span>{statusText[state] || "Ready"}</span>
      </div>

      <div className="core-subtitle">
        Local Windows Assistant
      </div>
    </div>
  );
}