import { Mic, Square, Loader2, Volume2 } from "lucide-react";

export default function VoiceButton({ listening, assistantState, onClick }) {
  const isProcessing = assistantState === "processing";
  const isSpeaking = assistantState === "speaking";

  let label = "Start Listening";
  let Icon = Mic;

  if (listening) {
    label = "Listening...";
    Icon = Square;
  } else if (isProcessing) {
    label = "Processing...";
    Icon = Loader2;
  } else if (isSpeaking) {
    label = "Nexa is speaking...";
    Icon = Volume2;
  }

  return (
    <button
      className={`voice-button ${
        listening ? "recording" : ""
      } ${isProcessing ? "processing" : ""} ${
        isSpeaking ? "speaking" : ""
      }`}
      onClick={onClick}
      disabled={isProcessing || isSpeaking}
    >
      <span className="voice-icon-wrap">
        <Icon
          size={22}
          className={isProcessing ? "spin-icon" : ""}
        />

        {listening && (
          <>
            <span className="voice-pulse pulse-one" />
            <span className="voice-pulse pulse-two" />
          </>
        )}
      </span>

      <span className="voice-text">
        <strong>{label}</strong>

        {listening && (
          <small>Speak your command</small>
        )}

        {isProcessing && (
          <small>Understanding your command</small>
        )}

        {isSpeaking && (
          <small>Preparing your response</small>
        )}

        {!listening && !isProcessing && !isSpeaking && (
          <small>Click to talk to Nexa</small>
        )}
      </span>
    </button>
  );
}