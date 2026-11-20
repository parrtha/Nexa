import { useEffect, useRef, useState } from "react";



import {

  AlertCircle,

  Brain,

  ChevronRight,

  Command,

  Cpu,

  Mic2,

  Radio,

  ShieldCheck,

  Sparkles,

  Target,

  CheckCircle2,

  Zap,

  RotateCcw,

  Trash2,

  Activity,

  Clock3,

} from "lucide-react";



import Sidebar from "./components/Sidebar";

import NexaCore from "./components/NexaCore";

import VoiceButton from "./components/VoiceButton";

import CommandInput from "./components/CommandInput";

import QuickActions from "./components/QuickActions";

import SystemStatus from "./components/SystemStatus";

import CommandHistory from "./components/CommandHistory";

import { checkHealth, sendCommand } from "./services/api";



// ============================================================

// SPEECH

// ============================================================



function speak(text) {

  if (!("speechSynthesis" in window)) return;



  window.speechSynthesis.cancel();



  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;

  utterance.pitch = 1;



  window.speechSynthesis.speak(utterance);

}



// ============================================================

// CONFIDENCE LABEL

// ============================================================



function confidenceLabel(value) {

  if (value >= 80) return "High";

  if (value >= 60) return "Medium";

  return "Low";

}



// ============================================================

// APP

// ============================================================


