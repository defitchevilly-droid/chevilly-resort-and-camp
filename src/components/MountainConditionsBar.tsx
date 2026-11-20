import React from 'react';
import { LIVE_WEATHER, RESORT_INFO } from '../data/resortData';
import { CloudFog, Compass, Mountain, Thermometer, Wind } from 'lucide-react';

export const MountainConditionsBar: React.FC = () => {
  return (
    <section className="bg-[#12231e] text-[#e3ded4] border-y border-[#263c34] text-xs py-3 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
        <div className="flex items-center gap-2">
          <Mountain className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
          <span className="font-serif tracking-wider uppercase text-[#f7f5ef] font-medium">
            Chevilly Summit Ridge
          </span>
          <span className="text-[#849a90]">·</span>
          <span className="font-mono tabular-nums text-[#849a90]">{RESORT_INFO.elevation}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[#adbdb6]">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Suhu Udara:</span>
            <span className="font-mono tabular-nums font-medium text-[#f7f5ef]">{LIVE_WEATHER.currentTemp}</span>
          </div>

          <span className="text-[#364d44] hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <CloudFog className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Kondisi:</span>
            <span className="text-[#f7f5ef]">{LIVE_WEATHER.condition}</span>
          </div>

          <span className="text-[#364d44] hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Thermal Spa:</span>
            <span className="font-mono tabular-nums font-medium text-[#f7f5ef]">{LIVE_WEATHER.thermalWaterTemp}</span>
          </div>

          <span className="text-[#364d44] hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Jalur Ekspedisi:</span>
            <span className="text-[#f7f5ef]">{LIVE_WEATHER.trailStatus}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
