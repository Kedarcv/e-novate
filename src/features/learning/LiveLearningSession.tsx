/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../App.scss";
import { LiveAPIProvider } from "../../contexts/LiveAPIContext";
import SidePanel from "../../components/side-panel/SidePanel";
import { Altair } from "../../components/altair/Altair";
import ControlTray from "../../components/control-tray/ControlTray";
import cn from "classnames";
import { LiveClientOptions } from "../../types";
import { useToolHandler } from "../../hooks/use-tool-handler";
import AROverlay, { AROverlayData } from "../../components/ar-overlay/AROverlay";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

const courseNames: Record<string, string> = {
  'web-dev': 'Web Development',
  'ai-basics': 'AI & Machine Learning',
  'data-analytics': 'Data Analytics',
  'digital-marketing': 'Digital Marketing',
  'entrepreneurship': 'Entrepreneurship',
};

export default function LiveLearningSession() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseName = courseId ? courseNames[courseId] || 'Learning Session' : 'Learning Session';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [arOverlays, setArOverlays] = useState<AROverlayData[]>([]);

  const handleHighlightObject = useCallback((data: AROverlayData) => {
    console.log("LiveLearningSession: handleHighlightObject received data", data);
    setArOverlays((prev) => [...prev, data]);
    setTimeout(() => {
      setArOverlays((prev) => prev.filter((o) => o.id !== data.id));
    }, 10000);
  }, []);

  return (
    <div className="App">
      <LiveAPIProvider options={apiOptions}>
        <ToolHandlerComponent onHighlightObject={handleHighlightObject} />
        <div className="streaming-console">
          <SidePanel />
          <main>
            {/* Course Header with Back Button */}
            <div className="session-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderBottom: '1px solid var(--glass-border)',
            }}>
              <button 
                onClick={() => navigate('/learn')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  fontSize: '14px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                Back
              </button>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{courseName}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Interactive AI Learning Session • Powered by Gemini
                </p>
              </div>
            </div>
            
            <div className="main-app-area">
              <Altair />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
              <AROverlay overlays={arOverlays} />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={true}
            >
            </ControlTray>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

// Helper component to use the hook within the provider
function ToolHandlerComponent({ onHighlightObject }: { onHighlightObject: (data: any) => void }) {
  useToolHandler(onHighlightObject);
  return null;
}

