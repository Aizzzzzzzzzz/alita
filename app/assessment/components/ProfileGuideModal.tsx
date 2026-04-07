type Props = {
  onGoProfile: () => void;
  onSkip: () => void;
};

export default function ProfileGuideModal({ onGoProfile, onSkip }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "28px",
          border: "4px solid #5b341c",
          background: "linear-gradient(180deg, #f4e2b7 0%, #e5c27f 100%)",
          boxShadow: "0 8px 0 #8a5a35, 0 16px 24px rgba(0,0,0,0.22)",
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "10px" }}>👋</div>

        <h2 style={{ fontWeight: 900, color: "#5b341c" }}>
          Welcome to ALITA!
        </h2>

        <p style={{ fontWeight: 700, color: "#6e472a", marginTop: "10px" }}>
          Edit your profile now so you can choose your hero.
        </p>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={onGoProfile}
            style={{
              padding: "14px 22px",
              borderRadius: "18px",
              border: "4px solid #355e2b",
              background: "#8fd36b",
              fontWeight: 900,
            }}
          >
            EDIT PROFILE
          </button>

          <button
            onClick={onSkip}
            style={{
              padding: "14px 22px",
              borderRadius: "18px",
              border: "4px solid #5b341c",
              background: "#f6d28b",
              fontWeight: 900,
            }}
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  );
}