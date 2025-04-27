import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Compass,
  Crosshair,
  Layers,
  Menu,
  Radio,
  Settings,
  Ship,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Progress } from "./components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

export default function Dashboard() {
  const [showModelDriftAlert, setShowModelDriftAlert] = useState(false);
  const [coordinates, setCoordinates] = useState({
    lat: "32° 42' 54\" N",
    long: "117° 09' 45\" W",
  });
  const [showMetricsPanel, setShowMetricsPanel] = useState(false);

  // Rectangle drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangle, setRectangle] = useState({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });
  const [showRectangle, setShowRectangle] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Background image state
  const [backgroundImage, setBackgroundImage] = useState("/satellite-view.jpg");
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [driftData, setDriftData] = useState(null);
  const [showDriftPopup, setShowDriftPopup] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  const handleNotesChange = (newNotes) => {
    setAreaData((prev) => ({
      ...prev,
      notes: newNotes,
    }));
  };

  // Model performance metrics
  const [metrics, setMetrics] = useState({
    accuracy: 94,
    precision: 92,
    recall: 89,
    driftScore: 18,
    lastUpdated: "22:38:45",
    anomalies: 2,
    predictionLatency: 42,
  });

  // Fake data for the popup
  const [areaData, setAreaData] = useState({
    areaId: "SECTOR-A42",
    threatLevel: "Medium",
    vessels: 3,
    lastScan: "22:45:12",
    anomalies: 1,
    confidence: 87,
    notes: "",
  });

  // Simulated ships with tracking confidence
  const [ships, setShips] = useState([
    { id: 1, x: 40, y: 30, confidence: 96, type: "friendly" },
    { id: 2, x: 60, y: 45, confidence: 94, type: "friendly" },
    { id: 3, x: 25, y: 60, confidence: 72, type: "unknown" },
    { id: 4, x: 75, y: 20, confidence: 88, type: "friendly" },
  ]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setIsLoading(true);

      // Create a URL for the uploaded image to display while processing
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);

      // Create form data to send to the API
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("http://127.0.0.1:8080/detect", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("detection data" + data);

        const driftDetectionResponse = await fetch(
          "http://127.0.0.1:8080/detect_drift",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const driftData = await driftDetectionResponse.json();
        console.log("drift data" + driftData);

        // Check if drift is detected
        if (driftData.is_drift) {
          setDriftData(driftData);
          setShowModelDriftAlert(true);
        }

        // If there's a processed image returned, display it
        if (data.image) {
          setProcessedImage(`data:image/jpeg;base64,${data.image}`);
          setBackgroundImage(`data:image/jpeg;base64,${data.image}`);
        }
      } catch (error) {
        console.error("Error calling YOLO service:", error);
      } finally {
        setIsLoading(false);
        // Reset the file input to allow uploading the same file again
        setFileInputKey((prev) => prev + 1);
      }
    }
  };

  // Simulate model drift detection
  useEffect(() => {
    // Gradually decrease model performance over time
    const driftInterval = setInterval(() => {
      setMetrics((prev) => {
        // Randomly decrease metrics slightly
        const newDriftScore = Math.min(
          100,
          prev.driftScore + Math.random() * 2
        );
        const newAccuracy = Math.max(70, prev.accuracy - Math.random() * 0.5);

        // Update ship confidence levels
        setShips((ships) =>
          ships.map((ship) => ({
            ...ship,
            confidence: Math.max(60, ship.confidence - Math.random() * 1.5),
          }))
        );

        return {
          ...prev,
          accuracy: newAccuracy,
          driftScore: newDriftScore,
          lastUpdated: new Date().toLocaleTimeString("en-US", {
            hour12: false,
          }),
        };
      });
    }, 5000);

    return () => clearInterval(driftInterval);
  }, [showModelDriftAlert]);

  // Handle model retraining
  const handleModelRetrain = () => {
    setShowModelDriftAlert(false);

    // Reset metrics after "retraining"
    setMetrics((prev) => ({
      ...prev,
      accuracy: 98,
      precision: 96,
      recall: 94,
      driftScore: 5,
      lastUpdated: new Date().toLocaleTimeString("en-US", { hour12: false }),
      anomalies: 0,
    }));

    // Reset ship confidence
    setShips((ships) =>
      ships.map((ship) => ({
        ...ship,
        confidence: Math.min(98, ship.confidence + 20),
      }))
    );
  };

  // Toggle the model drift alert for demonstration
  const toggleModelDriftAlert = () => {
    setShowModelDriftAlert(!showModelDriftAlert);
  };

  // Get color based on confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence > 90) return "text-emerald-400";
    if (confidence > 80) return "text-teal-400";
    if (confidence > 70) return "text-blue-400";
    return "text-amber-400";
  };

  // Get color for drift score
  const getDriftScoreColor = (score) => {
    if (score < 10) return "bg-emerald-500";
    if (score < 20) return "bg-blue-500";
    if (score < 30) return "bg-amber-500";
    return "bg-red-500";
  };

  // Get color for threat level
  const getThreatLevelColor = (level) => {
    if (level === "Low") return "text-emerald-400";
    if (level === "Medium") return "text-amber-400";
    if (level === "High") return "text-red-400";
    return "text-blue-400";
  };

  // Handle mouse down for rectangle drawing
  const handleMouseDown = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRectangle({ startX: x, startY: y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  // Handle mouse move for rectangle drawing
  const handleMouseMove = (e) => {
    if (!isDrawing || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRectangle((prev) => ({
      ...prev,
      width: x - prev.startX,
      height: y - prev.startY,
    }));
  };

  // Handle mouse up for rectangle drawing
  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Only show rectangle and popup if it has some size
    if (Math.abs(rectangle.width) > 20 && Math.abs(rectangle.height) > 20) {
      setShowRectangle(true);

      // Position popup near the rectangle
      const popupX =
        rectangle.startX + (rectangle.width > 0 ? rectangle.width : 0);
      const popupY =
        rectangle.startY + (rectangle.height > 0 ? rectangle.height : 0);

      setPopupPosition({ x: popupX, y: popupY });

      // Generate random data for the area
      setAreaData({
        areaId: `SECTOR-${String.fromCharCode(
          65 + Math.floor(Math.random() * 26)
        )}${Math.floor(Math.random() * 100)}`,
        threatLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        vessels: Math.floor(Math.random() * 5) + 1,
        lastScan: new Date().toLocaleTimeString("en-US", { hour12: false }),
        anomalies: Math.floor(Math.random() * 3),
        confidence: Math.floor(Math.random() * 30) + 70,
        notes: [""][Math.floor(Math.random() * 4)],
      });

      setShowPopup(true);
    }
  };

  // Handle mouse leave for rectangle drawing
  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  // Close the popup and reset rectangle
  const handleClosePopup = () => {
    setShowPopup(false);
    setShowRectangle(false);
  };

  const handleCloseDriftPopup = () => {
    setShowDriftPopup(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-300">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">
            NAVAL COMMAND SYSTEM
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 mr-4">
            <div>COORDINATES</div>
            <div className="font-mono">{coordinates.lat}</div>
            <div className="font-mono">{coordinates.long}</div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-300 border-slate-700 hover:bg-slate-700 mr-2"
              onClick={() =>
                document.getElementById("background-upload").click()
              }
            >
              Detect
            </Button>
            <input
              type="file"
              id="background-upload"
              key={fileInputKey}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <Button variant="ghost" size="icon" className="text-slate-300">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-14 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <Ship className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Ship Tracking</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <Compass className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Navigation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <Layers className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Map Layers</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300">
                  <Radio className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Communications</p>
              </TooltipContent>
            </Tooltip>

            <div className="my-2 w-8 bg-slate-700 h-px" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    showMetricsPanel ? "text-teal-400" : "text-slate-300"
                  }`}
                  onClick={() => setShowMetricsPanel(!showMetricsPanel)}
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Model Metrics</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    showModelDriftAlert ? "text-amber-400" : "text-slate-300"
                  }`}
                  onClick={toggleModelDriftAlert}
                >
                  <AlertCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Model Drift Alert</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main Satellite View */}
        <div className="flex-1 relative">
          {/* Satellite Image with loading state */}
          <div
            className="absolute inset-0 bg-slate-950"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            ref={imageRef}
          >
            {/* Using Next.js Image component for better image handling */}
            <div className="absolute inset-0 z-0">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-teal-400"></div>
                    <div className="text-teal-400 text-sm font-mono">
                      PROCESSING IMAGE...
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt="Satellite view"
                  style={{
                    objectFit: "cover",
                    opacity: 0.7,
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-slate-800/20 z-10"></div>
            </div>

            {/* Drawing rectangle */}
            {(isDrawing || showRectangle) && (
              <div
                className="absolute border-2 border-teal-400/70 bg-teal-500/10 z-20"
                style={{
                  left:
                    rectangle.width > 0
                      ? rectangle.startX
                      : rectangle.startX + rectangle.width,
                  top:
                    rectangle.height > 0
                      ? rectangle.startY
                      : rectangle.startY + rectangle.height,
                  width: Math.abs(rectangle.width),
                  height: Math.abs(rectangle.height),
                }}
              >
                {showRectangle && (
                  <div className="absolute top-0 left-0 bg-slate-800/80 text-teal-400 text-xs px-2 py-1 font-mono">
                    {areaData.areaId}
                  </div>
                )}
              </div>
            )}

            {/* Crosshair in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-400/70 z-20">
              <Crosshair className="h-16 w-16" />
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-300 space-y-1 z-20">
              <div>SCAN ACTIVE</div>
              <div>TRACKING: {ships.length} VESSELS</div>
              <div className="flex items-center gap-2">
                <span>MODEL STATUS:</span>
                <span
                  className={
                    metrics.driftScore > 20
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }
                >
                  {metrics.driftScore > 20 ? "DRIFT DETECTED" : "NOMINAL"}
                </span>
              </div>
            </div>

            {/* Coordinates display */}
            <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-300 space-y-1 z-20">
              <div>ZOOM: 2.5x</div>
              <div>SECTOR: PACIFIC-W</div>
              <div>
                TIME:{" "}
                {new Date().toLocaleTimeString("en-US", { hour12: false })} UTC
              </div>
            </div>

            {/* Drawing instructions */}
            <div className="absolute top-4 left-4 text-xs font-mono text-slate-300 bg-slate-800/70 px-3 py-2 rounded z-20">
              CLICK AND DRAG TO SELECT AREA FOR ANALYSIS
            </div>
          </div>

          {/* Model Metrics Panel */}
          {showMetricsPanel && (
            <div className="absolute top-4 right-4 w-80 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md shadow-lg overflow-hidden z-30">
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-sm">
                  MODEL PERFORMANCE METRICS
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowMetricsPanel(false)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <Tabs defaultValue="metrics">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="drift">Drift Analysis</TabsTrigger>
                  </TabsList>
                  <TabsContent value="metrics" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Accuracy</span>
                        <span className={getConfidenceColor(metrics.accuracy)}>
                          {metrics.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.accuracy} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Precision</span>
                        <span className={getConfidenceColor(metrics.precision)}>
                          {metrics.precision.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.precision} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Recall</span>
                        <span className={getConfidenceColor(metrics.recall)}>
                          {metrics.recall.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.recall} className="h-1" />
                    </div>
                    <div className="text-xs text-slate-400 pt-2">
                      <div className="flex justify-between">
                        <span>Prediction Latency:</span>
                        <span>{metrics.predictionLatency} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anomalies Detected:</span>
                        <span>{metrics.anomalies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{metrics.lastUpdated}</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="drift" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Drift Score</span>
                        <span
                          className={
                            metrics.driftScore > 20
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }
                        >
                          {metrics.driftScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getDriftScoreColor(
                            metrics.driftScore
                          )}`}
                          style={{ width: `${metrics.driftScore}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 px-1">
                        <span>Normal</span>
                        <span>Warning</span>
                        <span>Critical</span>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded p-2 text-xs">
                      <div className="font-semibold mb-1">Drift Analysis</div>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        {metrics.driftScore > 20
                          ? "Model performance degradation detected. Recommend retraining with recent data to improve accuracy."
                          : "Model performance within acceptable parameters. Continuous monitoring active."}
                      </p>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400">
                      <div>
                        Baseline Version:{" "}
                        <span className="text-slate-300">v2.4.1</span>
                      </div>
                      <div>
                        Age: <span className="text-slate-300">3d 14h</span>
                      </div>
                    </div>

                    {metrics.driftScore > 20 && (
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-500 text-slate-100"
                        onClick={handleModelRetrain}
                      >
                        Retrain Model
                      </Button>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* Model Drift Alert - Subtle, see-through overlay */}
          {showModelDriftAlert && (
            <div className="absolute bottom-16 right-4 z-30 transition-all duration-500 ease-in-out animate-fade-in">
              <div className="w-72 bg-slate-800/30 backdrop-blur-[2px] border border-slate-700/40 rounded-md shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/50 pointer-events-none"></div>

                <div className="p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400/90 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-slate-100/90">
                          Model drift detected
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 rounded-full p-0 text-slate-400/80 hover:text-slate-100 hover:bg-transparent -mt-1 -mr-1"
                          onClick={() => setShowModelDriftAlert(false)}
                        >
                          <span className="sr-only">Close</span>×
                        </Button>
                      </div>
                      <p className="text-xs text-slate-300/80 mt-0.5">
                        Confirm to set new baseline?
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs border-slate-600/50 hover:bg-slate-700/50 text-slate-300/90 hover:text-slate-100"
                        onClick={() => setShowModelDriftAlert(false)}
                      >
                        No
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs bg-teal-600/70 hover:bg-teal-500/90 text-slate-100/90"
                        onClick={handleModelRetrain}
                      >
                        Yes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drift Detection Popup */}
          {showDriftPopup && driftData && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-96 bg-slate-800/95 backdrop-blur-sm border border-red-500/50 rounded-md shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  DRIFT DETECTED
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCloseDriftPopup}
                >
                  ×
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Distance</span>
                    <span className="text-red-400">
                      {driftData.distance.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (driftData.distance / driftData.distance_threshold) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Threshold</span>
                    <span className="text-amber-400">
                      {driftData.distance_threshold.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (driftData.distance_threshold / driftData.distance) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded p-2 text-xs">
                  <div className="font-semibold mb-1">Drift Analysis</div>
                  <p className="text-slate-300 text-[11px] leading-tight">
                    Significant model drift detected. The current data
                    distribution has deviated from the training distribution.
                    P-value: {driftData.p_value.toFixed(6)} (Threshold:{" "}
                    {driftData.threshold})
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    onClick={handleCloseDriftPopup}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-500 text-slate-100"
                    onClick={handleModelRetrain}
                  >
                    Retrain Model
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Area Analysis Popup */}
          <Dialog open={showPopup} onOpenChange={setShowPopup}>
            <DialogContent className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-teal-400">
                  <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                  Add undected area
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"></div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2"></div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Analysis Notes</div>
                  <textarea
                    className="w-full bg-slate-700/50 p-2 rounded text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                    rows={3}
                    placeholder="Describe the missed detection..."
                    value={areaData.notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    onClick={handleClosePopup}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-500 text-slate-100"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
