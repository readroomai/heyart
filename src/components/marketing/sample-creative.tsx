import { cn } from '@/lib/cn'

/**
 * The sample creative shown across the marketing pages. Drawn rather than
 * photographed, so nothing here is stock imagery or a real brand's work.
 * Always presented alongside a "sample" label.
 */
export function SampleCreative({
  variant = 'a',
  className,
}: {
  variant?: 'a' | 'b'
  className?: string
}) {
  const isB = variant === 'b'
  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{ backgroundColor: isB ? '#EDE6DA' : '#E9E2D6' }}
      role="img"
      aria-label={
        isB
          ? 'Sample coffee launch graphic, variant B: product centred with a large announcement line.'
          : 'Sample coffee launch graphic, variant A: product to the right with a serif headline on the left.'
      }
    >
      <div
        className="absolute inset-0"
        style={{
          background: isB
            ? 'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.72), rgba(255,255,255,0) 62%)'
            : 'radial-gradient(90% 80% at 78% 26%, rgba(255,255,255,0.8), rgba(255,255,255,0) 58%)',
        }}
      />

      {/* Type block */}
      <div
        className={cn(
          'absolute z-10',
          isB ? 'inset-x-[9%] top-[10%] text-center' : 'left-[14%] top-[16%] max-w-[46%] text-left'
        )}
      >
        {isB && (
          <p
            className="mb-[2%] font-mono text-[clamp(6px,1.05vw,11px)] uppercase tracking-[0.28em]"
            style={{ color: '#8A5A3B' }}
          >
            New single origin
          </p>
        )}
        <p
          className="font-serif leading-[0.95]"
          style={{
            color: '#3A2B20',
            fontSize: isB ? 'clamp(20px,4.2vw,44px)' : 'clamp(18px,3.4vw,38px)',
          }}
        >
          Northbound
        </p>
        <p
          className="font-serif italic leading-[0.95]"
          style={{
            color: '#3A2B20',
            fontSize: isB ? 'clamp(20px,4.2vw,44px)' : 'clamp(18px,3.4vw,38px)',
          }}
        >
          Coffee Roasters
        </p>
        {!isB && (
          <p
            className="mt-[6%] text-[clamp(6px,1.1vw,12px)] leading-relaxed"
            style={{ color: '#6B5646' }}
          >
            Small batch, slow roasted, north coast water.
          </p>
        )}
      </div>

      {/* Product form */}
      <div
        className={cn(
          'absolute z-[5]',
          isB
            ? 'bottom-[6%] left-1/2 h-[52%] w-[26%] -translate-x-1/2'
            : 'bottom-[12%] right-[11%] h-[58%] w-[25%]'
        )}
      >
        <div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(102deg, #6B4A32 0%, #8A6244 44%, #5C3E29 100%)',
            clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
            boxShadow: '0 26px 44px -22px rgba(58,43,32,0.55)',
          }}
        >
          <div
            className="mx-auto mt-[18%] h-[1px] w-[62%]"
            style={{ backgroundColor: 'rgba(246,242,234,0.42)' }}
          />
          <p
            className="mt-[14%] text-center font-serif text-[clamp(7px,1.5vw,16px)]"
            style={{ color: '#F1E7D8' }}
          >
            NB
          </p>
          <p
            className="mt-[6%] text-center font-mono text-[clamp(4px,0.72vw,8px)] uppercase tracking-[0.22em]"
            style={{ color: 'rgba(241,231,216,0.72)' }}
          >
            Roast 04
          </p>
        </div>
      </div>

      {/* Low-contrast detail band — the weakness the sample report flags */}
      <div
        className={cn(
          'absolute bottom-[4%] z-10 flex gap-[4%]',
          isB ? 'left-1/2 -translate-x-1/2' : 'left-[14%]'
        )}
      >
        {['Ethiopia', 'Washed', '250g'].map((item) => (
          <span
            key={item}
            className="font-mono text-[clamp(4px,0.78vw,9px)] uppercase tracking-[0.2em]"
            style={{ color: 'rgba(107,86,70,0.52)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/** A drawn feed grid, used by the Feed Audit demonstration. */
export function SampleFeed({ className }: { className?: string }) {
  const tiles = [
    { bg: '#E9E2D6', tone: '#8A6244', kind: 'flat' },
    { bg: '#2C2722', tone: '#F1E7D8', kind: 'editorial' },
    { bg: '#F0E4E4', tone: '#C39A9A', kind: 'pastel' },
    { bg: '#E9E2D6', tone: '#8A6244', kind: 'flat' },
    { bg: '#E9E2D6', tone: '#8A6244', kind: 'flat' },
    { bg: '#DDE7F8', tone: '#5C7BB8', kind: 'pastel' },
    { bg: '#2C2722', tone: '#F1E7D8', kind: 'editorial' },
    { bg: '#EDE6DA', tone: '#8A6244', kind: 'flat' },
    { bg: '#F0E4E4', tone: '#C39A9A', kind: 'pastel' },
  ]
  return (
    <div
      className={cn('h-full w-full bg-white p-[4%]', className)}
      role="img"
      aria-label="Sample profile screenshot showing a nine-tile feed with mixed visual styles."
    >
      <div className="flex items-center gap-[3%]">
        <div className="aspect-square w-[14%] rounded-full bg-[#DDD3C4]" />
        <div className="flex-1">
          <div className="h-[8px] w-[42%] rounded-full bg-[#3A2B20]" />
          <div className="mt-[6px] h-[6px] w-[66%] rounded-full bg-[#DDD3C4]" />
          <div className="mt-[5px] h-[6px] w-[30%] rounded-full bg-[#EAE3D8]" />
        </div>
      </div>
      <div className="mt-[4%] grid grid-cols-3 gap-[2%]">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden"
            style={{ backgroundColor: tile.bg }}
          >
            {tile.kind === 'flat' && (
              <div
                className="absolute bottom-[16%] left-1/2 h-[46%] w-[22%] -translate-x-1/2"
                style={{
                  backgroundColor: tile.tone,
                  clipPath: 'polygon(8% 0,92% 0,100% 100%,0 100%)',
                }}
              />
            )}
            {tile.kind === 'editorial' && (
              <div className="absolute inset-[14%] flex items-end">
                <div className="w-full">
                  <div className="h-[3px] w-[70%]" style={{ backgroundColor: tile.tone }} />
                  <div
                    className="mt-[5px] h-[3px] w-[46%]"
                    style={{ backgroundColor: tile.tone, opacity: 0.6 }}
                  />
                </div>
              </div>
            )}
            {tile.kind === 'pastel' && (
              <div
                className="absolute left-1/2 top-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: tile.tone, opacity: 0.75 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
