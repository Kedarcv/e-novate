class VolumeMeterProcessor extends AudioWorkletProcessor {
  volume;
  updateInterval;
  nextUpdateFrame;
  port;

  constructor() {
    super();
    this.volume = 0;
    this.updateInterval = 50; // Update every 50ms
    this.nextUpdateFrame = this.updateInterval;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const samples = input[0];
      let sum = 0;
      
      for (let i = 0; i < samples.length; i++) {
        sum += samples[i] * samples[i];
      }
      
      this.volume = Math.sqrt(sum / samples.length);
      
      this.nextUpdateFrame -= samples.length;
      
      if (this.nextUpdateFrame <= 0) {
        this.port.postMessage({ volume: this.volume });
        this.nextUpdateFrame = this.updateInterval;
      }
    }
    
    return true;
  }
}

registerProcessor('vumeter-out', VolumeMeterProcessor);
