import { lazy } from "react"

// Lazy load chart components to reduce bundle size
export const LazyLineChart = lazy(() => import("recharts").then((mod) => ({ default: mod.LineChart })))
export const LazyBarChart = lazy(() => import("recharts").then((mod) => ({ default: mod.BarChart })))
export const LazyPieChart = lazy(() => import("recharts").then((mod) => ({ default: mod.PieChart })))
export const LazyResponsiveContainer = lazy(() =>
  import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
)

// Chart loading component
export const ChartSkeleton = () => (
  <div className="flex items-center justify-center h-[300px] bg-muted/10 rounded-lg animate-pulse">
    <div className="text-center">
      <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2"></div>
      <div className="w-24 h-4 bg-muted rounded mx-auto"></div>
    </div>
  </div>
)
