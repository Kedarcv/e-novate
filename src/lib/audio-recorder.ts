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

import EventEmitter from "eventemitter3";

export class AudioRecorder extends EventEmitter {
  sampleRate: number;
  stream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  source: MediaStreamAudioSourceNode | null = null;
  processor: AudioWorkletNode | ScriptProcessorNode | null = null;
  recording: boolean = false;

  constructor(sampleRate = 16000) {
    super();
    this.sampleRate = sampleRate;
  }

  async start() {
    console.log("🎤 AudioRecorder.start() called");
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia not available");
    }

    try {
      // Request microphone access with specific constraints for iOS
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // @ts-ignore - iOS specific constraint
          sampleRate: 48000 // iOS typically uses 48kHz
        }
      });
      console.log("✅ Microphone access granted");

      // Create audio context - iOS requires user interaction first
      // @ts-ignore - webkitAudioContext fallback
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      console.log(`✅ AudioContext created. Rate: ${this.audioContext.sampleRate}, State: ${this.audioContext.state}`);

      // Resume context if suspended (iOS requirement)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log("✅ AudioContext resumed");
      }

      // Create source from microphone stream
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Try to use AudioWorkletNode first (modern approach)
      if (this.audioContext.audioWorklet) {
        await this.startWithWorklet();
      } else {
        // Fallback to ScriptProcessorNode for older browsers
        this.startWithScriptProcessor();
      }

      this.recording = true;
      console.log("✅ AudioRecorder started successfully");
      
    } catch (error) {
      console.error("❌ AudioRecorder start failed:", error);
      throw error;
    }
  }

  async startWithWorklet() {
    if (!this.audioContext) return;
    
    try {
      // Create inline worklet processor
      const processorCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.bufferSize = 4096;
            this.buffer = new Float32Array(this.bufferSize);
            this.bufferIndex = 0;
          }

          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const inputChannel = input[0];
              
              for (let i = 0; i < inputChannel.length; i++) {
                this.buffer[this.bufferIndex++] = inputChannel[i];
                
                if (this.bufferIndex >= this.bufferSize) {
                  // Send buffer to main thread
                  this.port.postMessage({
                    type: 'audio',
                    data: this.buffer.slice(0)
                  });
                  this.bufferIndex = 0;
                }
              }
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;

      const blob = new Blob([processorCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      
      await this.audioContext.audioWorklet.addModule(url);
      console.log("✅ AudioWorklet module loaded");
      
      this.processor = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      const inputSampleRate = this.audioContext.sampleRate;
      const targetSampleRate = this.sampleRate;
      
      this.processor.port.onmessage = (event) => {
        if (event.data.type === 'audio') {
          const audioData = event.data.data;
          
          // Downsample to target rate (16kHz for Gemini)
          const downsampled = this.downsampleBuffer(audioData, inputSampleRate, targetSampleRate);
          
          // Convert to PCM16
          const pcm16 = this.floatTo16BitPCM(downsampled);
          
          // Convert to base64
          const base64 = this.arrayBufferToBase64(pcm16);
          this.emit('data', base64);
          
          // Calculate volume
          const volume = this.calculateVolume(audioData);
          this.emit('volume', volume);
        }
      };
      
      this.source?.connect(this.processor);
      // Don't connect to destination on iOS - causes issues
      console.log("✅ Using AudioWorklet");
      
    } catch (error) {
      console.error("❌ AudioWorklet failed, falling back to ScriptProcessor:", error);
      this.startWithScriptProcessor();
    }
  }

  startWithScriptProcessor() {
    if (!this.audioContext || !this.source) return;
    
    console.log("🔄 Using ScriptProcessorNode fallback");
    
    // Use smaller buffer size for better iOS compatibility
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    const inputSampleRate = this.audioContext.sampleRate;
    const targetSampleRate = this.sampleRate;
    
    this.processor.onaudioprocess = (e) => {
      if (!this.recording) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Downsample to 16kHz
      const downsampled = this.downsampleBuffer(inputData, inputSampleRate, targetSampleRate);
      
      // Convert to PCM16
      const pcm16 = this.floatTo16BitPCM(downsampled);
      
      // Convert to base64
      const base64 = this.arrayBufferToBase64(pcm16);
      this.emit('data', base64);
      
      // Calculate volume
      const volume = this.calculateVolume(inputData);
      this.emit('volume', volume);
    };

    this.source.connect(this.processor);
    
    // CRITICAL: On iOS, we need to connect to destination for ScriptProcessor to work
    // But we set gain to 0 to avoid feedback
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    this.processor.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    console.log("✅ Using ScriptProcessor with silent output");
  }

  calculateVolume(buffer: Float32Array) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  downsampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number) {
    if (outSampleRate === sampleRate) {
      return buffer;
    }
    if (outSampleRate > sampleRate) {
      // throw new Error("Output sample rate must be lower than input sample rate");
      return buffer; // Just return original if upsampling needed (not handled here)
    }
    
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      
      // Average samples for anti-aliasing
      let accum = 0;
      let count = 0;
      
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    
    return result;
  }

  floatTo16BitPCM(float32Array: Float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(i * 2, int16, true); // true = little-endian
    }
    
    return buffer;
  }

  arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }

  stop() {
    console.log("🛑 Stopping AudioRecorder");
    
    this.recording = false;
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      this.stream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log("✅ AudioRecorder stopped");
  }
}
