"use client";
import { useState, useRef, useEffect } from "react";
import { processAscii } from "@/utils/ascii";
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

export default function Home() {
  const [options, setOptions] = useState({
    chars: "@#S%?*+;:,.",
    resolution: 8,
    colorMode: "grayscale",
    singleColor: "#10b981",
    invertMapping: false,
    filters: { brightness: 100, contrast: 100, invert: 0, blur: 0 },
    bg: "#000000",
    aspectRatio: "original",
    focusHumans: false,
    isolateSubject: false
  });

  const [imageSrc, setImageSrc] = useState(null);
  const [isolatedImageSrc, setIsolatedImageSrc] = useState(null);
  const [isIsolating, setIsIsolating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sourceCanvasRef = useRef(null);
  const targetCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [zoom, setZoom] = useState(1);
  const segmenterRef = useRef(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  useEffect(() => {
    if (options.focusHumans && !segmenterRef.current) {
      const loadModel = async () => {
        setIsModelLoading(true);
        try {
          segmenterRef.current = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.50,
            quantBytes: 2
          });
        } catch (err) {
          console.error("Failed to load model", err);
        }
        setIsModelLoading(false);
      };
      loadModel();
    }
  }, [options.focusHumans]);

  useEffect(() => {
    const handleIsolation = async () => {
      if (options.isolateSubject && imageSrc) {
        setIsIsolating(true);
        try {
          const { default: imglyRemoveBackground } = await import("@imgly/background-removal");
          const blob = await imglyRemoveBackground(imageSrc);
          setIsolatedImageSrc(URL.createObjectURL(blob));
        } catch (err) {
          console.error("Failed to isolate subject", err);
          setIsolatedImageSrc(null);
        }
        setIsIsolating(false);
      } else {
        setIsolatedImageSrc(null);
      }
    };
    handleIsolation();
  }, [options.isolateSubject, imageSrc]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
      if (isWebcamActive) stopWebcam();
    };
    reader.readAsDataURL(file);
  };

  // Draw image to source canvas and process
  useEffect(() => {
    if (!imageSrc && !isWebcamActive) return;

    let currentSrc = imageSrc;
    if (options.isolateSubject) {
      if (isolatedImageSrc) currentSrc = isolatedImageSrc;
      else return; // Wait for isolation to finish
    }

    if (currentSrc && !isWebcamActive) {
      const img = new Image();
      img.onload = async () => {
        const canvas = sourceCanvasRef.current;
        if (!canvas) return;
        
        // Aspect Ratio logic
        let sourceW = img.width;
        let sourceH = img.height;
        let cropW = sourceW;
        let cropH = sourceH;
        let offsetX = 0;
        let offsetY = 0;

        if (options.aspectRatio !== "original") {
          let targetAspect = 1;
          if (options.aspectRatio === "landscape") targetAspect = 16 / 9;
          if (options.aspectRatio === "portrait") targetAspect = 9 / 16;
          
          const currentAspect = sourceW / sourceH;
          if (currentAspect > targetAspect) {
            cropW = sourceH * targetAspect;
            offsetX = (sourceW - cropW) / 2;
          } else {
            cropH = sourceW / targetAspect;
            offsetY = (sourceH - cropH) / 2;
          }
        }

        const MAX_DIM = 800;
        let finalW = cropW;
        let finalH = cropH;
        if (finalW > MAX_DIM || finalH > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / finalW, MAX_DIM / finalH);
          finalW = Math.floor(finalW * ratio);
          finalH = Math.floor(finalH * ratio);
        }

        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext("2d");
        
        if (options.focusHumans && segmenterRef.current) {
          ctx.drawImage(img, offsetX, offsetY, cropW, cropH, 0, 0, finalW, finalH);
          try {
            const segmentation = await segmenterRef.current.segmentPerson(canvas);
            const mask = bodyPix.toMask(segmentation, {r:0,g:0,b:0,a:255}, {r:0,g:0,b:0,a:0});
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.filter = 'blur(12px) brightness(0.4)';
            tempCtx.drawImage(canvas, 0, 0);

            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width; maskCanvas.height = canvas.height;
            maskCanvas.getContext('2d').putImageData(mask, 0, 0);

            const sharpCanvas = document.createElement('canvas');
            sharpCanvas.width = canvas.width; sharpCanvas.height = canvas.height;
            const sharpCtx = sharpCanvas.getContext('2d');
            sharpCtx.drawImage(canvas, 0, 0);
            sharpCtx.globalCompositeOperation = 'destination-in';
            sharpCtx.drawImage(maskCanvas, 0, 0);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.drawImage(sharpCanvas, 0, 0);
          } catch(e) { console.error(e); }
        } else {
          ctx.drawImage(img, offsetX, offsetY, cropW, cropH, 0, 0, finalW, finalH);
        }
        
        runAscii();
      };
      img.src = currentSrc;
    }
  }, [imageSrc, isolatedImageSrc, isWebcamActive, options.isolateSubject, options.aspectRatio, options.focusHumans]);

  // Debounced processing for option changes
  useEffect(() => {
    if (isWebcamActive) return; // webcam handles its own loop
    const handler = setTimeout(() => {
      if (imageSrc) runAscii();
    }, 150); // debounce 150ms
    return () => clearTimeout(handler);
  }, [options]);

  const runAscii = () => {
    if (!sourceCanvasRef.current || !targetCanvasRef.current) return;
    setIsProcessing(true);
    // Use requestAnimationFrame so UI doesn't completely block immediately
    requestAnimationFrame(() => {
      processAscii(sourceCanvasRef.current, targetCanvasRef.current, options);
      setIsProcessing(false);
    });
  };

  // Webcam Logic
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        setImageSrc(null);
      }
    } catch (err) {
      console.error("Error accessing webcam", err);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  useEffect(() => {
    if (isWebcamActive) {
      stopWebcam();
      setTimeout(startWebcam, 100);
    }
  }, [facingMode]);

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsWebcamActive(false);
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Webcam loop
  useEffect(() => {
    if (!isWebcamActive) return;
    
    let isRunning = true;
    
    const loop = async () => {
      if (!isRunning) return;
      if (videoRef.current && sourceCanvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = sourceCanvasRef.current;
        
        let sourceW = video.videoWidth;
        let sourceH = video.videoHeight;
        let cropW = sourceW;
        let cropH = sourceH;
        let offsetX = 0;
        let offsetY = 0;

        if (options.aspectRatio !== "original") {
          let targetAspect = 1;
          if (options.aspectRatio === "landscape") targetAspect = 16 / 9;
          if (options.aspectRatio === "portrait") targetAspect = 9 / 16;
          
          const currentAspect = sourceW / sourceH;
          if (currentAspect > targetAspect) {
            cropW = sourceH * targetAspect;
            offsetX = (sourceW - cropW) / 2;
          } else {
            cropH = sourceW / targetAspect;
            offsetY = (sourceH - cropH) / 2;
          }
        }
        
        // Scale down webcam for performance
        const scale = 0.5;
        canvas.width = Math.floor(cropW * scale);
        canvas.height = Math.floor(cropH * scale);
        
        const ctx = canvas.getContext("2d");
        
        if (options.focusHumans && segmenterRef.current) {
          ctx.drawImage(video, offsetX, offsetY, cropW, cropH, 0, 0, canvas.width, canvas.height);
          try {
            const segmentation = await segmenterRef.current.segmentPerson(canvas);
            const mask = bodyPix.toMask(segmentation, {r:0,g:0,b:0,a:255}, {r:0,g:0,b:0,a:0});
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.filter = 'blur(12px) brightness(0.4)';
            tempCtx.drawImage(canvas, 0, 0);

            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width; maskCanvas.height = canvas.height;
            maskCanvas.getContext('2d').putImageData(mask, 0, 0);

            const sharpCanvas = document.createElement('canvas');
            sharpCanvas.width = canvas.width; sharpCanvas.height = canvas.height;
            const sharpCtx = sharpCanvas.getContext('2d');
            sharpCtx.drawImage(canvas, 0, 0);
            sharpCtx.globalCompositeOperation = 'destination-in';
            sharpCtx.drawImage(maskCanvas, 0, 0);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.drawImage(sharpCanvas, 0, 0);
          } catch(e) { console.error(e); }
        } else {
          ctx.drawImage(video, offsetX, offsetY, cropW, cropH, 0, 0, canvas.width, canvas.height);
        }
        
        processAscii(sourceCanvasRef.current, targetCanvasRef.current, options);
      }
      
      if (isRunning) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };
    
    loop();
    
    return () => {
      isRunning = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [isWebcamActive, options]);

  // Exports
  const downloadPng = () => {
    if (!targetCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = "ascii-art.png";
    link.href = targetCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const downloadTxt = () => {
    if (!sourceCanvasRef.current || !targetCanvasRef.current) return;
    // Re-run to get plain text string
    const text = processAscii(sourceCanvasRef.current, targetCanvasRef.current, options);
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "ascii-art.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleShareToGallery = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to share your artwork to the gallery!");
      return;
    }
    
    if (!sourceCanvasRef.current || !targetCanvasRef.current) return;
    
    const title = prompt("Enter a title for your ASCII creation:", "UNTITLED_SECTOR");
    if (!title) return;

    const asciiData = processAscii(sourceCanvasRef.current, targetCanvasRef.current, options);
    const imageData = targetCanvasRef.current.toDataURL("image/png");

    try {
      const res = await fetch(`/api/artworks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ title, asciiData, imageData })
      });
      
      if (res.ok) {
        const newArt = await res.json();
        alert(`Artwork submitted!\n\nTo view this directly in your terminal, run:\ncurl.exe -s ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${newArt._id}/raw`);
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to share to gallery.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while sharing.");
    }
  };

  return (
    <div className="app-layout animate-fade-in">
      <aside className="sidebar">
        
        <div className="section-title">INPUT_SOURCE</div>
        <div className="control-group">
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="file-upload" />
          <button className="primary w-full" onClick={() => document.getElementById("file-upload").click()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            UPLOAD_IMAGE
          </button>
        </div>

        <div className="control-group">
          <button className={`secondary w-full`} onClick={isWebcamActive ? stopWebcam : startWebcam}>
            {isWebcamActive ? "STOP_STREAM" : "INIT_WEBCAM"}
          </button>
          {isWebcamActive && (
            <button className="secondary w-full" onClick={toggleCamera}>
              FLIP_CAMERA (REAR)
            </button>
          )}
        </div>

        <div className="section-title" style={{marginTop: '10px'}}>PARAMETERS</div>
        <div className="control-group">
          <label className="control-label">
            <span>DENSITY_RES</span>
            <span className="control-value">{options.resolution}px</span>
          </label>
          <input type="range" min="2" max="30" value={options.resolution} onChange={e => setOptions({...options, resolution: parseInt(e.target.value)})} />
        </div>

        <div className="control-group">
          <label className="control-label">ASPECT_RATIO</label>
          <select value={options.aspectRatio} onChange={e => setOptions({...options, aspectRatio: e.target.value})}>
            <option value="original">ORIGINAL</option>
            <option value="portrait">PORTRAIT (9:16)</option>
            <option value="landscape">LANDSCAPE (16:9)</option>
            <option value="square">SQUARE (1:1)</option>
          </select>
        </div>

        <div className={`control-group toggle-wrapper ${options.focusHumans ? 'active' : ''}`} onClick={() => setOptions({...options, focusHumans: !options.focusHumans})}>
          <div className="toggle-switch"></div>
          <span className="text-sm">FOCUS_HUMAN (AI)</span>
        </div>

        <div className={`control-group toggle-wrapper ${options.isolateSubject ? 'active' : ''}`} onClick={() => setOptions({...options, isolateSubject: !options.isolateSubject})}>
          <div className="toggle-switch"></div>
          <span className="text-sm">ISOLATE_OBJECT (AI) {isIsolating && "..."}</span>
        </div>

        <div className="control-group">
          <label className="control-label">CHAR_SET</label>
          <input type="text" value={options.chars} onChange={e => setOptions({...options, chars: e.target.value})} />
        </div>

        <div className={`control-group toggle-wrapper ${options.invertMapping ? 'active' : ''}`} onClick={() => setOptions({...options, invertMapping: !options.invertMapping})}>
          <div className="toggle-switch"></div>
          <span className="text-sm">INVERT_MAP</span>
        </div>

        <div className="section-title" style={{marginTop: '10px'}}>COLOR_PROFILES</div>
        <div className="control-group">
          <select value={options.colorMode} onChange={e => setOptions({...options, colorMode: e.target.value})}>
            <option value="grayscale">MONOCHROME</option>
            <option value="color">FULL_SPECTRUM</option>
            <option value="single">CUSTOM_SOLID</option>
            <option value="inverted">INVERTED_RGB</option>
          </select>
        </div>

        {options.colorMode === "single" && (
          <div className="control-group">
            <input type="color" value={options.singleColor} onChange={e => setOptions({...options, singleColor: e.target.value})} />
          </div>
        )}

        <div className="section-title" style={{marginTop: '10px'}}>IMAGE_FILTERS</div>
        <div className="control-group">
          <label className="control-label">
            <span>BRIGHTNESS</span>
            <span className="control-value">{options.filters.brightness}%</span>
          </label>
          <input type="range" min="0" max="200" value={options.filters.brightness} onChange={e => setOptions({...options, filters: {...options.filters, brightness: parseInt(e.target.value)}})} />
        </div>
        
        <div className="control-group">
          <label className="control-label">
            <span>CONTRAST</span>
            <span className="control-value">{options.filters.contrast}%</span>
          </label>
          <input type="range" min="0" max="200" value={options.filters.contrast} onChange={e => setOptions({...options, filters: {...options.filters, contrast: parseInt(e.target.value)}})} />
        </div>
        <button className="secondary w-full" style={{marginTop: '8px'}} onClick={() => setOptions({...options, filters: {...options.filters, brightness: 110, contrast: 150}})}>AUTO_ENHANCE</button>

      </aside>

      <main className="main-content dot-grid">
        <div className="flex gap-4" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', justifyContent: 'flex-start', zIndex: 10 }}>
          <div className="flex gap-2">
            <button className="secondary" onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}>-</button>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontFamily: 'var(--font-mono)', minWidth: '50px', justifyContent: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button className="secondary" onClick={() => setZoom(z => Math.min(5, z + 0.2))}>+</button>
          </div>
        </div>
        
        <div className="canvas-container">
          {!imageSrc && !isWebcamActive && (
            <div className="text-muted text-center" style={{ maxWidth: '400px', border: '1px dashed var(--border)', padding: '40px', background: 'var(--surface)' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--primary)' }}>{"<"}AWAITING_INPUT{">"}</div>
              <p style={{fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.8'}}>Initialize webcam feed or upload local image data to commence ASCII processing sequence.</p>
            </div>
          )}
          {isModelLoading && <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.9)', padding: '15px 30px', border: '1px solid var(--secondary-accent)', color: 'var(--secondary-accent)', zIndex: 11, letterSpacing: '2px' }}>INITIALIZING NEURAL_NET...</div>}
          {isProcessing && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.9)', padding: '15px 30px', border: '1px solid var(--primary)', color: 'var(--primary)', zIndex: 10, letterSpacing: '2px' }}>PROCESSING...</div>}
          
          <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
          <canvas ref={sourceCanvasRef} style={{ display: 'none' }} />
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}>
            <canvas ref={targetCanvasRef} className="preview" style={{ display: (imageSrc || isWebcamActive) ? 'block' : 'none' }} />
          </div>
        </div>

        {(imageSrc || isWebcamActive) && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: '16px', justifyContent: 'center', zIndex: 10 }}>
            <button className="secondary" onClick={downloadTxt}>DOWNLOAD .TXT</button>
            <button className="primary" onClick={downloadPng}>DOWNLOAD .PNG</button>
            <button className="primary shadow-glow" onClick={handleShareToGallery} style={{background: 'var(--secondary-accent)', borderColor: 'var(--secondary-accent)', color: 'var(--bg-main)'}}>
              <span style={{marginRight: '8px'}}>🌐</span>
              SHARE IN GALLERY
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