const SUGGESTED_COMMANDS = [
  {
    text: "Open Calculator",
    category: "Apps",
  },
  {
    text: "Open Chrome",
    category: "Apps",
  },
  {
    text: "Open VS Code",
    category: "Apps",
  },
  {
    text: "Open Notepad",
    category: "Apps",
  },
  {
    text: "Open Downloads",
    category: "Folders",
  },
  {
    text: "Open Desktop",
    category: "Folders",
  },
  {
    text: "Open Documents",
    category: "Folders",
  },
  {
    text: "Check battery",
    category: "System",
  },
  {
    text: "Take screenshot",
    category: "System",
  },
  {
    text: "Turn the volume up",
    category: "System",
  },
  {
    text: "Turn the volume down",
    category: "System",
  },
  {
    text: "Mute volume",
    category: "System",
  },
  {
    text: "Increase brightness",
    category: "System",
  },
  {
    text: "Decrease brightness",
    category: "System",
  },
  {
    text: "Open Recycle Bin",
    category: "System",
  },
];
export default function App() {

  const [active, setActive] = useState("dashboard");



  const [backendOnline, setBackendOnline] = useState(false);

  const [listening, setListening] = useState(false);

  const [assistantState, setAssistantState] = useState("idle");

const [commandSuggestions, setCommandSuggestions] = useState([]);

  const [lastCommand, setLastCommand] = useState("");

  const [lastResponse, setLastResponse] =

    useState("Ready when you are.");



  // ==========================================================

  // FRONTEND UPGRADE 3

  // PERSISTENT HISTORY

  // ==========================================================

const [historyFilter, setHistoryFilter] = useState("all");


  const [history, setHistory] = useState(() => {

    try {

      const savedHistory =

        localStorage.getItem("nexa_command_history");



      if (!savedHistory) {

        return [];

      }



      const parsedHistory = JSON.parse(savedHistory);



      return Array.isArray(parsedHistory)

        ? parsedHistory.slice(0, 20)

        : [];

    } catch (error) {

      console.error(

        "Could not load Nexa command history:",

        error

      );



      return [];

    }

  });

const filteredHistory = history.filter((item) => {
  if (historyFilter === "successful") {
    return item.success;
  }

  if (historyFilter === "failed") {
    return !item.success;
  }

  return true;
});

const totalCommands = history.length;

  const [nlpResult, setNlpResult] = useState(null);



  const [processingTime, setProcessingTime] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);



  const [connectionMessage, setConnectionMessage] =

    useState("");



  const recognitionRef = useRef(null);



  const speechReady = Boolean(

    window.SpeechRecognition ||

      window.webkitSpeechRecognition

  );



  // ==========================================================

  // SAVE HISTORY TO LOCAL STORAGE

  // ==========================================================



  useEffect(() => {

    try {

      localStorage.setItem(

        "nexa_command_history",

        JSON.stringify(history)

      );

    } catch (error) {

      console.error(

        "Could not save Nexa command history:",

        error

      );

    }

  }, [history]);



  // ==========================================================

  // BACKEND HEALTH CHECK

  // ==========================================================



  async function refreshBackendStatus() {

    try {

      await checkHealth();



      setBackendOnline(true);

      setConnectionMessage("");

    } catch (error) {

      console.error("Health check failed:", error);



      setBackendOnline(false);

      setConnectionMessage(

        "Backend is not reachable."

      );

    }

  }



  useEffect(() => {

    refreshBackendStatus();



    const interval = setInterval(() => {

      refreshBackendStatus();

    }, 10000);



    return () => clearInterval(interval);

  }, []);



  // ==========================================================

  // PROCESS COMMAND

  // ==========================================================



  async function processCommand(text) {

    if (!text?.trim()) return;



    const command = text.trim();

    const startTime = performance.now();



    setLastCommand(command);

    setAssistantState("processing");

    setIsProcessing(true);

    setConnectionMessage("");



    try {

      const result = await sendCommand(command);



      const duration = Math.round(

        performance.now() - startTime

      );



      setProcessingTime(duration);



      setLastResponse(

        result.response ||

          "Command processed successfully."

      );



      // ========================================================

      // NLP RESULT

      // ========================================================



      setNlpResult({

        intent:

          result.intent ||

          "UNKNOWN",



        confidence: Number(

          result.confidence ?? 0

        ),



        confidence_label:

          result.confidence_label ||

          confidenceLabel(

            Number(result.confidence ?? 0)

          ),



        entities:

          result.entities || {},



        normalized_text:

          result.normalized_text ||

          command,



        matched_phrases:

          result.matched_phrases || [],



        meaningful_tokens:

          result.meaningful_tokens || [],



        response:

          result.response || "",



        success:

          Boolean(result.success),

      });



      // ========================================================

      // HISTORY ENTRY

      // ========================================================



      const historyItem = {

        id: Date.now(),



        text: command,



        intent:

          result.intent ||

          "UNKNOWN",



        success:

          Boolean(result.success),



        confidence:

          Number(

            result.confidence ?? 0

          ),



        duration,



        // Persistent timestamp

        timestamp: new Date().toISOString(),

      };



      // ========================================================

      // ADD TO HISTORY

      // ========================================================



      setHistory((prev) =>

        [historyItem, ...prev].slice(0, 20)

      );



      // ========================================================

      // SPEAK RESPONSE

      // ========================================================



      if (result.response) {

        speak(result.response);

      }



      setAssistantState("speaking");



      setTimeout(() => {

        setAssistantState("idle");

      }, 1200);

    } catch (error) {

      console.error(

        "Nexa command error:",

        error

      );



      const duration = Math.round(

        performance.now() - startTime

      );



      setProcessingTime(duration);

      setBackendOnline(false);



      setLastResponse(

        "I can't connect to the Nexa backend."

      );



      setConnectionMessage(

        "Please make sure the FastAPI backend is running on port 8000."

      );



      // ========================================================

      // ERROR NLP RESULT

      // ========================================================



      setNlpResult({

        intent: "BACKEND_ERROR",



        confidence: 0,



        confidence_label:

          "Unavailable",



        entities: {},



        normalized_text: command,



        matched_phrases: [],



        meaningful_tokens:

          command

            .toLowerCase()

            .split(/\s+/)

            .filter(Boolean),



        response:

          "Backend connection failed.",



        success: false,

      });



      // ========================================================

      // ERROR HISTORY

      // ========================================================



      const errorHistoryItem = {

        id: Date.now(),



        text: command,



        intent: "BACKEND_ERROR",



        success: false,



        confidence: 0,



        duration,



        timestamp:

          new Date().toISOString(),

      };



      setHistory((prev) =>

        [errorHistoryItem, ...prev].slice(0, 20)

      );



      setAssistantState("idle");

    } finally {

      setIsProcessing(false);

    }

  }



  // ==========================================================

  // VOICE LISTENING

  // ==========================================================



  function startListening() {

    const SpeechRecognition =

      window.SpeechRecognition ||

      window.webkitSpeechRecognition;



    if (!SpeechRecognition) {

      setLastResponse(

        "Speech recognition is not supported in this browser. You can use the text command box."

      );



      return;

    }



    if (listening) {

      recognitionRef.current?.stop();

      return;

    }



    const recognition =

      new SpeechRecognition();



    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;



    // ========================================================

    // START

    // ========================================================



    recognition.onstart = () => {

      setListening(true);

      setAssistantState("listening");



      setLastResponse(

        "Listening..."

      );

    };



    // ========================================================

    // RESULT

    // ========================================================



    recognition.onresult = (event) => {

      const text =

        event.results[0][0]

          .transcript

          .trim();



      setListening(false);



      if (!text) {

        setLastResponse(

          "I didn't hear a command. Please try again."

        );



        setAssistantState("idle");



        return;

      }



      const normalized =

        text.toLowerCase();



      // ======================================================

      // HEY NEXA

      // ======================================================



      const wakeIndex =

        normalized.indexOf(

          "hey nexa"

        );



      if (wakeIndex >= 0) {

        const command =

          text

            .slice(

              wakeIndex +

                "hey nexa".length

            )

            .trim();



        if (command) {

          processCommand(command);

        } else {

          setLastResponse(

            "Yes? What would you like me to do?"

          );



          setAssistantState("idle");

        }

      } else {

        processCommand(text);

      }

    };



    // ========================================================

    // ERROR

    // ========================================================



    recognition.onerror = (event) => {

      console.error(

        "Speech recognition error:",

        event

      );



      setListening(false);

      setAssistantState("idle");



      if (

        event.error ===

        "not-allowed"

      ) {

        setLastResponse(

          "Microphone permission was denied. Please allow microphone access."

        );

      } else if (

        event.error ===

        "no-speech"

      ) {

        setLastResponse(

          "No speech detected. Please try again."

        );

      } else {

        setLastResponse(

          "I couldn't understand the voice input. Please try again."

        );

      }

    };



    // ========================================================

    // END

    // ========================================================



    recognition.onend = () => {

      setListening(false);



      setAssistantState(

        (current) =>

          current === "listening"

            ? "idle"

            : current

      );

    };



    recognitionRef.current =

      recognition;



    recognition.start();

  }



  // ==========================================================

  // QUICK COMMAND

  // ==========================================================



  function quickCommand(command) {

    processCommand(command);

  }
