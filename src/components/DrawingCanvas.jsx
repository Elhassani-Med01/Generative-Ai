// src/components/DrawingCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Pencil, Trash2, Download, Palette as ColorPaletteIcon } from 'lucide-react';

const DrawingCanvas = ({
  width = 768, // Larger default
  height = 768,
  initialImage = null,
  onDrawingComplete,
  mode = 'drawing'
}) => {
  const canvasRef = useRef(null); // Main canvas for drawing mask or sketch
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(mode === 'inpainting' ? 30 : 10);
  const [brushColor, setBrushColor] = useState(mode === 'inpainting' ? '#FFFFFF' : '#000000'); // White for mask, black for sketch
  const [canvasMode, setCanvasMode] = useState('pen'); // 'pen' or 'eraser'
  const [showMaskOverlay, setShowMaskOverlay] = useState(true);

  // Function to get the mask (B&W) from the current drawing on the canvas
  const getMaskDataURL = useCallback(() => {
    if (!canvasRef.current) return null;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Make the mask canvas black initially
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the current canvas (which has transparent areas where initial image shows)
    // onto the temp canvas. White drawn lines will become white on black.
    // This assumes user draws mask in white.
    tempCtx.drawImage(canvasRef.current, 0, 0);
    return tempCanvas.toDataURL('image/png');
  }, []);


  const triggerDrawingComplete = useCallback(() => {
    if (onDrawingComplete && canvasRef.current) {
      if (mode === 'inpainting' && initialImage) { // Need original image for inpainting
        onDrawingComplete({
          original: initialImage, // Pass the original base64 string directly
          mask: getMaskDataURL()   // Get the processed B&W mask
        });
      } else if (mode === 'drawing') {
        // For drawing, just the content of the canvas as sketch
        onDrawingComplete({
          sketch: canvasRef.current.toDataURL('image/png')
        });
      }
    }
  }, [onDrawingComplete, mode, initialImage, getMaskDataURL]);


  // Initialize or re-initialize canvas when props change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Set initial background or image
    if (mode === 'inpainting') {
      if (initialImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          context.drawImage(img, 0, 0, width, height); // Draw base image onto the canvas
        };
        img.onerror = (e) => {
            console.error("Error loading initial image for inpainting:", e);
            context.fillStyle = '#CCCCCC'; // Fallback grey background
            context.fillRect(0,0,width,height);
        }
        img.src = initialImage;
      } else {
        // If no initial image for inpainting, provide a placeholder background
        context.fillStyle = '#4A5568'; // Dark gray placeholder
        context.fillRect(0, 0, width, height);
        const placeholderText = "Téléchargez une image pour l'inpainting";
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText(placeholderText, width / 2, height / 2);
      }
      setBrushColor('#FFFFFF'); // Default to white brush for drawing mask
    } else { // 'drawing' mode (sketch)
      context.fillStyle = '#FFFFFF'; // White background for sketching
      context.fillRect(0, 0, width, height);
      if (initialImage) { // If there's an initial image to trace for sketching
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { context.drawImage(img, 0, 0, width, height); };
        img.src = initialImage;
      }
      setBrushColor('#000000'); // Default to black brush for sketching
    }
  }, [width, height, initialImage, mode]); // Rerun if these change

  // Update brush properties
  useEffect(() => {
    if (contextRef.current) {
      const context = contextRef.current;
      context.lineWidth = brushSize;
      if (mode === 'inpainting') {
        // For inpainting: pen draws white (adds to mask), eraser draws the original image back (removes from mask)
        // This requires a more complex eraser logic to "reveal" the underlying base image.
        // Simpler approach for now: eraser effectively does nothing or draws transparent (destination-out)
        // if we want to keep the mask strictly B&W, eraser should draw black.
        // For now, pen draws white, eraser uses destination-out on the drawn mask layer.
        // This drawing canvas directly modifies the base image for visual feedback.
        // The actual "mask" is derived by comparing current state to original.
        // For this simplified version: pen draws white, eraser uses destination-out on the overlay.
        // The getMaskDataURL needs to interpret this. Let's stick to: pen = white, eraser = destination-out for mask on transparent layer.
        // The `initialImage` is drawn once. Mask is drawn on top.
        // So `getMaskDataURL` needs to create a B&W image.
        context.strokeStyle = canvasMode === 'pen' ? '#FFFFFF' : '#000000'; // Pen is white for mask
        context.globalCompositeOperation = canvasMode === 'pen' ? 'source-over' : 'destination-out';
      } else { // drawing mode
        context.strokeStyle = brushColor;
        context.globalCompositeOperation = canvasMode === 'pen' ? 'source-over' : 'destination-out';
      }
    }
  }, [brushSize, brushColor, canvasMode, mode]);

  const getCoords = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const startDrawing = useCallback((nativeEvent) => {
    nativeEvent.preventDefault(); // Prevent page scroll on touch
    const { offsetX, offsetY } = getCoords(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  }, []);

  const draw = useCallback((nativeEvent) => {
    if (!isDrawing) return;
    nativeEvent.preventDefault();
    const { offsetX, offsetY } = getCoords(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  }, [isDrawing]);

  const endDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      contextRef.current.closePath();
      triggerDrawingComplete();
    }
  }, [isDrawing, triggerDrawingComplete]);

  const clearActiveCanvasDrawing = useCallback(() => { // Renamed to avoid conflict
    if (contextRef.current && canvasRef.current) {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear drawings

      // Re-apply initial state
      if (mode === 'inpainting') {
        if (initialImage) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => { context.drawImage(img, 0, 0, canvas.width, canvas.height); };
          img.src = initialImage;
        } else {
          context.fillStyle = '#4A5568'; context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = 'white'; context.font = '16px Arial'; context.textAlign = 'center';
          context.fillText("Téléchargez une image", canvas.width / 2, canvas.height / 2);
        }
      } else { // drawing mode
        context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, canvas.width, canvas.height);
          if (initialImage) {
            const img = new Image(); img.crossOrigin = "anonymous";
            img.onload = () => { context.drawImage(img, 0, 0, width, height); };
            img.src = initialImage;
          }
      }
      triggerDrawingComplete(); // Update parent that canvas is now 'empty' (or back to initial)
    }
  }, [mode, initialImage, width, height, triggerDrawingComplete]);

  const downloadCanvasImage = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      if (mode === 'inpainting' && initialImage) {
        // Download the derived B&W mask
        const maskUrl = getMaskDataURL();
        if (maskUrl) {
            link.download = `inpainting_mask.png`;
            link.href = maskUrl;
            link.click();
        }
        // Optionally download the base image separately
        // const baseLink = document.createElement('a');
        // baseLink.download = `inpainting_base.png`;
        // baseLink.href = initialImage; // Assuming initialImage is a dataURL
        // baseLink.click();
      } else { // Sketch mode
        link.download = `sketch.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }
    }
  }, [mode, initialImage, getMaskDataURL]);

  // Draw mask overlay for inpainting
  useEffect(() => {
    if (mode === 'inpainting' && showMaskOverlay && canvasRef.current) {
      // Optionally, draw a semi-transparent overlay to visualize the mask
      // This is a visual aid, not affecting the mask data
      const ctx = canvasRef.current.getContext('2d');
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }, [showMaskOverlay, mode, width, height]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-800 rounded-md items-center justify-center sm:justify-start">
        <button onClick={() => setCanvasMode('pen')} className={`p-2 rounded-md ${canvasMode === 'pen' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} title={mode === 'inpainting' ? "Dessiner Masque (Blanc)" : "Pinceau"}> <Pencil className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
        <button onClick={() => setCanvasMode('eraser')} className={`p-2 rounded-md ${canvasMode === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} title={mode === 'inpainting' ? "Gommer Masque" : "Gomme"}> <Eraser className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
        <div className="flex items-center space-x-1">
          <label htmlFor="brushSizeRange" className="text-xs text-gray-400">Taille:</label>
          <input id="brushSizeRange" type="range" min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" title={`Taille Pinceau: ${brushSize}`} />
          <span className="text-xs text-gray-300">{brushSize}</span>
        </div>
        {mode === 'drawing' && canvasMode === 'pen' && (
          <div className="relative flex items-center">
            <label htmlFor="brushColorPicker" className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer" title="Couleur Pinceau">
              <ColorPaletteIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: brushColor }} />
            </label>
            <input id="brushColorPicker" type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="absolute opacity-0 w-0 h-0" />
          </div>
        )}
        <button onClick={clearActiveCanvasDrawing} className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Effacer Dessin">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {mode === 'inpainting' && (
          <button onClick={() => setShowMaskOverlay(v => !v)} className="p-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700" title="Afficher/Masquer l'overlay du masque">
            {showMaskOverlay ? "Masquer Overlay" : "Afficher Overlay"}
          </button>
        )}
        <button onClick={downloadCanvasImage} className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" title="Télécharger Dessin">
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="border-2 border-purple-500 rounded-lg cursor-crosshair bg-gray-900"
          style={{ width: `${width}px`, height: `${height}px`, touchAction: 'none' }}
        ></canvas>
      </div>
    </div>
  );
};

export default DrawingCanvas;

// ComfyUIWrapper.jsx (already present)
const handleDrawingComplete = (data) => {
  if (activeWorkflow === 'inpaint') {
    if (data && data.original && data.mask) {
      setOriginalImageForInpaintDataUrl(data.original);
      setDrawnMaskForInpaintDataUrl(data.mask);
    }
  }
  // ...
};