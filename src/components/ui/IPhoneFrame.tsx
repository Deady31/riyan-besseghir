import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function IPhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative aspect-[71.5/147.6] w-[300px] md:w-[340px]', className)}>
      <span className="absolute top-[18%] -left-[3px] h-[7%] w-[3px] rounded-l bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute top-[28%] -left-[3px] h-[11%] w-[3px] rounded-l bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute top-[41%] -left-[3px] h-[11%] w-[3px] rounded-l bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute top-[31%] -right-[3px] h-[16%] w-[3px] rounded-r bg-[#3a3a3c]" aria-hidden="true" />
      <div className="absolute inset-0 rounded-[17%/8.2%] bg-[linear-gradient(145deg,#4a4a4d_0%,#1c1c1e_35%,#2c2c2e_70%,#5a5a5d_100%)] p-[3px] shadow-[0_60px_120px_-30px_rgb(139_92_255/0.35),0_30px_60px_-20px_rgb(0_0_0/0.9)]">
        <div className="relative size-full overflow-hidden rounded-[15.6%/7.6%] bg-black p-[3.2%]">
          <div className="relative size-full overflow-hidden rounded-[13.4%/6.4%] bg-[#0b0b0c]">
            <div className="absolute top-[1.4%] left-1/2 z-20 h-[3.6%] w-[31%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[9%] pt-[3.4%] text-[11px] font-medium text-white" aria-hidden="true">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span className="flex items-end gap-[1.5px]">
                  {[4, 6, 8, 10].map((h) => (
                    <span key={h} className="w-[2.5px] rounded-sm bg-white" style={{ height: h }} />
                  ))}
                </span>
                <span className="ml-1 h-[10px] w-[20px] rounded-[3px] border border-white/60 p-[1.5px]">
                  <span className="block h-full w-[75%] rounded-[1px] bg-white" />
                </span>
              </span>
            </div>
            {children}
            <div className="absolute bottom-[1.2%] left-1/2 z-20 h-[0.7%] w-[36%] -translate-x-1/2 rounded-full bg-white/80" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
