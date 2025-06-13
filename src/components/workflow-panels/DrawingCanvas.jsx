import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Pencil, Trash2, Download } from 'lucide-react';

const DrawingCanvas = ({
  width = 512,
  height = 512,
  initialImage = null, // base64 or URL for initial image
  onDrawingComplete, // callback to get the drawn image data URL
  mode = 'drawing' // 'drawing' or 'inpainting'
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000'); // Default for drawing
  const [canvasMode, setCanvasMode] = useState('pen'); // 'pen' or 'eraser'

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions explicitly for high-DPI screens
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
    context.strokeStyle = brushColor;
    contextRef.current = context;

    // Load initial image if provided
    if (initialImage) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Essential for drawing loaded images (CORS issues)
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear existing before drawing
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // If inpainting mode, ensure the background remains for drawing on top.
        // For drawing, if we want a clear background, we might fill it first.
        if (mode === 'drawing' && !initialImage) { // For drawing, ensure clear canvas if no initial image
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        updateDrawing();
      };
      img.onerror = (e) => {
          console.error("Error loading initial image to canvas:", e);
          // Fallback to clear canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          if (mode === 'drawing') {
            context.fillStyle = '#FFFFFF'; // White background for drawing
            context.fillRect(0, 0, canvas.width, canvas.height);
          }
          updateDrawing();
      }
      img.src = initialImage;
    } else {
        // Ensure canvas is clear and has a background (white for drawing, transparent for inpainting mask)
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (mode === 'drawing') {
            context.fillStyle = '#FFFFFF'; // Default white background for free drawing
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
  }, [width, height, initialImage, mode]); // Re-run if dimensions or initial image changes

  // Update brush settings when state changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
      contextRef.current.strokeStyle = canvasMode === 'pen' ? brushColor : 'rgba(0,0,0,1)'; // Eraser color
      contextRef.current.globalCompositeOperation = canvasMode === 'pen' ? 'source-over' : 'destination-out';
    }
  }, [brushSize, brushColor, canvasMode]);

  const startDrawing = useCallback(({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  }, [isDrawing]);

  const endDrawing = useCallback(() => {
    setIsDrawing(false);
    contextRef.current.closePath();
    updateDrawing(); // Call callback when drawing is complete
  }, [updateDrawing]);

  const updateDrawing = useCallback(() => {
    if (onDrawingComplete && canvasRef.current) {
      // Export as PNG to preserve transparency for inpainting
      onDrawingComplete(canvasRef.current.toDataURL('image/png'));
    }
  }, [onDrawingComplete]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === 'drawing') {
        context.fillStyle = '#FFFFFF'; // Reset to white background for drawing mode
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      updateDrawing();
    }
  }, [mode, updateDrawing]);

  const downloadCanvas = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${mode === 'drawing' ? 'sketch' : 'inpainted'}_image.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  }, [mode]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-2 items-center">
        <button
          onClick={() => setCanvasMode('pen')}
          className={`p-2 rounded-md ${canvasMode === 'pen' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          title="Pen Tool"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCanvasMode('eraser')}
          className={`p-2 rounded-md ${canvasMode === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          title="Eraser Tool"
        >
          <Eraser className="w-5 h-5" />
        </button>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          title={`Brush Size: ${brushSize}`}
        />
        {canvasMode === 'pen' && (
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 rounded-full border border-gray-600 cursor-pointer"
            title="Brush Color"
          />
        )}
        <button
          onClick={clearCanvas}
          className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={downloadCanvas}
          className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          title="Download Canvas"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing} // Stop drawing if mouse leaves canvas
        className="border-2 border-gray-600 rounded-lg bg-gray-900 cursor-crosshair"
        style={{ width: `${width}px`, height: `${height}px`, touchAction: 'none' }} // Prevent scrolling on touch
      ></canvas>
    </div>
  );
};

export default DrawingCanvas;