import { Html } from "@react-three/drei";
import { useProgress } from "@react-three/drei";

export default function GlobalLoader() {
  const { progress, active } = useProgress();

  if (!active) return null;

  const hasRealProgress = progress > 0;

  return (
    <Html center>
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          padding: "24px 32px",
          borderRadius: "12px",
          color: "white",
          fontSize: "18px",
          minWidth: "260px",
          textAlign: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ marginBottom: 12 }}>Loading STL Model...</div>

        {hasRealProgress ? (
          <>
            <div style={{ marginBottom: 8 }}>
              {progress.toFixed(0)} %
            </div>

            <div
              style={{
                height: 8,
                background: "#2a2a2a",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, #06b6d4, #3b82f6)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </>
        ) : (
          // Indeterminate animated loader
          <div
            style={{
              height: 8,
              background: "#2a2a2a",
              borderRadius: 6,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                height: "100%",
                width: "40%",
                background:
                  "linear-gradient(90deg, transparent, #06b6d4, transparent)",
                animation: "loadingAnim 1.2s infinite",
              }}
            />
            <style>
              {`
                @keyframes loadingAnim {
                  0% { left: -40%; }
                  100% { left: 100%; }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </Html>
  );
}