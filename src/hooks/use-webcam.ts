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

import { useState, useEffect } from "react";
import { UseMediaStreamResult } from "./use-media-stream-mux";

export function useWebcam(): UseMediaStreamResult & { switchCamera: () => Promise<MediaStream | null> } {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    const handleStreamEnded = () => {
      setIsStreaming(false);
      setStream(null);
    };
    if (stream) {
      stream
        .getTracks()
        .forEach((track) => track.addEventListener("ended", handleStreamEnded));
      return () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.removeEventListener("ended", handleStreamEnded),
          );
      };
    }
  }, [stream]);

  const start = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    setStream(mediaStream);
    setIsStreaming(true);
    return mediaStream;
  };

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const switchCamera = async () => {
    if (isStreaming) {
      stop();
      const nextMode = facingMode === "user" ? "environment" : "user";
      setFacingMode(nextMode);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode },
      });
      setStream(mediaStream);
      setIsStreaming(true);
      return mediaStream;
    } else {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
        return null;
    }
  };

  const result: UseMediaStreamResult & { switchCamera: () => Promise<MediaStream | null> } = {
    type: "webcam",
    start,
    stop,
    isStreaming,
    stream,
    switchCamera,
  };

  return result;
}
