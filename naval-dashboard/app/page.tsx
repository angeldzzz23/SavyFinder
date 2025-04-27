"use client"

import { useEffect, useState } from "react"
import { AlertCircle, BarChart3, Compass, Crosshair, Layers, Menu, Radio, Settings, Ship } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Dashboard() {
  const [showModelDriftAlert, setShowModelDriftAlert] = useState(false)
  const [coordinates, setCoordinates] = useState({ lat: "32° 42' 54\" N", long: "117° 09' 45\" W" })
  const [showMetricsPanel, setShowMetricsPanel] = useState(false)

  // Model performance metrics
  const [metrics, setMetrics] = useState({
    accuracy: 94,
    precision: 92,
    recall: 89,
    driftScore: 18,
    lastUpdated: "22:38:45",
    anomalies: 2,
    predictionLatency: 42,
  })

  // Simulated ships with tracking confidence
  const [ships, setShips] = useState([
    { id: 1, x: 40, y: 30, confidence: 96, type: "friendly" },
    { id: 2, x: 60, y: 45, confidence: 94, type: "friendly" },
    { id: 3, x: 25, y: 60, confidence: 72, type: "unknown" },
    { id: 4, x: 75, y: 20, confidence: 88, type: "friendly" },
  ])

  // Simulate model drift detection
  useEffect(() => {
    // Gradually decrease model performance over time
    const driftInterval = setInterval(() => {
      setMetrics((prev) => {
        // Randomly decrease metrics slightly
        const newDriftScore = Math.min(100, prev.driftScore + Math.random() * 2)
        const newAccuracy = Math.max(70, prev.accuracy - Math.random() * 0.5)

        // Update ship confidence levels
        setShips((ships) =>
          ships.map((ship) => ({
            ...ship,
            confidence: Math.max(60, ship.confidence - Math.random() * 1.5),
          })),
        )

        // Trigger alert when drift score exceeds threshold
        if (newDriftScore > 25 && !showModelDriftAlert) {
          setShowModelDriftAlert(true)
        }

        return {
          ...prev,
          accuracy: newAccuracy,
          driftScore: newDriftScore,
          lastUpdated: new Date().toLocaleTimeString("en-US", { hour12: false }),
        }
      })
    }, 5000)

    return () => clearInterval(driftInterval)
  }, [showModelDriftAlert])

  // Handle model retraining
  const handleModelRetrain = () => {
    setShowModelDriftAlert(false)

    // Reset metrics after "retraining"
    setMetrics((prev) => ({
      ...prev,
      accuracy: 98,
      precision: 96,
      recall: 94,
      driftScore: 5,
      lastUpdated: new Date().toLocaleTimeString("en-US", { hour12: false }),
      anomalies: 0,
    }))

    // Reset ship confidence
    setShips((ships) =>
      ships.map((ship) => ({
        ...ship,
        confidence: Math.min(98, ship.confidence + 20),
      })),
    )
  }

  // Toggle the model drift alert for demonstration
  const toggleModelDriftAlert = () => {
    setShowModelDriftAlert(!showModelDriftAlert)
  }

  // Get color based on confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence > 90) return "text-emerald-400"
    if (confidence > 80) return "text-teal-400"
    if (confidence > 70) return "text-blue-400"
    return "text-amber-400"
  }

  // Get color for drift score
  const getDriftScoreColor = (score) => {
    if (score < 10) return "bg-emerald-500"
    if (score < 20) return "bg-blue-500"
    if (score < 30) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-300">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">NAVAL COMMAND SYSTEM</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 mr-4">
            <div>COORDINATES</div>
            <div className="font-mono">{coordinates.lat}</div>
            <div className="font-mono">{coordinates.long}</div>
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

            <Separator className="my-2 w-8 bg-slate-700" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${showMetricsPanel ? "text-teal-400" : "text-slate-300"}`}
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
                  className={`${showModelDriftAlert ? "text-amber-400" : "text-slate-300"}`}
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
          {/* Satellite Image (70% of screen) */}
          <div className="absolute inset-0 bg-slate-950">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-70">
              {/* Overlay grid pattern for military aesthetic */}
              <div className="absolute inset-0 bg-grid-slate-800/20"></div>
            </div>

            {/* Crosshair in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-400/70">
              <Crosshair className="h-16 w-16" />
            </div>

            {/* Ship markers with confidence indicators */}
            {ships.map((ship) => (
              <div
                key={ship.id}
                className="absolute flex flex-col items-center"
                style={{
                  top: `${ship.y}%`,
                  left: `${ship.x}%`,
                }}
              >
                <div
                  className={`h-2 w-2 ${ship.type === "friendly" ? "bg-teal-400" : "bg-amber-400"} rounded-full`}
                ></div>
                <div className={`text-xs font-mono mt-1 ${getConfidenceColor(ship.confidence)}`}>
                  {ship.confidence.toFixed(0)}%
                </div>
                {/* Confidence ring */}
                <div
                  className={`absolute -top-3 -left-3 w-8 h-8 rounded-full border ${getConfidenceColor(ship.confidence)} opacity-30`}
                  style={{
                    animation: "pulse 2s infinite",
                  }}
                ></div>
              </div>
            ))}

            {/* Radar sweep animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
              <div className="absolute inset-0 rounded-full border border-teal-500/20"></div>
              <div className="absolute inset-0 rounded-full border border-teal-500/10"></div>
              <div
                className="absolute top-1/2 left-1/2 h-[50%] w-1 bg-gradient-to-t from-teal-500/60 to-transparent origin-bottom"
                style={{
                  transform: "rotate(0deg) translateX(-50%)",
                  animation: "radar-sweep 8s linear infinite",
                }}
              ></div>
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-300 space-y-1">
              <div>SCAN ACTIVE</div>
              <div>TRACKING: {ships.length} VESSELS</div>
              <div className="flex items-center gap-2">
                <span>MODEL STATUS:</span>
                <span className={metrics.driftScore > 20 ? "text-amber-400" : "text-emerald-400"}>
                  {metrics.driftScore > 20 ? "DRIFT DETECTED" : "NOMINAL"}
                </span>
              </div>
            </div>

            {/* Coordinates display */}
            <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-300 space-y-1">
              <div>ZOOM: 2.5x</div>
              <div>SECTOR: PACIFIC-W</div>
              <div>TIME: {new Date().toLocaleTimeString("en-US", { hour12: false })} UTC</div>
            </div>
          </div>

          {/* Model Metrics Panel */}
          {showMetricsPanel && (
            <div className="absolute top-4 right-4 w-80 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-md shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-sm">MODEL PERFORMANCE METRICS</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMetricsPanel(false)}>
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
                        <span className={getConfidenceColor(metrics.accuracy)}>{metrics.accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.accuracy} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Precision</span>
                        <span className={getConfidenceColor(metrics.precision)}>{metrics.precision.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.precision} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Recall</span>
                        <span className={getConfidenceColor(metrics.recall)}>{metrics.recall.toFixed(1)}%</span>
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
                        <span className={metrics.driftScore > 20 ? "text-amber-400" : "text-emerald-400"}>
                          {metrics.driftScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getDriftScoreColor(metrics.driftScore)}`}
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
                        Baseline Version: <span className="text-slate-300">v2.4.1</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5"></div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/50"></div>

                <div className="p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400/90 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-slate-100/90">Model drift detected</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 rounded-full p-0 text-slate-400/80 hover:text-slate-100 hover:bg-transparent -mt-1 -mr-1"
                          onClick={() => setShowModelDriftAlert(false)}
                        >
                          <span className="sr-only">Close</span>×
                        </Button>
                      </div>
                      <p className="text-xs text-slate-300/80 mt-0.5">Confirm to set new baseline?</p>
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
        </div>
      </div>
    </div>
  )
}
