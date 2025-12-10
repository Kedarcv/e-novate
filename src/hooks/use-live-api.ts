import { LiveConnectConfig } from "@google/genai";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { GenAILiveClient } from "../lib/genai-live-client";
import { LiveClientOptions } from "../types";

export type UseLiveAPIResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;
  model: string;
  setModel: (model: string) => void;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

// VolMeterWorklet code moved to public/audio-worklet.js

/**
 * Audio Streamer with iOS Fix
 * Properly handles PCM16 audio playback on iOS devices
 */

export class AudioStreamer {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private worklets: Map<string, AudioWorkletNode> = new Map();
  private queue: Uint8Array[] = [];
  private isPlaying: boolean = false;
  private sampleRate: number = 24000; // Gemini uses 24kHz
  private nextStartTime: number = 0;
  
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 1.0; // Full volume
    this.gainNode.connect(audioContext.destination);
    
    console.log(`🔊 AudioStreamer initialized. Context rate: ${audioContext.sampleRate}, Target: ${this.sampleRate}`);
  }

  async addWorklet<T>(
    name: string,
    workletSource: string, // Can be code or URL
    callback?: (event: MessageEvent<T>) => void
  ): Promise<void> {
    try {
      let url: string;
      
      // Check if it's code or a URL
      if (workletSource.includes("class ") && workletSource.includes("AudioWorkletProcessor")) {
        // It's code, create a blob
        const blob = new Blob([workletSource], { type: 'application/javascript' });
        url = URL.createObjectURL(blob);
      } else {
        // It's a URL (file path)
        url = workletSource;
      }

      await this.audioContext.audioWorklet.addModule(url);
      
      const workletNode = new AudioWorkletNode(this.audioContext, name);
      
      if (callback) {
        workletNode.port.onmessage = callback;
      }
      
      this.worklets.set(name, workletNode);
      console.log(`✅ Worklet "${name}" added from ${url.startsWith("blob:") ? "blob" : url}`);
    } catch (error) {
      console.error(`❌ Failed to add worklet "${name}":`, error);
    }
  }

  async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('✅ AudioContext resumed for output');
    }
  }

  async stop(): Promise<void> {
    this.isPlaying = false;
    this.queue = [];
    this.nextStartTime = 0;
    console.log('🛑 AudioStreamer stopped');
  }

  /**
   * Add PCM16 audio data to play
   * @param data Uint8Array containing PCM16 little-endian audio
   */
  addPCM16(data: Uint8Array): void {
    if (data.length === 0) {
      return;
    }

    console.log(`📦 Received audio chunk: ${data.length} bytes`);
    
    // Add to queue
    this.queue.push(data);
    
    // Start playing if not already playing
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.playQueue();
    }
  }

  private async playQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const pcm16Data = this.queue.shift()!;
      
      try {
        await this.playChunk(pcm16Data);
      } catch (error) {
        console.error('❌ Error playing audio chunk:', error);
      }
    }
    
    this.isPlaying = false;
  }

  private async playChunk(pcm16Data: Uint8Array): Promise<void> {
    // Ensure context is running
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Convert PCM16 to Float32
    const float32Data = this.pcm16ToFloat32(pcm16Data);
    
    if (float32Data.length === 0) {
      return;
    }

    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      float32Data.length,
      this.sampleRate
    );
    
    // Copy data to buffer
    audioBuffer.copyToChannel(float32Data as any, 0);
    
    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);
    
    // Calculate when to start this chunk
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    // Schedule playback
    source.start(startTime);
    
    // Update next start time
    const duration = audioBuffer.duration;
    this.nextStartTime = startTime + duration;
    
    console.log(`🔊 Playing chunk: ${float32Data.length} samples, duration: ${duration.toFixed(3)}s, start: ${startTime.toFixed(3)}s`);
    
    // Wait for this chunk to finish
    return new Promise((resolve) => {
      source.onended = () => {
        resolve();
      };
      
      // Fallback timeout
      setTimeout(resolve, duration * 1000 + 100);
    });
  }

  /**
   * Convert PCM16 little-endian to Float32
   */
  private pcm16ToFloat32(pcm16Data: Uint8Array): Float32Array {
    // PCM16 is 2 bytes per sample
    const sampleCount = Math.floor(pcm16Data.length / 2);
    const float32 = new Float32Array(sampleCount);
    
    const view = new DataView(pcm16Data.buffer, pcm16Data.byteOffset, pcm16Data.byteLength);
    
    for (let i = 0; i < sampleCount; i++) {
      // Read 16-bit signed integer (little-endian)
      const int16 = view.getInt16(i * 2, true);
      
      // Convert to float32 range [-1, 1]
      float32[i] = int16 / (int16 < 0 ? 0x8000 : 0x7FFF);
    }
    
    return float32;
  }

  /**
   * Set output volume
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.gainNode.gain.value;
  }
}

// Usage in your hook
export function useLiveAPI(options: LiveClientOptions) {
  const client = useMemo(() => new GenAILiveClient(options), [options]);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [model, setModel] = useState<string>("models/gemini-2.0-flash-exp");
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);

  // Initialize audio streamer
  useEffect(() => {
    const initAudioStreamer = async () => {
      if (!audioStreamerRef.current) {
        try {
          // Create audio context for output
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 48000, // iOS typically uses 48kHz
            latencyHint: 'interactive'
          });
          
          console.log('🔊 Creating AudioStreamer with context:', audioCtx.sampleRate);
          
          audioStreamerRef.current = new AudioStreamer(audioCtx);
          
          // Add volume meter worklet if needed
          try {
            // Load from static file in public directory
            await audioStreamerRef.current.addWorklet<any>(
              "vumeter-out", 
              "audio-worklet.js", 
              (ev: any) => {
                setVolume(ev.data.volume);
              }
            );
          } catch (e) {
            console.warn('⚠️ Volume meter worklet failed (not critical):', e);
          }
          
          console.log('✅ AudioStreamer initialized');
        } catch (error) {
          console.error('❌ Failed to initialize AudioStreamer:', error);
        }
      }
    };

    initAudioStreamer();
    
    return () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const onOpen = () => {
      console.log('✅ Connection opened');
      setConnected(true);
    };

    const onClose = () => {
      console.log('🔌 Connection closed');
      setConnected(false);
    };

    const onError = (error: ErrorEvent) => {
      console.error('❌ Connection error:', error);
    };

    const stopAudioStreamer = () => {
      console.log('⏹️ Stopping audio streamer');
      audioStreamerRef.current?.stop();
    };

    const onAudio = (data: ArrayBuffer) => {
      console.log(`🔊 Received audio data: ${data.byteLength} bytes`);
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      } else {
        console.warn('⚠️ AudioStreamer not initialized yet');
      }
    };

    client
      .on("error", onError)
      .on("open", onOpen)
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio);

    return () => {
      client
        .off("error", onError)
        .off("open", onOpen)
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio)
        .disconnect();
    };
  }, [client]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error("config has not been set");
    }
    
    console.log('🔌 Connecting to Gemini Live API...');
    client.disconnect();
    
    // CRITICAL: Resume audio context on user gesture
    if (audioStreamerRef.current) {
      try {
        await audioStreamerRef.current.resume();
        console.log("✅ Audio output context resumed");
      } catch (e) {
        console.error("❌ Failed to resume audio output context:", e);
      }
    }

    await client.connect(model, config);
  }, [client, config, model]);

  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting...');
    client.disconnect();
    audioStreamerRef.current?.stop();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    model,
    setModel,
    connected,
    connect,
    disconnect,
    volume,
  };
}