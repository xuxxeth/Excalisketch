"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Aperture,
  BookOpen,
  Circle,
  Download,
  FileDown,
  FolderOpen,
  Grid2X2,
  HelpCircle,
  Image as ImageIcon,
  MonitorUp,
  MoreHorizontal,
  PencilRuler,
  Play,
  RotateCcw,
  Settings,
  Square,
  StickyNote,
  X,
} from "lucide-react";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((m) => m.Excalidraw), {
  ssr: false,
});

type AspectOption = {
  id: string;
  label: string;
  subtitle: string;
  ratio: number;
};

type BackgroundOption = {
  id: string;
  label: string;
  css: string;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
};

const ASPECTS: AspectOption[] = [
  { id: "16:9", label: "16:9", subtitle: "YouTube", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", subtitle: "Classic", ratio: 4 / 3 },
  { id: "3:4", label: "3:4", subtitle: "RedNote", ratio: 3 / 4 },
  { id: "9:16", label: "9:16", subtitle: "TikTok", ratio: 9 / 16 },
  { id: "1:1", label: "1:1", subtitle: "Square", ratio: 1 },
  { id: "custom", label: "Custom", subtitle: "Your size", ratio: 16 / 9 },
];

const BACKGROUNDS: BackgroundOption[] = [
  {
    id: "mint",
    label: "Mint",
    css: "linear-gradient(135deg, #f6f8ff 0%, #c7f9e9 48%, #f8d9ff 100%)",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#f6f8ff");
      g.addColorStop(0.48, "#c7f9e9");
      g.addColorStop(1, "#f8d9ff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    css: "linear-gradient(135deg, #fff2e6 0%, #ff99bb 50%, #6b8cff 100%)",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(w, 0, 0, h);
      g.addColorStop(0, "#fff2e6");
      g.addColorStop(0.5, "#ff99bb");
      g.addColorStop(1, "#6b8cff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    css: "linear-gradient(135deg, #06294c 0%, #00b3b8 45%, #c2f970 100%)",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, h, w, 0);
      g.addColorStop(0, "#06294c");
      g.addColorStop(0.45, "#00b3b8");
      g.addColorStop(1, "#c2f970");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "blush",
    label: "Blush",
    css: "linear-gradient(135deg, #fde2e4 0%, #e2f0ff 50%, #d0f4de 100%)",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#fde2e4");
      g.addColorStop(0.5, "#e2f0ff");
      g.addColorStop(1, "#d0f4de");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "paper",
    label: "Paper",
    css: "linear-gradient(135deg, #ffffff 0%, #f4f1ec 100%)",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(1, "#f4f1ec");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
];

const CURSOR_COLORS = ["#ff4d4f", "#ff8f1f", "#ffcc00", "#2cc56f", "#2f7cff", "#8b5cf6", "#f43f5e"];

function getRecordingSize(aspect: AspectOption, customWidth: number, customHeight: number) {
  if (aspect.id === "custom") {
    return {
      width: Math.max(480, Math.min(1920, Math.round(customWidth))),
      height: Math.max(360, Math.min(1920, Math.round(customHeight))),
    };
  }
  const base = 1280;
  if (aspect.ratio >= 1) {
    return { width: base, height: Math.round(base / aspect.ratio) };
  }
  return { width: Math.round(base * aspect.ratio), height: base };
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const recordCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const drawLoopRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");

  const [aspectId, setAspectId] = useState("16:9");
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [backgroundId, setBackgroundId] = useState("mint");

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraSize, setCameraSize] = useState(180);
  const [cameraRadius, setCameraRadius] = useState(999);
  const [canvasPadding, setCanvasPadding] = useState(80);
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [cursorColor, setCursorColor] = useState(CURSOR_COLORS[0]);

  const [cameraPos, setCameraPos] = useState({ x: 120, y: 220 });
  const cameraPosRef = useRef(cameraPos);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const cursorPosRef = useRef(cursorPos);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("");

  const aspect = useMemo(() => ASPECTS.find((item) => item.id === aspectId) ?? ASPECTS[0], [aspectId]);
  const background = useMemo(() => BACKGROUNDS.find((item) => item.id === backgroundId) ?? BACKGROUNDS[0], [backgroundId]);

  useEffect(() => {
    cameraPosRef.current = cameraPos;
  }, [cameraPos]);

  useEffect(() => {
    cursorPosRef.current = cursorPos;
  }, [cursorPos]);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        setRecordingStatus("Camera permission denied.");
      }
    }
    enableCamera();
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nextX = event.clientX - rect.left - dragOffsetRef.current.x;
      const nextY = event.clientY - rect.top - dragOffsetRef.current.y;
      const maxX = rect.width - cameraSize;
      const maxY = rect.height - cameraSize;
      setCameraPos({
        x: Math.max(0, Math.min(maxX, nextX)),
        y: Math.max(0, Math.min(maxY, nextY)),
      });
    }

    function onUp() {
      draggingRef.current = false;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [cameraSize]);

  const handleCameraPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    draggingRef.current = true;
    dragOffsetRef.current = {
      x: event.clientX - rect.left - cameraPosRef.current.x,
      y: event.clientY - rect.top - cameraPosRef.current.y,
    };
  };

  const handleCursorMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const getExcalidrawCanvas = () => {
    return (
      document.querySelector("canvas.excalidraw__canvas.interactive") ||
      document.querySelector("canvas.excalidraw__canvas")
    ) as HTMLCanvasElement | null;
  };

  const startRecording = async () => {
    if (isRecording) return;
    const excalidrawCanvas = getExcalidrawCanvas();
    const recordCanvas = recordCanvasRef.current;
    const container = containerRef.current;
    if (!excalidrawCanvas || !recordCanvas || !container) {
      setRecordingStatus("Canvas is not ready.");
      return;
    }

    const { width, height } = getRecordingSize(aspect, customWidth, customHeight);
    recordCanvas.width = width;
    recordCanvas.height = height;

    const stream = recordCanvas.captureStream(30);
    const audioTracks = mediaStreamRef.current?.getAudioTracks() ?? [];
    audioTracks.forEach((track) => stream.addTrack(track));

    chunksRef.current = [];
    setRecordingUrl(null);
    setRecordingStatus("Recording...");

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordingUrl(url);
      setRecordingStatus("Recording ready.");
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);

    const draw = () => {
      const ctx = recordCanvas.getContext("2d");
      if (!ctx) return;

      background.draw(ctx, width, height);

      const padding = Math.max(0, canvasPadding);
      const targetWidth = width - padding * 2;
      const targetHeight = height - padding * 2;
      const scale = Math.min(targetWidth / excalidrawCanvas.width, targetHeight / excalidrawCanvas.height);
      const drawWidth = excalidrawCanvas.width * scale;
      const drawHeight = excalidrawCanvas.height * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;
      ctx.drawImage(excalidrawCanvas, offsetX, offsetY, drawWidth, drawHeight);

      if (cameraEnabled && videoRef.current && videoRef.current.readyState >= 2) {
        const rect = container.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const bubbleSize = cameraSize * Math.min(scaleX, scaleY);
        const bubbleX = cameraPosRef.current.x * scaleX;
        const bubbleY = cameraPosRef.current.y * scaleY;
        ctx.save();
        drawRoundedRect(ctx, bubbleX, bubbleY, bubbleSize, bubbleSize, cameraRadius);
        ctx.clip();
        ctx.drawImage(videoRef.current, bubbleX, bubbleY, bubbleSize, bubbleSize);
        ctx.restore();
      }

      if (cursorEnabled && cursorPosRef.current) {
        const rect = container.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const cursorX = cursorPosRef.current.x * scaleX;
        const cursorY = cursorPosRef.current.y * scaleY;
        ctx.beginPath();
        ctx.fillStyle = `${cursorColor}40`;
        ctx.strokeStyle = cursorColor;
        ctx.lineWidth = 4;
        ctx.arc(cursorX, cursorY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      drawLoopRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    if (drawLoopRef.current) {
      cancelAnimationFrame(drawLoopRef.current);
      drawLoopRef.current = null;
    }
    setIsRecording(false);
    setRecordingStatus("Processing...");
  };

  const recordingSize = getRecordingSize(aspect, customWidth, customHeight);

  return (
    <TooltipProvider>
      <div className="relative h-screen w-full overflow-hidden bg-[#f7f7f5]">
        <div
          ref={containerRef}
          className="absolute inset-0"
          onPointerMove={handleCursorMove}
          style={{ background: background.css }}
        >
          <Excalidraw
            initialData={{
              appState: {
                viewBackgroundColor: "transparent",
              },
            }}
          />
        </div>

        {cursorEnabled && cursorPos && (
          <div
            className="pointer-events-none absolute z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-60"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              borderColor: cursorColor,
              backgroundColor: `${cursorColor}22`,
            }}
          />
        )}

        {cameraEnabled && (
          <div
            className="absolute z-40 overflow-hidden border border-white/70 bg-black/10 shadow-lg"
            style={{
              left: cameraPos.x,
              top: cameraPos.y,
              width: cameraSize,
              height: cameraSize,
              borderRadius: Math.min(cameraRadius, cameraSize / 2),
            }}
            onPointerDown={handleCameraPointerDown}
          >
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1 text-white/80">
              <Grid2X2 className="h-4 w-4" />
            </div>
          </div>
        )}

        <div className="absolute right-6 top-6 z-50 flex items-center gap-2 rounded-2xl bg-white/90 p-2 shadow-lg backdrop-blur">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showTeleprompter ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowTeleprompter((prev) => !prev)}
              >
                <StickyNote className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Teleprompter</TooltipContent>
          </Tooltip>
          <Button
            className="gap-2 rounded-xl px-5 font-semibold"
            variant={isRecording ? "secondary" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4 fill-red-500 text-red-500" />}
            {isRecording ? "Stop" : "Record"}
          </Button>
        </div>

        {showTeleprompter && (
          <Card className="absolute right-6 top-24 z-40 w-80 border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teleprompter
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowTeleprompter(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Paste your script here..."
              className="h-56 resize-none text-sm"
              value={teleprompterText}
              onChange={(event) => setTeleprompterText(event.target.value)}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              This text is only visible to you and will not appear in the recording.
            </p>
          </Card>
        )}

        <div className="absolute left-6 top-6 z-40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FileDown className="h-4 w-4" />
                Save to...
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Export image...
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <PencilRuler className="h-4 w-4" />
                Find on canvas
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset the canvas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-5 left-6 z-40 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-sm shadow-lg backdrop-blur">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <span className="text-lg">-</span>
          </Button>
          <span className="text-xs text-muted-foreground">100%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <span className="text-lg">+</span>
          </Button>
        </div>

        <Card className="absolute bottom-6 right-6 z-40 w-64 border-white/70 bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recording output</span>
            <span className="font-semibold">
              {recordingSize.width}x{recordingSize.height}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <MonitorUp className="h-4 w-4" />
            {recordingStatus || "Ready"}
          </div>
          {recordingUrl && (
            <Button asChild className="mt-3 w-full gap-2" variant="secondary">
              <a href={recordingUrl} download="excalicord-recording.webm">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </Card>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Recording Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-8">
              <div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Aspect ratio
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {ASPECTS.map((option) => (
                    <Button
                      key={option.id}
                      variant={option.id === aspectId ? "default" : "outline"}
                      className="flex h-20 flex-col items-center justify-center gap-1"
                      onClick={() => setAspectId(option.id)}
                    >
                      <span className="text-lg font-semibold">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.subtitle}</span>
                    </Button>
                  ))}
                </div>
                {aspectId === "custom" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">Width</span>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(event) => setCustomWidth(Number(event.target.value))}
                        className="w-32"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">Height</span>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(event) => setCustomHeight(Number(event.target.value))}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Background
                </div>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="vibrant">Vibrant</TabsTrigger>
                    <TabsTrigger value="pastel">Pastel</TabsTrigger>
                    <TabsTrigger value="dark">Dark</TabsTrigger>
                    <TabsTrigger value="nature">Nature</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {BACKGROUNDS.map((item) => (
                    <button
                      key={item.id}
                      className={`relative h-28 w-full rounded-2xl border transition ${
                        item.id === backgroundId ? "border-black/70 ring-2 ring-black/30" : "border-transparent"
                      }`}
                      style={{ background: item.css }}
                      onClick={() => setBackgroundId(item.id)}
                      type="button"
                    >
                      {item.id === backgroundId && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-white p-1">
                          <Circle className="h-4 w-4 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Button className="mt-4 w-full" variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Pick random wallpaper
                </Button>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Corner radius: {cameraRadius}px
                  </div>
                  <Slider
                    value={[cameraRadius]}
                    max={64}
                    min={0}
                    step={1}
                    onValueChange={(value) => setCameraRadius(value[0] ?? 0)}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sharp</span>
                    <span>Rounded</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Camera
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show camera bubble in recording</span>
                    <Switch checked={cameraEnabled} onCheckedChange={setCameraEnabled} />
                  </div>
                  <div className="text-xs text-muted-foreground">Size: {cameraSize}px</div>
                  <Slider
                    value={[cameraSize]}
                    min={120}
                    max={280}
                    step={1}
                    onValueChange={(value) => setCameraSize(value[0] ?? 180)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Canvas padding: {canvasPadding}px
                  </div>
                  <Slider
                    value={[canvasPadding]}
                    min={0}
                    max={160}
                    step={2}
                    onValueChange={(value) => setCanvasPadding(value[0] ?? 80)}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>None</span>
                    <span>Large</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Mouse cursor effect
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show cursor highlight in recording</span>
                    <Switch checked={cursorEnabled} onCheckedChange={setCursorEnabled} />
                  </div>
                  <div className="flex items-center gap-2">
                    {CURSOR_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`h-7 w-7 rounded-full border-2 ${cursorColor === color ? "border-black" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCursorColor(color)}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Button variant="outline" className="flex-1">
                  <Aperture className="mr-2 h-4 w-4" />
                  Sign in with Google
                </Button>
                <Button variant="secondary" className="flex-1">
                  Remove watermark — $20 once
                </Button>
              </div>
              <Button onClick={() => setShowSettings(false)} className="w-full">
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <canvas ref={recordCanvasRef} className="hidden" />
      </div>
    </TooltipProvider>
  );
}
