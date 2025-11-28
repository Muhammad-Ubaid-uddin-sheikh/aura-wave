'use client'

const barHeights = [8, 14, 22, 30, 36, 44, 52, 44, 36, 30, 22, 14, 8]

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-end gap-[2px]">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-full bg-primary animate-pulse-bar"
            style={{
              height: `${h}px`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    </div>
  )
}