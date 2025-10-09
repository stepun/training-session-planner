import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { getLoadLevelGradientColor } from "@/utils/colorUtils"

interface LoadLevelSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  value: number[]
}

const LoadLevelSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  LoadLevelSliderProps
>(({ className, value, ...props }, ref) => {
  const currentValue = value[0] || 1
  const currentColor = getLoadLevelGradientColor(currentValue)

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={value}
      {...props}
    >
      {/* Track with gradient background */}
      <SliderPrimitive.Track
        className="relative h-2 w-full grow overflow-hidden rounded-full"
        style={{
          background: 'linear-gradient(to right, rgb(16, 185, 129), rgb(245, 234, 20), rgb(249, 115, 22), rgb(239, 68, 68))'
        }}
      >
        {/* Range overlay - semi-transparent to show gradient underneath */}
        <SliderPrimitive.Range
          className="absolute h-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}
        />
      </SliderPrimitive.Track>

      {/* Thumb with dynamic color */}
      <SliderPrimitive.Thumb
        className="block h-5 w-5 rounded-full border-2 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md"
        style={{
          borderColor: currentColor
        }}
      />
    </SliderPrimitive.Root>
  )
})
LoadLevelSlider.displayName = "LoadLevelSlider"

export { LoadLevelSlider }
