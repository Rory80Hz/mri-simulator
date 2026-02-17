import React, { useState, useEffect } from 'react';
import { Maximize2, Layers, Repeat, Activity, Clock, Database } from 'lucide-react';

const MriIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 text-blue-400" fill="currentColor">
    {/* Magnet Bore */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.5" />
    {/* Patient Table */}
    <rect x="20" y="60" width="60" height="10" rx="2" fill="currentColor" />
    <rect x="30" y="70" width="40" height="20" rx="2" fill="currentColor" opacity="0.6" />
  </svg>
);

const MRISimulator = () => {
  const [nex, setNex] = useState(1); // 1 (Noise) to 4 (Clean)
  const [resolution, setResolution] = useState(128); // 128 (Low) to 512 (High)
  const [sliceThickness, setSliceThickness] = useState(5); // 1mm (Thin) to 10mm (Thick)
  const [sequenceType, setSequenceType] = useState('PD_FSE');

  // Sequence Definitions
  const sequences = {
    'UTE': { 
        name: "Ultrashort TE (UTE)", 
        tr: 10, // ms
        te: 0.05, 
        etl: 1, 
        baseTime: 400, // Arbitrary base seconds for 128 matrix
        description: "Excellent for cortical bone & tendon. Very short TE minimizes signal decay in solid structures."
    },
    '3D_GRE': { 
        name: "3D Gradient Echo (GRE)", 
        tr: 20, 
        te: 5, 
        etl: 1, 
        baseTime: 200, 
        description: "Fast 3D acquisition. Good for cartilage, but susceptible to magnetic susceptibility artifacts."
    },
    '3D_FSE': { 
        name: "3D Fast Spin Echo (FSE)", 
        tr: 1500, 
        te: 30, 
        etl: 60, // High echo train length reduces time
        baseTime: 350, 
        description: "High SNR 3D volume. Good for reformats. Less prone to metal artifacts than GRE."
    },
    'PD_FSE': { 
        name: "Proton Density (PD) FSE-2D", 
        tr: 3000, 
        te: 30, 
        etl: 12, 
        baseTime: 180, // 2D usually
        description: "The gold standard for cartilage and meniscus. Excellent anatomical detail."
    },
  };

  const currentSeq = sequences[sequenceType] || sequences['PD_FSE'];

  // Calculate Scan Time
  // Formula approx: (PhaseEncoding * NEX * TR) / ETL 
  // We use a simplified version for the visualizer to get somewhat realistic "Minutes:Seconds"
  const scanTimeSeconds = (() => {
      // Resolution factor (higher matrix = more phase encoding lines)
      const phaseLines = resolution;
      
      // Allow for simulated 3D efficiency or 2D slice loops
      // 3D sequences acquire a volume, 2D loops slices. 
      // For sim simplicity: Time proportional to Res * NEX * BaseFactor
      let rawSeconds = (phaseLines / 128) * nex * currentSeq.baseTime;
      
      // Slice thickness trade-off: 
      // Thinner slices in 3D usually means MORE partitions => More Time
      // In 2D, purely thinner slices might just mean more slices to cover same anatomy -> More TRs needed -> More Time
      if (sliceThickness < 3) rawSeconds *= 1.5; // Penalty for high-res z-axis
      if (sliceThickness === 1) rawSeconds *= 1.5;

      // Adjust for sequences that are inherently 3D volume vs 2D
      if (sequenceType === 'PD_FSE') {
         // 2D FSE is often faster per slice but we cover a volume
         rawSeconds = rawSeconds * 0.8;
      }

      return rawSeconds;
  })();

  const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}min ${s}s`;
  };

  // Derived values for visual effects
  const noiseLevel = (5 - nex) * 0.15; // Higher NEX = Less noise
  const blurAmount = (512 - resolution) / 100; // Lower Res = More blur/pixelation feel
  const stepSize = Math.max(1, sliceThickness - 2); // For slice spacing "stair-step" artifact

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 p-8 gap-8 font-sans">
      
      {/* --- CONTROL PANEL --- */}
      <div className="w-full lg:w-1/3 space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-slate-800 pb-4 text-blue-400">
          <MriIcon />
          MRI Console
        </h2>

        {/* Sequence Selector */}
        <div className="space-y-3 p-5 bg-slate-800 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex justify-between items-start">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Database className="w-4 h-4 text-orange-400" />
                    <span>Pulse Sequence</span>
                </label>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Total Scan Time</div>
                    <div className={`text-xl font-mono tracking-wider ${scanTimeSeconds > 600 ? "text-red-400" : "text-emerald-400"}`}>
                        {formatTime(scanTimeSeconds)}
                    </div>
                </div>
            </div>
            
            <select 
                value={sequenceType}
                onChange={(e) => setSequenceType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
                {Object.entries(sequences).map(([key, seq]) => (
                    <option key={key} value={key}>{seq.name}</option>
                ))}
            </select>
            <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-700 pt-2 min-h-[40px]">
                {currentSeq.description}
            </p>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>TR: {currentSeq.tr}ms</span>
                <span>TE: {currentSeq.te}ms</span>
            </div>
        </div>

        {/* NEX Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Repeat className="w-4 h-4 text-blue-400" />
              <span>NEX (Averages)</span>
            </label>
            <span className="text-blue-400 font-mono bg-blue-400/10 px-2 py-1 rounded text-xs">{nex}</span>
          </div>
          <input 
            type="range" min="1" max="4" step="1" value={nex} 
            onChange={(e) => setNex(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
          <p className="text-xs text-slate-500">
            Controls Signal-to-Noise Ratio (SNR). Higher NEX averages out random noise.
          </p>
        </div>

        {/* Resolution Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Maximize2 className="w-4 h-4 text-green-400" />
              <span>Matrix (Resolution)</span>
            </label>
            <span className="text-green-400 font-mono bg-green-400/10 px-2 py-1 rounded text-xs">{resolution}²</span>
          </div>
          <input 
            type="range" min="64" max="512" step="64" value={resolution} 
            onChange={(e) => setResolution(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
          />
          <p className="text-xs text-slate-500">
             Higher resolution adds Phase Encoding steps, directly increasing scan time.
          </p>
        </div>

        {/* Slice Thickness Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Slice Thickness</span>
            </label>
            <span className="text-purple-400 font-mono bg-purple-400/10 px-2 py-1 rounded text-xs">{sliceThickness} mm</span>
          </div>
          <input 
            type="range" min="1" max="10" step="1" value={sliceThickness} 
            onChange={(e) => setSliceThickness(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
          />
          <p className="text-xs text-slate-500">
            Thinner slices need more passes/partitions (Time penalty) but reduce partial voluming.
          </p>
        </div>
      </div>

      {/* --- 3D MODEL PREVIEW COLUMN --- */}
      <div className="w-full lg:w-1/4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
         
        {/* Dynamic Analysis Note */}
        <div className="mb-6 p-4 bg-slate-800/80 border border-slate-700 rounded-lg w-full">
          <div className="flex items-center gap-2 mb-2 text-amber-400 text-sm font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            Image Quality Analysis
          </div>
          <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
            {scanTimeSeconds > 600 && <li className="text-red-400">Time Warning: Scan > 10m. High risk of patient motion artifacts!</li>}
            {nex === 1 && <li className="text-red-400">High noise floor (grainy). Low SNR obscures fine details.</li>}
            {resolution < 128 && <li className="text-red-400">Severe pixelation. Cannot distinguish small structures.</li>}
            {sliceThickness > 5 && <li className="text-red-400">Thick slices ( >5mm ) causing severe "stair-step" artifacts.</li>}
            {sliceThickness === 3 && <li className="text-yellow-400">3mm slices: Acceptable for general structure, but subtle curving steps visible.</li>}
            {sliceThickness <= 1 && <li className="text-emerald-400">1mm slices: High fidelity 3D reconstruction possible (Smooth isotropic voxels).</li>}
            {nex >= 3 && resolution >= 256 && sliceThickness <= 3 && scanTimeSeconds < 600 && <li className="text-emerald-400">Optimal diagnostic quality.</li>}
          </ul>
        </div>

         <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
            <Layers className="text-purple-400" size={20}/> 3D Reconstruction Impact
         </h3>
         
         {/* 3D Stack Visualization */}
         <div className="relative w-48 h-64 perspective-1000">
            <div className="absolute inset-0 flex flex-col-reverse items-center justify-end gap-[1px] transform rotate-x-12 rotate-y-12 transition-all duration-500">
                {/* We generate a stack of "slices" to form a sphere shape */}
                {Array.from({ length: Math.ceil(20 / Math.max(1, sliceThickness * 0.5)) }).map((_, i, arr) => {
                    // Start from middle and go up
                    const totalHeight = 160; 
                    const numSlices = arr.length;
                    const sliceHeight = totalHeight / numSlices;
                    
                    // Sphere math: radius at height y
                    // y ranges from -r to r
                    // Let's model a simple hemisphere or sphere section
                    const y = (i / (numSlices - 1)) * 2 - 1; // -1 to 1
                    const radius = Math.sqrt(1 - y*y); // Unit circle width

                    return (
                        <div 
                            key={i}
                            className="w-full bg-blue-500/30 border border-blue-400/50 rounded-sm transition-all duration-300 backdrop-blur-sm"
                            style={{
                                width: `${radius * 100}%`,
                                height: `${sliceHeight}px`,
                                marginBottom: '1px',
                                opacity: 0.8 - (Math.abs(y) * 0.3),
                                transform: `translateZ(${i * 2}px)`
                            }}
                        />
                    );
                })}
            </div>
         </div>
         <p className="mt-8 text-center text-xs text-slate-500">
            {sliceThickness <= 1 
                ? "Isotropic (1mm): Smooth, continuous 3D surface." 
                : sliceThickness <= 3 
                    ? "3mm Slices: Slight jaggedness on dome, generally acceptable." 
                    : "Thick Slices: Severe 'pancake' artifacting destroys 3D utility."}
         </p>
      </div>

      {/* --- MRI VIEWPORT --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-lg aspect-square bg-black rounded-full overflow-hidden border-8 border-slate-800 shadow-2xl ring-1 ring-slate-700">
          
          {/* SVG Definition Filters */}
          <svg className="absolute w-0 h-0">
            <defs>
              {/* Noise Filter for NEX */}
              <filter id="noiseFilter">
                <feTurbulence 
                  type="fractalNoise" 
                  baseFrequency={`${0.6 + (nex * 0.1)}`} 
                  numOctaves="3" 
                  stitchTiles="stitch" 
                  result="noise"
                />
                <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
                <feComponentTransfer in="grayNoise" result="heavyNoise">
                    <feFuncA type="linear" slope={noiseLevel} /> 
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="heavyNoise" mode="overlay" />
              </filter>

              {/* Pixelation Filter for Resolution (simulated via stepped displacement or blocky-ness) */}
              {/* Note: SVG doesn't have a direct 'pixelate' filter, but we can simulate resolution with very low blur or just CSS image-rendering */}
            </defs>
          </svg>

          {/* The Anatomy Layer */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black"
            style={{ 
              // Resolution Effect: Use CSS blur for simplicity, 
              // but we could also scale down/up a canvas for true pixelation. 
              // For SVG, we'll keep it sharp but maybe blur slightly at low res.
              filter: `url(#noiseFilter) blur(${blurAmount * 0.5}px)`
            }}
          > 
            <svg viewBox="0 0 200 200" className="w-[90%] h-[90%]">
                {/* Background "Marrow" */}
                {/* We use a mask or clip to simulate slice thickness stepping on the circle */}
                
                {/* Main Bone Structure (Head of Humerus) */}
                <circle 
                  cx="100" cy="100" r="70" 
                  fill="#333" 
                  stroke="#555" 
                  strokeWidth="2"
                />
                
                {/* Internal Marrow Texture (subtle) */}
                <circle cx="100" cy="100" r="65" fill="#2a2a2a" />

                {/* The "Lesion" or "Detail" we want to see */}
                <path 
                    d="M 80 80 Q 100 60 120 80 T 160 80" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-80"
                />

                {/* Slice Thickness Simulation: Stepped edges on a curved structure */}
                <g transform="translate(50, 130)">
                    <text x="0" y="-15" fill="#666" fontSize="8" fontFamily="monospace">CURVED STRUCTURE</text>
                    
                    {/* The ideal curve (Phantom Trace) */}
                    <path 
                        d="M 0 80 Q 0 0 80 0" 
                        fill="none" 
                        stroke="#334155" 
                        strokeWidth="1" 
                        strokeDasharray="4 2"
                    />

                    {/* The "Stepped" Version representing slices */}
                    {(() => {
                        // Simulation scale: Let's say 80px = 80mm for simplicity of visualization
                        // so 1px = 1mm. 
                        // But to make it visible to user, we might need to exaggerate slightly x3
                        const scaleFactor = 3; 
                        const effectiveStepSize = Math.max(1, sliceThickness * scaleFactor);
                        
                        // We will draw a stepped path instead of individual rects for cleaner look
                        let d = "M 0 80 ";
                        // We move from x=0 to x=80
                        const steps = [];
                        for (let x = 0; x < 80; x += effectiveStepSize) {
                            const ratio = x / 80;
                            // Use a circular arc (quarter circle) for the ideal curve: y = 80 - sqrt(80^2 - x^2)
                            // This matches a sphere cross-section perfectly.
                            // However, coordinate system here is top-left (0,0) is weird. 
                            // Let's assume (0,80) is bottom-left of the box.
                            // The curve starts at (0, 80) and goes to (80, 0).
                            // Equation for quarter circle centered at (0,0) would be y = sqrt(r^2 - x^2).
                            // But we want it concave up? No, convex like a head.
                            // Let's stick to the 1 - cos/sin logic which visually matches.
                            const y_ideal = 80 - (80 * Math.sin((x / 80) * (Math.PI / 2)));
                            
                            const next_x = Math.min(80, x + effectiveStepSize);
                            const next_ratio = next_x / 80;
                            const next_y_ideal = 80 - (80 * Math.sin((next_x / 80) * (Math.PI / 2)));

                            d += `L ${next_x} ${y_ideal} `; 
                            if (next_x < 80) {
                                d += `L ${next_x} ${next_y_ideal} `;
                            }
                        }

                        // Determine color based on quality
                        let strokeColor = "#4ade80"; // Green (Good)
                        if (sliceThickness > 2) strokeColor = "#facc15"; // Yellow (Warning)
                        if (sliceThickness > 5) strokeColor = "#ef4444"; // Red (Bad)

                        return (
                            <path 
                                d={d} 
                                fill="none" 
                                stroke={strokeColor} 
                                strokeWidth={sliceThickness > 5 ? 3 : 2}
                                className="transition-all duration-300"
                            />
                        );
                    })()}
                </g>

                {/* Resolution Target: A set of converging lines */}
                <g transform="translate(130, 40)">
                     {/* High Res = Distinct lines. Low Res = Blob. */}
                     <line x1="0" y1="0" x2="30" y2="0" stroke="white" strokeWidth="1" />
                     <line x1="0" y1="4" x2="30" y2="4" stroke="white" strokeWidth="1" />
                     <line x1="0" y1="8" x2="30" y2="8" stroke="white" strokeWidth="1" />
                </g>

            </svg>
          </div>
          
          {/* overlay scanlines for "Digital" feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%] pointer-events-none" />

          {/* Info Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-500">
            F.O.V: 240mm
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRISimulator;