function updateCommandSuggestions(value) {
  const query = value.trim().toLowerCase();

  if (!query) {
    setCommandSuggestions([]);
    return;
  }

  const recentCommands = history
    .filter((item) => item.text)
    .map((item) => ({
      text: item.text,
      category: "Recent",
      recent: true,
    }))
    .filter(
      (command, index, array) =>
        array.findIndex(
          (item) =>
            item.text.toLowerCase() ===
            command.text.toLowerCase()
        ) === index
    )
    .filter((command) =>
      command.text.toLowerCase().includes(query)
    )
    .slice(0, 3);

  const suggestedCommands = SUGGESTED_COMMANDS
    .filter((command) =>
      command.text.toLowerCase().includes(query)
    )
    .slice(0, 6);

 const combinedCommands = [
  ...recentCommands,
  ...suggestedCommands,
];

const uniqueCommands = combinedCommands.filter(
  (command, index, array) =>
    array.findIndex(
      (item) =>
        item.text.toLowerCase() ===
        command.text.toLowerCase()
    ) === index
);

setCommandSuggestions(uniqueCommands.slice(0, 8));
}
  // ==========================================================

  // REPEAT LAST COMMAND

  // ==========================================================



  function repeatLastCommand() {

    if (!lastCommand) return;



    processCommand(lastCommand);

  }



  // ==========================================================

  // CLEAR HISTORY

  // ==========================================================



  function clearHistory() {

    setHistory([]);



    try {

      localStorage.removeItem(

        "nexa_command_history"

      );

    } catch (error) {

      console.error(

        "Could not clear saved history:",

        error

      );

    }

  }



  // ==========================================================

  // PAGE TITLE

  // ==========================================================



  const pageTitle =

    active === "dashboard"

      ? "Good to see you."

      : active

          .charAt(0)

          .toUpperCase() +

        active.slice(1);



  // ==========================================================

  // NLP DATA

  // ==========================================================



  const confidence =

    Number(

      nlpResult?.confidence ?? 0

    );



  const entities =

    nlpResult?.entities &&

    typeof nlpResult.entities ===

      "object"

      ? Object.entries(

          nlpResult.entities

        )

      : [];



  // ==========================================================

  // STATISTICS

  // ==========================================================



 



  const successfulCommands =

    history.filter(

      (item) => item.success

    ).length;



  const failedCommands =

    history.filter(

      (item) => !item.success

    ).length;



  const successRate =

    totalCommands > 0

      ? Math.round(

          (successfulCommands /

            totalCommands) *

            100

        )

      : 0;



  // ==========================================================

  // RENDER

  // ==========================================================



  return (

    <div className="app-shell">



      {/* =====================================================

          SIDEBAR

      ====================================================== */}



      <Sidebar

        active={active}

        setActive={setActive}

      />



      <main className="main">



        {/* ===================================================

            TOP BAR

        ==================================================== */}



        <header className="topbar">

          <div>

            <span className="eyebrow">

              LOCAL WINDOWS ASSISTANT

            </span>



            <h1>

              {pageTitle}

            </h1>

          </div>



          <div className="topbar-right">



            <div className="mode-indicator">

              <Sparkles size={15} />



              <span>

                LOCAL MODE

              </span>

            </div>



            <span

              className={

                backendOnline

                  ? "status-pill online"

                  : "status-pill"

              }

            >

              <i />



              {backendOnline

                ? "System Online"

                : "Backend Offline"}

            </span>

          </div>

        </header>



        {/* ===================================================

            DASHBOARD

        ==================================================== */}



        {active === "dashboard" && (

          <>



            {/* =================================================

                HERO

            ================================================== */}



            <section className="hero-grid">



              {/* MAIN ASSISTANT CARD */}



              <div className="hero-card">



                <div className="hero-copy">



                  <div className="assistant-badge">

                    <Radio size={15} />



                    NEXA IS READY

                  </div>



                  <h2>

                    Your local assistant

                    <span>

                      {" "}for Windows.

                    </span>

                  </h2>



                  <p>

                    Control everyday Windows

                    tasks using natural language

                    with privacy-first,

                    rule-based NLP.

                  </p>



                </div>



                <NexaCore

                  state={assistantState}

                />



                {/* COMMAND DISPLAY */}



                <div className="command-display">



                  <span className="command-label">

                    <Mic2 size={14} />



                    LAST COMMAND

                  </span>



                  <strong>

                    {lastCommand ||

                      "Say or type a command to begin"}

                  </strong>



                  <span className="response">

                    {lastResponse}

                  </span>



                </div>



                {/* LIVE STATUS */}



                <div

                 className={`live-status ${assistantState}`}

                >



                  <div className="live-status-indicator">

                    <span />

                  </div>



                  <div className="live-status-content">



                    <span className="live-status-label">

                      NEXA STATUS

                    </span>



                    <strong>

                      {assistantState ===

                        "listening" &&

                        "Listening for your command"}



                      {assistantState ===

                        "processing" &&

                        "Understanding your command"}



                      {assistantState ===

                        "speaking" &&

                        "Responding to you"}



                      {assistantState ===

                        "idle" &&

                        "Ready for your next command"}

                    </strong>



                  </div>



                  <span className="live-status-state">

                    {assistantState.toUpperCase()}

                  </span>



                </div>



                {/* VOICE */}



                <VoiceButton

                  listening={listening}

                  assistantState={

                    assistantState

                  }

                  onClick={

                    startListening

                  }

                />



                {/* TEXT INPUT */}



                <CommandInput
  onSubmit={(value) => {
    setCommandSuggestions([]);
    processCommand(value);
  }}
  onChange={updateCommandSuggestions}
  suggestions={commandSuggestions}
  disabled={!backendOnline || isProcessing}
/>
{commandSuggestions.length > 0 && (
  <div className="command-suggestions">
    {commandSuggestions.map((suggestion) => (
      <button
        key={`${suggestion.text}-${suggestion.category}`}
        type="button"
        className="suggestion-item"
        onClick={() => {
          setCommandSuggestions([]);
          processCommand(suggestion.text);
        }}
      >
        <div className="suggestion-main">
          <span>{suggestion.text}</span>
          <small>{suggestion.category}</small>
        </div>

        <span className="suggestion-arrow">→</span>
      </button>
    ))}
  </div>
)}


                {/* PROCESSING */}



                {isProcessing && (

                  <div

                    style={{

                      marginTop: "12px",

                      textAlign:

                        "center",

                      fontSize: "12px",

                      opacity: 0.7,

                    }}

                  >

                    <Activity

                      size={14}

                      style={{

                        verticalAlign:

                          "middle",

                        marginRight:

                          "6px",

                      }}

                    />



                    Nexa is processing...

                  </div>

                )}



                {/* BACKEND MESSAGE */}



                {connectionMessage && (

                  <div

                    className="warning"

                    style={{

                      marginTop:

                        "12px",

                    }}

                  >

                    <AlertCircle

                      size={17}

                    />



                    {connectionMessage}

                  </div>

                )}



              </div>



              {/* =================================================

                  QUICK ACTIONS

              ================================================== */}



              <div className="side-panel">



                <div className="panel-heading">



                  <div>



                    <span className="eyebrow">

                      QUICK ACTIONS

                    </span>



                    <h3>

                      What can I do?

                    </h3>



                  </div>



                  <ChevronRight

                    size={18}

                  />



                </div>



                <QuickActions

                  onCommand={

                    quickCommand

                  }

                />



                <div className="local-note">



                  <ShieldCheck

                    size={19}

                  />



                  <div>



                    <strong>

                      Privacy-first

                      processing

                    </strong>



                    <span>

                      Commands are

                      interpreted locally

                      with rule-based NLP.

                      No AI API key is

                      required.

                    </span>



                  </div>



                </div>



              </div>



            </section>



            {/* =================================================

                COMMAND MONITOR

            ================================================== */}



            <section

              className="section"

              style={{

                marginTop:

                  "22px",

              }}

            >



              <div className="section-heading">



                <div>



                  <span className="eyebrow">

                    COMMAND MONITOR

                  </span>



                  <h3>

                    Assistant activity

                  </h3>



                </div>



                <Activity

                  size={19}

                />



              </div>



              <div

                style={{

                  display:

                    "grid",

                  gridTemplateColumns:

                    "repeat(4, minmax(0, 1fr))",

                  gap: "14px",

                }}

              >



                <div className="nlp-card">



                  <div className="nlp-icon">

                    <Command

                      size={19}

                    />

                  </div>



                  <span className="nlp-label">

                    TOTAL COMMANDS

                  </span>



                  <strong className="nlp-value">

                    {totalCommands}

                  </strong>



                </div>



                <div className="nlp-card">



                  <div className="nlp-icon success">

                    <CheckCircle2

                      size={19}

                    />

                  </div>



                  <span className="nlp-label">

                    SUCCESSFUL

                  </span>



                  <strong className="nlp-value success-text">

                    {successfulCommands}

                  </strong>



                </div>



                <div className="nlp-card">



                  <div className="nlp-icon">

                    <AlertCircle

                      size={19}

                    />

                  </div>



                  <span className="nlp-label">

                    FAILED

                  </span>



                  <strong className="nlp-value">

                    {failedCommands}

                  </strong>



                </div>



                <div className="nlp-card">



                  <div className="nlp-icon">

                    <Target

                      size={19}

                    />

                  </div>



                  <span className="nlp-label">

                    SUCCESS RATE

                  </span>



                  <strong className="nlp-value">

                    {successRate}%

                  </strong>



                </div>



              </div>



            </section>



            {/* =================================================

                NATURAL LANGUAGE EXAMPLES

            ================================================== */}



            <section className="section">



              <div className="section-heading">



                <div>



                  <span className="eyebrow">

                    TRY THESE

                  </span>



                  <h3>

                    Natural language examples

                  </h3>



                </div>



                <Sparkles

                  size={19}

                />



              </div>



              <div

                style={{

                  display:

                    "flex",

                  flexWrap:

                    "wrap",

                  gap: "10px",

                }}

              >



                {[

                  "Can you open the calculator?",

                  "Launch Chrome",

                  "Show my downloads",

                  "How much battery do I have?",

                  "Please take a screenshot",

                  "Turn the volume up",

                ].map(

                  (example) => (

                    <button

                      key={example}

                      className="section-action"

                      onClick={() =>

                        processCommand(

                          example

                        )

                      }

                      disabled={

                        !backendOnline ||

                        isProcessing

                      }

                      style={{

                        border:

                          "1px solid rgba(130,100,255,.25)",

                        padding:

                          "10px 14px",

                        borderRadius:

                          "10px",

                        cursor:

                          "pointer",

                      }}

                    >

                      {example}

                    </button>

                  )

                )}



              </div>



            </section>



            {/* =================================================

                NLP ANALYSIS

            ================================================== */}



            <section className="section">



              <div className="section-heading">



                <div>



                  <span className="eyebrow">

                    NLP ENGINE

                  </span>



                  <h3>

                    Command analysis

                  </h3>



                </div>



                <Brain

                  size={19}

                />



              </div>



              {!nlpResult ? (



                <div className="empty-history">



                  <Brain

                    size={22}

                  />



                  <span>

                    NLP analysis will appear

                    here after you run a

                    command.

                  </span>



                </div>



              ) : (



                <div className="nlp-grid">



                  {/* INTENT */}



                  <div className="nlp-card highlight">



                    <div className="nlp-icon">

                      <Target

                        size={19}

                      />

                    </div>



                    <span className="nlp-label">

                      DETECTED INTENT

                    </span>



                    <strong className="nlp-value">

                      {nlpResult.intent}

                    </strong>



                  </div>



                  {/* CONFIDENCE */}



                  <div className="nlp-card">



                    <div className="nlp-icon">

                      <Cpu

                        size={19}

                      />

                    </div>



                    <span className="nlp-label">

                      CONFIDENCE

                    </span>



                    <strong className="nlp-value">

                      {confidence}%

                    </strong>



                    <span className="nlp-subvalue">

                      {

                        nlpResult.confidence_label

                      }

                    </span>



                    <div className="confidence-bar">



                      <span

                        style={{

                          width: `${Math.min(

                            confidence,

                            100

                          )}%`,

                        }}

                      />



                    </div>



                  </div>



                  {/* EXECUTION */}



                  <div className="nlp-card">



                    <div

                      className={

                        nlpResult.success

                          ? "nlp-icon success"

                          : "nlp-icon"

                      }

                    >

                      {nlpResult.success ? (

                        <CheckCircle2

                          size={19}

                        />

                      ) : (

                        <AlertCircle

                          size={19}

                        />

                      )}

                    </div>



                    <span className="nlp-label">

                      EXECUTION

                    </span>



                    <strong

                      className={

                        nlpResult.success

                          ? "nlp-value success-text"

                          : "nlp-value error-text"

                      }

                    >

                      {nlpResult.success

                        ? "Successful"

                        : "Failed"}

                    </strong>



                  </div>



                  {/* RESPONSE */}



                  <div className="nlp-card">



                    <div className="nlp-icon">

                      <Zap

                        size={19}

                      />

                    </div>



                    <span className="nlp-label">

                      RESPONSE

                    </span>



                    <strong className="response-value">

                      {nlpResult.response ||

                        "No response"}

                    </strong>



                  </div>



                  {/* NORMALIZED */}



                  <div className="nlp-card">



                    <span className="nlp-label">

                      NORMALIZED TEXT

                    </span>



                    <div className="code-value">

                      {

                        nlpResult.normalized_text ||

                        "-"

                      }

                    </div>



                  </div>



                  {/* MATCHED PHRASES */}



                  <div className="nlp-card">



                    <span className="nlp-label">

                      MATCHED PHRASES

                    </span>



                    <div className="tag-list">



                      {nlpResult.matched_phrases

                        ?.length ? (



                        nlpResult.matched_phrases.map(

                          (

                            phrase,

                            index

                          ) => (

                            <span

                              className="data-tag"

                              key={index}

                            >

                              {phrase}

                            </span>

                          )

                        )



                      ) : (



                        <span className="muted">

                          None

                        </span>



                      )}



                    </div>



                  </div>



                  {/* ENTITIES */}



                  <div className="nlp-card">



                    <span className="nlp-label">

                      EXTRACTED ENTITIES

                    </span>



                    {entities.length ? (



                      <div className="entity-list">



                        {entities.map(

                          (

                            [key, value]

                          ) => (

                            <div

                              className="entity-row"

                              key={key}

                            >

                              <span>

                                {key}

                              </span>



                              <strong>

                                {String(

                                  value

                                )}

                              </strong>

                            </div>

                          )

                        )}



                      </div>



                    ) : (



                      <span className="muted">

                        No entities detected

                      </span>



                    )}



                  </div>



                  {/* TOKENS */}



                  <div className="nlp-card">



                    <span className="nlp-label">

                      MEANINGFUL TOKENS

                    </span>



                    <div className="tag-list">



                      {nlpResult.meaningful_tokens

                        ?.length ? (



                        nlpResult.meaningful_tokens.map(

                          (

                            token,

                            index

                          ) => (

                            <span

                              className="data-tag"

                              key={index}

                            >

                              {token}

                            </span>

                          )

                        )



                      ) : (



                        <span className="muted">

                          None

                        </span>



                      )}



                    </div>



                  </div>



                  {/* PROCESSING TIME */}



                  <div className="nlp-card">



                    <div className="nlp-icon">

                      <Clock3

                        size={19}

                      />

                    </div>



                    <span className="nlp-label">

                      PROCESSING TIME

                    </span>



                    <strong className="nlp-value">

                      {processingTime} ms

                    </strong>



                  </div>



                </div>



              )}



            </section>



            {/* =================================================

                RECENT ACTIVITY

            ================================================== */}



            <section className="section">



              <div className="section-heading">



                <div>



                  <span className="eyebrow">

                    RECENT ACTIVITY

                  </span>



                  <h3>

                    Command history

                  </h3>



                </div>



                <div

                  style={{

                    display:

                      "flex",

                    gap: "8px",

                  }}

                >



                  {lastCommand && (

                    <button

                      className="section-action"

                      onClick={

                        repeatLastCommand

                      }

                      disabled={

                        isProcessing

                      }

                    >

                      <RotateCcw

                        size={15}

                      />



                      Repeat

                    </button>

                  )}

                  {history.length > 0 && (
                    <button
                      className="section-action"
                      onClick={clearHistory}
                    >
                      <Trash2 size={15} />
                      Clear
                    </button>
                  )}

                  <button

                    className="section-action"

                    onClick={() =>

                      setActive(

                        "history"

                      )

                    }

                  >

                    View all



                    <ChevronRight

                      size={15}

                    />

                  </button>



                </div>



              </div>



              <CommandHistory
              history={history}
            />



            </section>



            {/* =================================================

                SYSTEM

            ================================================== */}



            <section className="section">



              <div className="section-heading">



                <div>



                  <span className="eyebrow">

                    SYSTEM

                  </span>



                  <h3>

                    Assistant status

                  </h3>



                </div>



                <div className="system-live">

                  <span />

                  LIVE

                </div>



              </div>



              <SystemStatus

                backendOnline={

                  backendOnline

                }

                speechReady={

                  speechReady

                }

              />



            </section>



          </>

        )}



        {/* ===================================================

            COMMANDS PAGE

        ==================================================== */}



        {active === "commands" && (

          <section className="page-card">



            <span className="eyebrow">

              COMMAND CENTER

            </span>



            <h2>

              Supported command families

            </h2>



            <p className="page-description">

              Nexa understands natural-language

              commands through the local NLP

              engine.

            </p>



            <div className="command-categories">



              <div>

                <Command

                  size={20}

                />



                <strong>

                  Applications

                </strong>



                <span>

                  Calculator · Chrome · VS Code ·

                  Notepad

                </span>

              </div>



              <div>

                <Command

                  size={20}

                />



                <strong>

                  Folders

                </strong>



                <span>

                  Downloads · Desktop · Documents ·

                  Pictures · Videos · Music

                </span>

              </div>



              <div>

                <Command

                  size={20}

                />



                <strong>

                  System

                </strong>



                <span>

                  Battery · Volume · Brightness ·

                  Screenshot

                </span>

              </div>



              <div>

                <Command

                  size={20}

                />



                <strong>

                  Search

                </strong>



                <span>

                  Google · YouTube · Web search

                </span>

              </div>



              <div>

                <Command

                  size={20}

                />



                <strong>

                  Recycle Bin

                </strong>



                <span>

                  Open and empty

                </span>

              </div>



            </div>



          </section>

        )}



        {/* ===================================================

            HISTORY PAGE

        ==================================================== */}



        {active === "history" && (

          <section className="page-card">



            <div

              style={{

                display:

                  "flex",

                justifyContent:

                  "space-between",

                alignItems:

                  "center",

              }}

            >



              <div>



                <span className="eyebrow">

                  ACTIVITY

                </span>



                <h2>

                  All recent commands

                </h2>



              </div>



              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {[
                  ["all", "All", history.length],
                  ["successful", "Successful", successfulCommands],
                  ["failed", "Failed", failedCommands],
                ].map(([value, label, count]) => (
                  <button
                    key={value}
                    className="section-action"
                    onClick={() => setHistoryFilter(value)}
                    style={{
                      opacity: historyFilter === value ? 1 : 0.62,
                      border:
                        historyFilter === value
                          ? "1px solid rgba(130,100,255,.45)"
                          : undefined,
                    }}
                  >
                    {label} ({count})
                  </button>
                ))}

                {history.length > 0 && (
                  <button
                    className="section-action"
                    onClick={clearHistory}
                  >
                    <Trash2 size={15} />
                    Clear history
                  </button>
                )}
              </div>



            </div>



            <CommandHistory
              history={filteredHistory}
            />



          </section>

        )}



        {/* ===================================================

            SYSTEM PAGE

        ==================================================== */}



        {active === "system" && (

          <section className="page-card">



            <span className="eyebrow">

              SYSTEM STATUS

            </span>



            <h2>

              Nexa runtime

            </h2>



            <SystemStatus

              backendOnline={

                backendOnline

              }

              speechReady={

                speechReady

              }

            />



            {!backendOnline && (

              <div className="warning">



                <AlertCircle

                  size={18}

                />



                Start the FastAPI

                backend on port 8000.



              </div>

            )}



            <div

              style={{

                marginTop:

                  "20px",

              }}

            >



              <button

                className="section-action"

                onClick={

                  refreshBackendStatus

                }

              >

                <RotateCcw

                  size={15}

                />



                Check connection

              </button>



            </div>



          </section>

        )}



        {/* ===================================================

            SETTINGS PAGE

        ==================================================== */}



        {active === "settings" && (

          <section className="page-card">



            <span className="eyebrow">

              CONFIGURATION

            </span>



            <h2>

              Local assistant settings

            </h2>



            <div className="setting-row">



              <div>



                <strong>

                  AI model

                </strong>



                <span>

                  Not required for

                  rule-based command

                  execution

                </span>



              </div>



              <b className="tag">

                LOCAL

              </b>



            </div>



            <div className="setting-row">



              <div>



                <strong>

                  External AI API

                </strong>



                <span>

                  Not required

                </span>



              </div>



              <b className="tag">

                NONE

              </b>



            </div>



            <div className="setting-row">



              <div>



                <strong>

                  Intent engine

                </strong>



                <span>

                  Rule-based NLP

                </span>



              </div>



              <b className="tag">

                RULES

              </b>



            </div>



            <div className="setting-row">



              <div>



                <strong>

                  Voice recognition

                </strong>



                <span>

                  Browser Speech

                  Recognition

                </span>



              </div>



              <b className="tag">

                {speechReady

                  ? "READY"

                  : "UNAVAILABLE"}

              </b>



            </div>



            <div className="setting-row">



              <div>



                <strong>

                  Backend status

                </strong>



                <span>

                  FastAPI local server

                </span>



              </div>



              <b className="tag">

                {backendOnline

                  ? "ONLINE"

                  : "OFFLINE"}

              </b>



            </div>



            {/* PERSISTENCE STATUS */}



            <div className="setting-row">



              <div>



                <strong>

                  Command history

                </strong>



                <span>

                  Saved locally in your

                  browser

                </span>



              </div>



              <b className="tag">

                PERSISTENT

              </b>



            </div>



          </section>

        )}



      </main>

    </div>

  );

}