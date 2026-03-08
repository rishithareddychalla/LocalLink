import { useState, useRef, useEffect, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';
import { getUUID } from '../utils/uuid';

export const useDrawpad = (canvasRef) => {
    const { drawpadStrokes, addStroke, userRoomPreferences } = useRoom();
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState(userRoomPreferences.selectedTheme || '#3B82F6');
    const [brushSize, setBrushSize] = useState(2);
    const [activeTool, setActiveTool] = useState('pencil'); // 'pencil', 'eraser'

    const currentStrokeRef = useRef(null);
    const lastSyncTimeRef = useRef(0);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawpadStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            drawStroke(ctx, stroke);
        });

        // Draw current in-progress stroke if it exists
        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
            drawStroke(ctx, currentStrokeRef.current);
        }
    }, [drawpadStrokes, canvasRef]);

    // Redraw whenever strokes update
    useEffect(() => {
        redraw();
    }, [drawpadStrokes, redraw]);

    // Initialize canvas and handle resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            // Set dimensions to match parent
            const newWidth = parent.clientWidth;
            const newHeight = parent.clientHeight;

            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                redraw();
            }
        };

        // ResizeObserver is more reliable for component-level resizes (like tab switching)
        const resizeObserver = new ResizeObserver(() => {
            // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
            requestAnimationFrame(resizeCanvas);
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        // Initial setup
        resizeCanvas();

        return () => {
            resizeObserver.disconnect();
        };
    }, [canvasRef, redraw]);

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

        // Handle both mouse and touch
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setIsDrawing(true);
        const color = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : brushColor;

        currentStrokeRef.current = {
            id: `stroke-${getUUID()}`,
            userId: 'me',
            type: activeTool,
            points: [{ x, y }],
            color,
            size: activeTool === 'eraser' ? 30 : brushSize
        };

        // Prevent scrolling on touch
        if (e.touches) e.preventDefault();
    };

    const draw = (e) => {
        if (!isDrawing || !currentStrokeRef.current) return;

        // Prevent scrolling on touch
        if (e.cancelable && e.preventDefault) e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            if (!isDrawing || !currentStrokeRef.current) return;

            if (currentStrokeRef.current.type === 'square' || currentStrokeRef.current.type === 'circle') {
                currentStrokeRef.current.points = [currentStrokeRef.current.points[0], { x, y }];
                redraw();
                drawStroke(ctx, currentStrokeRef.current);
            } else {
                const points = currentStrokeRef.current.points;
                const lastPoint = points[points.length - 1];

                // Add the new point
                points.push({ x, y });

                ctx.save();
                ctx.beginPath();
                ctx.globalCompositeOperation = currentStrokeRef.current.type === 'eraser' ? 'destination-out' : 'source-over';
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = currentStrokeRef.current.color;
                ctx.lineWidth = currentStrokeRef.current.size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.restore();
            }

            // Incremental Sync: Send stroke updates every 50ms or every 10 points
            const now = Date.now();
            if (!lastSyncTimeRef.current || now - lastSyncTimeRef.current > 50) {
                addStroke(currentStrokeRef.current);
                lastSyncTimeRef.current = now;
            }
        });
    };

    const stopDrawing = (e) => {
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
