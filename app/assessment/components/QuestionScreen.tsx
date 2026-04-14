type Props = {
  title: string;
  questionText: string;
  choices: string[];
  wrongAttempts: number;
  speechSupported: boolean;
  isListening: boolean;
  showTryAgain: boolean;
  recognizedChoice: string;
  heardText: string;
  voiceMessage: string;
  aiPromptText: string;
  onBack: () => void;
  onRead: () => void;
  onTryAgain: () => void;
  onVoice: () => void;
};

export default function QuestionScreen({
  title,
  questionText,
  choices,
  wrongAttempts,
  speechSupported,
  isListening,
  showTryAgain,
  recognizedChoice,
  heardText,
  voiceMessage,
  aiPromptText,
  onBack,
  onRead,
  onTryAgain,
  onVoice,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh - 120px)",
        borderRadius: "34px",
        overflow: "hidden",
        border: "4px solid #3d2517",
        boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.08) 100%)",
        padding: "clamp(12px, 2.5vw, 24px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.08)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="question-topbar">
          <button onClick={onBack} className="question-back-btn">
            ← BACK
          </button>

          <div className="question-title-pill">
            <div style={{ fontSize: "clamp(11px, 1.8vw, 14px)", fontWeight: 900, color: "#5b341c" }}>
              {title}
            </div>
          </div>

          <div className="question-heart-pill">
            <div style={{ fontSize: "16px" }}>❤️</div>
            <div style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: 900, color: "#b44b30" }}>
              {3 - wrongAttempts} / 3
            </div>
          </div>
        </div>

        <div className="question-layout">
          <div className="question-main">
            <div
              style={{
                textAlign: "center",
                marginBottom: "22px",
                paddingTop: "6px",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(24px, 5.5vw, 64px)",
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: "#f8f3df",
                  textTransform: "uppercase",
                  textShadow: "3px 3px 0 #4a2a18, 0 0 14px rgba(0,0,0,0.18)",
                  maxWidth: "900px",
                  margin: "0 auto",
                  wordBreak: "break-word",
                }}
              >
                {questionText}
              </h2>
            </div>

            <div className="question-choices-grid">
              {choices.map((choice, index) => (
                <div
                  key={`${choice}-${index}`}
                  style={{
                    border: "4px solid #5b341c",
                    background: "linear-gradient(180deg, #efd3a2 0%, #ddb27a 100%)",
                    boxShadow: "0 6px 0 #8a5a35",
                    padding: "clamp(12px, 2vw, 18px)",
                    minHeight: "clamp(72px, 11vw, 96px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    borderRadius: "0px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(17px, 3vw, 28px)",
                      fontWeight: 900,
                      color: "#2f1a10",
                      letterSpacing: "0.5px",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {choice.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="question-action-row">
              <button onClick={onRead} className="question-action-btn">
                🔊 REPLAY QUESTION
              </button>

              {showTryAgain && (
                <button onClick={onTryAgain} className="question-action-btn question-try-btn">
                  TRY AGAIN
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={onVoice}
                disabled={!speechSupported || isListening || showTryAgain}
                style={{
                  width: "clamp(100px, 22vw, 150px)",
                  height: "clamp(100px, 22vw, 150px)",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: !speechSupported || isListening || showTryAgain ? "not-allowed" : "pointer",
                  transform: isListening ? "scale(1.04)" : "scale(1)",
                  transition: "0.2s ease",
                  filter: isListening
                    ? "drop-shadow(0 0 18px rgba(255,90,90,0.55))"
                    : "drop-shadow(0 10px 18px rgba(0,0,0,0.28))",
                }}
                title="Start voice answer"
              >
                <img
                  src="/ui/assessment/mic.png"
                  alt="Microphone button"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    imageRendering: "pixelated",
                  }}
                />
              </button>
            </div>

            <div className="question-status-grid">
              <div className="question-status-card">
                <p className="question-status-label">RECOGNIZED</p>
                <p className="question-status-value">{recognizedChoice || "None yet"}</p>
              </div>

              <div className="question-status-card">
                <p className="question-status-label">HEARD VOICE</p>
                <p className="question-status-value question-status-value-light">
                  {heardText || "No speech captured yet"}
                </p>
              </div>

              <div className="question-status-card">
                <p className="question-status-label">STATUS</p>
                <p className="question-status-value" style={{ color: "#2a55a0" }}>
                  {voiceMessage || "Waiting for action..."}
                </p>
              </div>
            </div>
          </div>

          <div className="question-guide-wrap animate-guide-group">
            <div className="question-guide-bubble-wrap">
              <div className="question-guide-bubble">
                {aiPromptText || questionText}

                <div
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "10px solid #f1d9a6",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: "12px solid #5b341c",
                    zIndex: -1,
                  }}
                />
              </div>
            </div>

            <div className="question-guide-character">
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  width: "100px",
                  height: "18px",
                  borderRadius: "999px",
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.15) 45%, transparent 80%)",
                  filter: "blur(2px)",
                }}
              />

              <img
                src="/ui/assessment/Guide-Char.png"
                alt="Guide character"
                style={{
                  position: "relative",
                  zIndex: 2,
                  width: "100%",
                  maxWidth: "160px",
                  height: "auto",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.24))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}