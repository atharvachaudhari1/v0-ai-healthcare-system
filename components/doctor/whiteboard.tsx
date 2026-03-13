'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface WhiteboardProps {
  onTranscribe: (imageData: string) => Promise<void>;
  onSave: (imageData: string) => void;
  isTranscribing?: boolean;
}

export default function Whiteboard({ onTranscribe, onSave, isTranscribing = false }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState('#ffffff');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b'; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setContext(ctx);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = lineColor;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.fillStyle = '#1e293b';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleTranscribe = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    await onTranscribe(imageData);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    onSave(imageData);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-4">Digital Whiteboard</h3>

        {/* Tools */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white/5 rounded-lg">
          {/* Line Width */}
          <div>
            <label className="text-sm text-slate-400 block mb-2">Line Width</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm text-slate-400 block mb-2">Color</label>
            <div className="flex gap-2">
              {['#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d'].map((color) => (
                <button
                  key={color}
                  onClick={() => setLineColor(color)}
                  className={`w-8 h-8 rounded border-2 transition ${
                    lineColor === color ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Clear Button */}
          <Button
            onClick={clearCanvas}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10 self-end"
          >
            Clear Canvas
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full border border-white/20 rounded-lg cursor-crosshair bg-slate-800"
        style={{ minHeight: '400px' }}
      />

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={handleTranscribe}
          disabled={isTranscribing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe with Gemini Vision'}
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          className="flex-1 text-white border-white/20 hover:bg-white/10"
        >
          Save Whiteboard
        </Button>
      </div>
    </div>
  );
}
