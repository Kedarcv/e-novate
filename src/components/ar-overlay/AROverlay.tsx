import React from "react";
import "./ar-overlay.scss";

export interface AROverlayData {
  id: string;
  label: string;
  description: string;
  type: "info" | "issue" | "review";
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

interface AROverlayProps {
  overlays: AROverlayData[];
}

export default function AROverlay({ overlays }: AROverlayProps) {
  console.log("AROverlay: rendering with overlays", overlays);
  return (
    <div className="ar-overlay-container">
      {overlays.map((overlay) => {
        // Enforce minimum dimensions for visibility
        const width = Math.max((overlay.xmax - overlay.xmin) * 100, 10); // Min 10% width
        const height = Math.max((overlay.ymax - overlay.ymin) * 100, 10); // Min 10% height
        
        return (
          <div
            key={overlay.id}
            className={`ar-item ${overlay.type}`}
            style={{
              top: `${overlay.ymin * 100}%`,
              left: `${overlay.xmin * 100}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <div className="bounding-box">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
            
            <div className="annotation-line"></div>
            
            <div className="glass-card">
              <div className="card-header">
                <span className="icon material-symbols-outlined">
                  {overlay.type === "issue" ? "warning" : overlay.type === "review" ? "star" : "info"}
                </span>
                <span className="label">{overlay.label}</span>
              </div>
              <p className="description">{overlay.description}</p>
              {/* Debug Info - Remove in production */}
              <div style={{ fontSize: '10px', color: 'lime', marginTop: '5px', fontFamily: 'monospace' }}>
                y:{overlay.ymin.toFixed(2)} x:{overlay.xmin.toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
