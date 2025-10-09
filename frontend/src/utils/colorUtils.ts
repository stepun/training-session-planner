/**
 * Calculates a smooth gradient color from green to red based on load level (1-10)
 *
 * @param level - Load level from 1 to 10
 * @returns RGB color string in format 'rgb(r, g, b)'
 */
export const getLoadLevelGradientColor = (level: number): string => {
  // Clamp level between 1 and 10
  const clampedLevel = Math.max(1, Math.min(10, level))

  // Normalize to 0-1 range
  const normalized = (clampedLevel - 1) / 9

  // Define color points for smooth gradient
  // Green (1) -> Yellow (5) -> Orange (7) -> Red (10)

  let r: number, g: number, b: number

  if (normalized <= 0.44) {
    // Green to Yellow (1-5)
    const t = normalized / 0.44
    r = Math.round(16 + (245 - 16) * t)   // 16 -> 245
    g = Math.round(185 + (234 - 185) * t) // 185 -> 234
    b = Math.round(129 + (20 - 129) * t)  // 129 -> 20
  } else if (normalized <= 0.66) {
    // Yellow to Orange (5-7)
    const t = (normalized - 0.44) / 0.22
    r = Math.round(245 + (249 - 245) * t) // 245 -> 249
    g = Math.round(234 + (115 - 234) * t) // 234 -> 115
    b = Math.round(20 + (22 - 20) * t)    // 20 -> 22
  } else {
    // Orange to Red (7-10)
    const t = (normalized - 0.66) / 0.34
    r = Math.round(249 + (239 - 249) * t) // 249 -> 239
    g = Math.round(115 + (68 - 115) * t)  // 115 -> 68
    b = Math.round(22 + (68 - 22) * t)    // 22 -> 68
  }

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Converts RGB color to hex format for PDF rendering
 *
 * @param rgbColor - RGB color string in format 'rgb(r, g, b)'
 * @returns Hex color string in format '#RRGGBB'
 */
export const rgbToHex = (rgbColor: string): string => {
  const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return '#000000'

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Gets a lighter background color based on the load level color
 *
 * @param level - Load level from 1 to 10
 * @returns RGB color string with reduced opacity
 */
export const getLoadLevelBgColor = (level: number): string => {
  const color = getLoadLevelGradientColor(level)
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return 'rgba(0, 0, 0, 0.1)'

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  return `rgba(${r}, ${g}, ${b}, 0.15)`
}
