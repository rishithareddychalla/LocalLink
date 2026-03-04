import { useState, useRef, useEffect, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';

export const useDrawpad = (canvasRef) => {
    const { drawpadStrokes, addStroke, userRoomPreferences } = useRoom();
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState(userRoomPreferences.selectedTheme || '#3B82F6');
    const [brushSize, setBrushSize] = useState(2);
    const [activeTool, setActiveTool] = useState('pencil'); // 'pencil', 'eraser'

    const currentStrokeRef = useRef(null);

    // Initialize canvas and handle resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            redraw();
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [canvasRef]);

    // Redraw all strokes when drawpadStrokes change
    useEffect(() => {
        redraw();
    }, [drawpadStrokes]);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawpadStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            drawStroke(ctx, stroke);
        });
    }, [drawpadStrokes]);

    const drawStroke = (ctx, stroke) => {
        ctx.beginPath();
        ctx.globalCompositeOperation = stroke.type === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (stroke.type === 'square') {
            const start = stroke.points[0];
            const end = stroke.points[stroke.points.length - 1];
            ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (stroke.type === 'circle') {
            const start = stroke.points[0];
            const end = stroke.points[stroke.points.length - 1];
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        } else {
            // Pencil or Eraser
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
        }
        ctx.stroke();
        // Reset to default
        ctx.globalCompositeOperation = 'source-over';
    };

    const startDrawing = (e) => {
        if (activeTool === 'select') return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        const color = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : brushColor;

        currentStrokeRef.current = {
            id: `stroke-${Date.now()}`,
            userId: 'me',
            type: activeTool,
            points: [{ x, y }],
            color,
            size: activeTool === 'eraser' ? 30 : brushSize
        };
    };

    const draw = (e) => {
        if (!isDrawing || !currentStrokeRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // For live feedback of shapes, we need to clear and redraw everything
        // But for simplicity, we just add the point. 
        // For 'square' and 'circle', we only want two points (start and current).
        if (currentStrokeRef.current.type === 'square' || currentStrokeRef.current.type === 'circle') {
            currentStrokeRef.current.points = [currentStrokeRef.current.points[0], { x, y }];
            redraw();
            // Also draw the current (in-progress) stroke
            drawStroke(ctx, currentStrokeRef.current);
        } else {
            const lastPoint = currentStrokeRef.current.points[currentStrokeRef.current.points.length - 1];
            ctx.beginPath();
            ctx.globalCompositeOperation = currentStrokeRef.current.type === 'eraser' ? 'destination-out' : 'source-over';
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = currentStrokeRef.current.color;
            ctx.lineWidth = currentStrokeRef.current.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            currentStrokeRef.current.points.push({ x, y });
            // Reset to default
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || !currentStrokeRef.current) return;
        setIsDrawing(false);

        if (currentStrokeRef.current.points.length > 1) {
            addStroke(currentStrokeRef.current);
        }
        currentStrokeRef.current = null;
    };

    const exportToImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL('image/png');
    };

    return {
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        activeTool,
        setActiveTool,
        startDrawing,
        draw,
        stopDrawing,
        exportToImage
    };
};
