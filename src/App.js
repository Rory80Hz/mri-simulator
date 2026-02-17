import React, { useState, useEffect } from 'react';
import { Maximize2, Layers, Repeat, Activity, Clock, Database, HelpCircle, X } from 'lucide-react';

const MriIcon = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 text-secondary" fill="currentColor">
    {/* Magnet Bore */}
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.5" />
    {/* Patient Table */}
    <rect x="20" y="60" width="60" height="10" rx="2" fill="currentColor" />
    <rect x="30" y="70" width="40" height="20" rx="2" fill="currentColor" opacity="0.6" />
  </svg>
);


const ScheduleView = ({ scanTimeSeconds }) => {
    const [sequencesPerExam, setSequencesPerExam] = useState(4);
    
    // Assumptions for a typical clinical workflow
    // The "scanTimeSeconds" passed in is for ONE sequence.
    // A typical MRI exam (e.g. Knee) has ~4-5 sequences.
    const totalScanPhase = scanTimeSeconds * sequencesPerExam;
    
    const prepTime = 10 * 60; // 10 mins for screening, changing, IV
    const resetTime = 5 * 60; // 5 mins for cleaning, data transfer
    
    // Total slot time
    const totalSlotSeconds = prepTime + totalScanPhase + resetTime;
    const totalSlotMinutes = Math.round(totalSlotSeconds / 60);
    
    // Operational Day: 8:00 AM to 8:00 PM (12 hours)
    const dayStartHour = 8;
    const dayEndHour = 20;
    const operatingMinutes = (dayEndHour - dayStartHour) * 60;
    
    const slotsPerDay = Math.floor(operatingMinutes / totalSlotMinutes);
    
    // Mock Schedule Generation
    const schedule = [];
    let currentTime = dayStartHour * 60; // Start at 8:00 AM in minutes
    
    for (let i = 0; i < slotsPerDay; i++) {
        const start = currentTime;
        const end = currentTime + totalSlotMinutes;
        
        // Format nicely
        const format = (mins) => {
            const h = Math.floor(mins / 60);
            const m = Math.round(mins % 60);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : h;
            return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        };
        
        schedule.push({
            id: i + 1,
            start: format(start),
            end: format(end),
            type: 'Patient Slot'
        });
        
        currentTime = end;
    }

    // Revenue / Efficiency Calc (Mock $300 per scan)
    const dailyRevenue = slotsPerDay * 300;
    
    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full bg-primary p-6 rounded-2xl border border-primary-light">
            <div className="w-full lg:w-1/3 space-y-6">
                <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
                    <Clock /> Center Throughput
                </h2>
                
                <div className="bg-black/20 p-6 rounded-xl border border-primary-light space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Protocol Breakdown</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-tint-20 font-bold uppercase tracking-wider">Sequences</span>
                            <div className="flex bg-primary border border-primary-light rounded overflow-hidden">
                                <button 
                                    onClick={() => setSequencesPerExam(Math.max(1, sequencesPerExam - 1))}
                                    className="px-2 py-1 text-xs text-tint-15 hover:text-white hover:bg-white/10 transition-colors"
                                >-</button>
                                <span className="px-2 py-1 text-xs font-mono text-secondary border-l border-r border-primary-light min-w-[24px] text-center">
                                    {sequencesPerExam}
                                </span>
                                <button 
                                    onClick={() => setSequencesPerExam(Math.min(10, sequencesPerExam + 1))}
                                    className="px-2 py-1 text-xs text-tint-15 hover:text-white hover:bg-white/10 transition-colors"
                                >+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Prep */}
                        <div className="relative pt-6">
                            <div className="flex justify-between text-sm mb-1 text-tint-20">
                                <span>Prep & Positioning</span>
                                <span>10 min</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-full opacity-50"></div>
                            </div>
                        </div>

                        {/* Scan */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-tint-20">
                                <span>Scan Time ({sequencesPerExam}x Sqs)</span>
                                <span className={totalScanPhase > 2400 ? "text-red-400" : "text-green-400"}>
                                    {Math.round(totalScanPhase / 60)} min
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
                                <div className="h-full absolute left-0 top-0 bg-secondary transition-all duration-500" 
                                     style={{ width: '100%' }}></div>
                                {/* Striped pattern to indicate "active" scanning */}
                                <div className="absolute inset-0 w-full h-full" 
                                style={{backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 20px)'}}></div>
                            </div>
                            <p className="text-[10px] text-tint-25 mt-1">
                                Based on current simulator settings ({Math.round(scanTimeSeconds / 60)}m x {sequencesPerExam}).
                            </p>
                        </div>

                        {/* Reset */}
                        <div>
                            <div className="flex justify-between text-sm mb-1 text-tint-20">
                                <span>Clean & Reset</span>
                                <span>5 min</span>
                            </div>
                             <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-accent w-full opacity-50"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-primary-light flex items-end justify-between">
                        <div>
                            <div className="text-xs text-tint-25 uppercase tracking-wider">Total Slot Time</div>
                            <div className="text-3xl font-bold text-white">{totalSlotMinutes} <span className="text-sm font-normal text-tint-20">min</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-tint-25 uppercase tracking-wider">Throughput</div>
                            <div className="text-3xl font-bold text-secondary">{slotsPerDay} <span className="text-sm font-normal text-tint-20">p/day</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 p-6 rounded-xl border border-primary-light">
                   <h3 className="text-lg font-bold text-white mb-2">Impact Analysis</h3>
                   <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center flex-1">
                           <div className="text-2xl font-bold text-green-400">${dailyRevenue.toLocaleString()}</div>
                           <div className="text-[10px] uppercase text-green-500/60">Daily Revenue</div>
                        </div>
                   </div>
                   <p className="mt-4 text-xs text-tint-25 leading-relaxed">
                        Increasing scan time by just 2 minutes removes {(operatingMinutes / (totalSlotMinutes + 2)).toFixed(1) < slotsPerDay ? "1-2" : "0"} patient slots per day. 
                        Optimizing your <span className="text-secondary font-bold">NEX</span> and <span className="text-secondary font-bold">Matrix</span> 
                        can dramatically improve departmental efficiency.
                   </p>
                </div>
            </div>

            {/* Schedule Graphic */}
            <div className="flex-1 bg-black/40 rounded-xl border border-primary-light p-6 overflow-hidden flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4">Projected Daily Schedule</h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 relative">
                    {schedule.map((slot) => (
                        <div key={slot.id} className="flex gap-4 group">
                            <div className="w-20 text-right text-sm font-mono text-tint-25 py-3">{slot.start}</div>
                            <div className="flex-1 bg-primary-light/20 border border-primary-light/40 rounded-lg p-2 flex relative overflow-hidden hover:bg-primary-light/30 transition-colors">
                                <div className="absolute left-0 top-0 bottom-0 bg-blue-500 w-1"></div>
                                <div className="pl-3">
                                    <div className="font-bold text-tint-10 text-sm">Patient {slot.id} - Knee MRI</div>
                                    <div className="text-xs text-tint-25 flex gap-2 mt-1">
                                        <span className="bg-blue-900/50 px-1 rounded text-blue-300">Prep: 10m</span>
                                        <span className={`bg-secondary/20 px-1 rounded text-secondary`}>Scan: {Math.round(totalScanPhase/60)}m</span>
                                        <span className="bg-accent/20 px-1 rounded text-accent">Reset: 5m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Ghost slots if time was better */}
                    {slotsPerDay < 15 && (
                        <div className="flex gap-4 opacity-30 grayscale pointer-events-none border-t border-dashed border-tint-25 pt-4 mt-4">
                            <div className="w-20 text-right text-sm font-mono text-tint-25 py-3">XX:XX PM</div>
                             <div className="flex-1 bg-transparent border border-tint-25 border-dashed rounded-lg p-3 text-center text-sm text-tint-20">
                                Reduce scan time to reclaim lost slots
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MRISimulator = () => {
  const [activeTab, setActiveTab] = useState('sim'); // 'sim' or 'schedule'
  const [nex, setNex] = useState(1); // 1 (Noise) to 4 (Clean)
  const [resolution, setResolution] = useState(128); // 128 (Low) to 512 (High)
  const [sliceThickness, setSliceThickness] = useState(5); // 1mm (Thin) to 10mm (Thick)
  const [sequenceType, setSequenceType] = useState('PD_FSE');
  const [showHelp, setShowHelp] = useState(false);

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

  // Scoring Logic for Iron Triangle
  const snrScore = Math.round(((nex/4)*50 + (sliceThickness/10)*30 + ((512-resolution)/512)*20));
  const resScore = Math.round(((resolution/512)*60 + ((11-sliceThickness)/10)*40));
  const timeScore = Math.max(0, Math.min(100, Math.round(100 - (scanTimeSeconds/600)*100)));

  const getScoreColor = (score) => {
      if (score < 40) return "bg-red-500";
      if (score < 70) return "bg-amber-500";
      return "bg-emerald-500";
  };

  return (
    <div className="flex flex-col h-screen bg-primary text-tint-5 font-sans overflow-hidden">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center p-6 border-b border-primary-light bg-black/20 backdrop-blur-md z-10 shrink-0">
            <h1 className="text-2xl font-bold text-secondary flex items-center gap-3">
                <MriIcon /> 
                <span className="hidden md:inline">NexHex MRI Simulator</span>
            </h1>
            
            <div className="flex bg-black/40 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('sim')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'sim' 
                        ? 'bg-secondary text-white shadow-lg' 
                        : 'text-tint-20 hover:text-white hover:bg-primary-light/50'
                    }`}
                >
                    Simulator
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'schedule' 
                        ? 'bg-secondary text-white shadow-lg' 
                        : 'text-tint-20 hover:text-white hover:bg-primary-light/50'
                    }`}
                >
                    Scheduling
                </button>
            </div>

            <button 
                onClick={() => setShowHelp(true)}
                className="p-2 hover:bg-primary-light/50 rounded-full text-tint-20 hover:text-white transition-colors"
                title="Help & Physics Reference"
            >
                <HelpCircle size={20} />
            </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
            {activeTab === 'sim' ? (
                <div className="flex flex-col lg:flex-row gap-8 min-h-full">
                
                {/* --- CONTROL PANEL --- */}
                <div className="w-full lg:w-1/3 space-y-8 bg-black/20 p-8 rounded-2xl border border-primary-light shadow-xl backdrop-blur-sm h-fit">
                    <div className="border-b border-primary-light pb-4 mb-4">
                        <h2 className="text-xl font-bold text-tint-10">Parameters</h2>
                        <p className="text-xs text-tint-25">Adjust scan settings to see real-time impact.</p>
                    </div>

                    {/* Sequence Selector */}
                    <div className="space-y-3 p-5 bg-primary-light/30 rounded-lg border border-primary-light shadow-inner">
                        <div className="flex justify-between items-start">
                            <label className="flex items-center gap-2 text-sm font-bold text-tint-15">
                                <Database className="w-4 h-4 text-accent" />
                                <span>Pulse Sequence</span>
                            </label>
                            <div className="text-right">
                                <div className="text-[10px] text-tint-25 font-mono uppercase">Seq Scan Time</div>
                                <div className={`text-xl font-mono tracking-wider ${scanTimeSeconds > 600 ? "text-red-400" : "text-secondary"}`}>
                                    {formatTime(scanTimeSeconds)}
                                </div>
                            </div>
                        </div>
                        
                        <select 
                            value={sequenceType}
                            onChange={(e) => setSequenceType(e.target.value)}
                            className="w-full bg-primary border border-primary-light text-tint-10 rounded p-2 text-sm focus:ring-2 focus:ring-secondary outline-none"
                        >
                            {Object.entries(sequences).map(([key, seq]) => (
                                <option key={key} value={key}>{seq.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-tint-20 mt-2 italic border-t border-primary-light pt-2 min-h-[40px]">
                            {currentSeq.description}
                        </p>
                        <div className="flex justify-between text-[10px] text-tint-25 font-mono pt-1">
                            <span>TR: {currentSeq.tr}ms</span>
                            <span>TE: {currentSeq.te}ms</span>
                        </div>
                    </div>

                    {/* NEX Slider */}
                    <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-sm font-medium text-tint-15">
                        <Repeat className="w-4 h-4 text-secondary" />
                        <span>NEX (Averages)</span>
                        </label>
                        <span className="text-secondary font-mono bg-secondary/10 px-2 py-1 rounded text-xs">{nex}</span>
                    </div>
                    <input 
                        type="range" min="1" max="4" step="1" value={nex} 
                        onChange={(e) => setNex(Number(e.target.value))}
                        className="w-full h-2 bg-primary-light rounded-lg appearance-none cursor-pointer accent-secondary hover:accent-secondary/80 transition-all"
                    />
                    <p className="text-xs text-tint-20">
                        Controls Signal-to-Noise Ratio (SNR). Higher NEX averages out random noise.
                    </p>
                    </div>

                    {/* Resolution Slider */}
                    <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-sm font-medium text-tint-15">
                        <Maximize2 className="w-4 h-4 text-secondary" />
                        <span>Matrix (Resolution)</span>
                        </label>
                        <span className="text-secondary font-mono bg-secondary/10 px-2 py-1 rounded text-xs">{resolution}²</span>
                    </div>
                    <input 
                        type="range" min="64" max="512" step="64" value={resolution} 
                        onChange={(e) => setResolution(Number(e.target.value))}
                        className="w-full h-2 bg-primary-light rounded-lg appearance-none cursor-pointer accent-secondary hover:accent-secondary/80 transition-all"
                    />
                    <p className="text-xs text-tint-20">
                        Higher resolution adds Phase Encoding steps, directly increasing scan time.
                    </p>
                    </div>

                    {/* Slice Thickness Slider */}
                    <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-sm font-medium text-tint-15">
                        <Layers className="w-4 h-4 text-accent" />
                        <span>Slice Thickness</span>
                        </label>
                        <span className="text-accent font-mono bg-accent/10 px-2 py-1 rounded text-xs">{sliceThickness} mm</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" step="1" value={sliceThickness} 
                        onChange={(e) => setSliceThickness(Number(e.target.value))}
                        className="w-full h-2 bg-primary-light rounded-lg appearance-none cursor-pointer accent-accent hover:accent-accent/80 transition-all"
                    />
                    <p className="text-xs text-tint-20">
                        Thinner slices need more passes/partitions (Time penalty) but reduce partial voluming.
                    </p>
                    </div>
                </div>

                {/* --- 3D MODEL PREVIEW COLUMN --- */}
                <div className="w-full lg:w-1/4 bg-black/20 p-6 rounded-2xl border border-primary-light flex flex-col items-center h-fit">
                    
                    {/* Dynamic Analysis Note */}
                    <div className="mb-6 p-4 bg-primary-light/40 border border-primary-light rounded-lg w-full">
                    <div className="flex items-center gap-2 mb-4 text-secondary text-sm font-bold uppercase tracking-wider">
                        <Activity className="w-4 h-4" />
                        Physics Trade-off Analysis
                    </div>
                    
                    {/* Iron Triangle Visualizer */}
                    <div className="space-y-4 mb-4">
                        {/* SNR Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-tint-10 font-bold">SNR (Signal-to-Noise)</span>
                                <span className="text-tint-25">{snrScore}%</span>
                            </div>
                            <div className="h-2 bg-primary rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${getScoreColor(snrScore)}`}
                                    style={{ width: `${snrScore}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-tint-25 mt-1">High SNR needs averages (NEX) or large voxels (Thick slices).</p>
                        </div>

                        {/* Resolution Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-tint-10 font-bold">Spatial Resolution</span>
                                <span className="text-tint-25">{resScore}%</span>
                            </div>
                            <div className="h-2 bg-primary rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${getScoreColor(resScore)}`}
                                    style={{ width: `${resScore}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-tint-25 mt-1">Dependent on Matrix size and Slice Thickness.</p>
                        </div>

                        {/* Time Bar (Inverted: High Score = Fast Scan) */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-accent font-bold">Speed efficiency</span>
                                <span className="text-tint-25">{timeScore}%</span>
                            </div>
                            <div className="h-2 bg-primary rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${getScoreColor(timeScore)}`}
                                    style={{ width: `${Math.max(5, timeScore)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-tint-25 mt-1">High Resolution & NEX kill scan speed.</p>
                        </div>
                    </div>

                    <div className="text-xs text-tint-20 italic border-t border-primary-light pt-3">
                        "The Iron Triangle": You cannot maximize all three. 
                        {scanTimeSeconds < 120 && resolution < 256 && " Fast scan, but low resolution."}
                        {resolution > 300 && nex > 2 && " Excellent quality, but patient must be still for long periods."}
                        {sliceThickness > 5 && " High SNR, but poor 3D reformats due to partial voluming."}
                    </div>
                    </div>

                    <h3 className="text-lg font-bold text-tint-15 mb-6 flex items-center gap-2">
                        <Layers className="text-accent" size={20}/> 3D Reconstruction Impact
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
                                        className="w-full bg-secondary/30 border border-secondary/50 rounded-sm transition-all duration-300 backdrop-blur-sm"
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
                    <p className="mt-8 text-center text-xs text-tint-25">
                        {sliceThickness <= 1 
                            ? "Isotropic (1mm): Smooth, continuous 3D surface." 
                            : sliceThickness <= 3 
                                ? "3mm Slices: Slight jaggedness on dome, generally acceptable." 
                                : "Thick Slices: Severe 'pancake' artifacting destroys 3D utility."}
                    </p>
                </div>

                {/* --- MRI VIEWPORT --- */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[500px]">
                    <div className="relative w-full max-w-lg aspect-square bg-black rounded-full overflow-hidden border-8 border-primary-light shadow-2xl ring-1 ring-primary-light/50">
                    
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
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-tint-20">
                        F.O.V: 240mm
                    </div>
                    </div>
                </div>
                </div>
            ) : (
                <ScheduleView scanTimeSeconds={scanTimeSeconds} />
            )}
        </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-primary border border-primary-light w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl relative">
                <button 
                    onClick={() => setShowHelp(false)}
                    className="absolute top-4 right-4 p-2 text-tint-20 hover:text-white hover:bg-primary-light rounded-full"
                >
                    <X size={24} />
                </button>
                
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-secondary mb-2 flex items-center gap-2">
                        <MriIcon /> MRI Sim Help
                    </h2>
                    <p className="text-tint-20 mb-6 border-b border-primary-light pb-4">
                        A rudimentary MRI trade-off simulator designed to demonstrate the "Iron Triangle" of MRI physics: 
                        <strong className="text-tint-5"> Signal-to-Noise Ratio (SNR)</strong>, 
                        <strong className="text-tint-5"> Spatial Resolution</strong>, and 
                        <strong className="text-tint-5"> Scan Time</strong>.
                    </p>

                    <h3 className="text-lg font-bold text-white mb-3">Controls</h3>
                    <ul className="space-y-2 mb-6 text-sm text-tint-15">
                        <li><strong className="text-secondary">NEX (Number of Excitations):</strong> Averages multiple signals to reduce random noise. Increases scan time linearly.</li>
                        <li><strong className="text-secondary">Matrix (Resolution):</strong> Higher matrix (e.g., 512x512) means smaller pixels and better detail, but requires more phase-encoding steps, increasing scan time.</li>
                        <li><strong className="text-accent">Slice Thickness:</strong> Thinner slices reduce partial volume averaging (less stair-stepping) but reduce SNR (less proton signal per voxel) and often increase scan time for 3D volumes.</li>
                    </ul>

                    <h3 className="text-lg font-bold text-white mb-3">Pulse Sequence Reference</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left mb-4">
                            <thead className="text-tint-20 uppercase bg-primary-light/50">
                                <tr>
                                    <th className="p-2">Sequence</th>
                                    <th className="p-2">TR (ms)</th>
                                    <th className="p-2">TE (ms)</th>
                                    <th className="p-2">Usage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-light text-tint-15">
                                <tr>
                                    <td className="p-2 font-bold text-accent">UTE</td>
                                    <td className="p-2">10</td>
                                    <td className="p-2">0.05</td>
                                    <td className="p-2">Cortical bone, Tendon (Very short TE)</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-bold text-accent">3D GRE</td>
                                    <td className="p-2">20</td>
                                    <td className="p-2">5</td>
                                    <td className="p-2">Fast cartilage acquisition</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-bold text-accent">3D FSE</td>
                                    <td className="p-2">1500</td>
                                    <td className="p-2">30</td>
                                    <td className="p-2">High SNR 3D Volume (Long TR)</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-bold text-accent">PD FSE</td>
                                    <td className="p-2">3000</td>
                                    <td className="p-2">30</td>
                                    <td className="p-2">Clinical Gold Standard (Meniscus)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3">Glossary</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-tint-20">
                        <div>
                            <dt className="font-bold text-secondary">TR (Repetition Time)</dt>
                            <dd>Time between RF excitation pulses. Determines T1 weighting and total scan duration.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-secondary">TE (Echo Time)</dt>
                            <dd>Time from excitation to signal collection. Determines T2 weighting and susceptibility.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-accent">ETL (Echo Train Length)</dt>
                            <dd>Number of echoes collected per TR in FSE sequences. High ETL speeds up scanning but can cause blurring.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-accent">FOV (Field of View)</dt>
                            <dd>The physical area covered by the image (e.g., 24cm). Smaller FOV increases resolution but reduces SNR.</dd>
                        </div>
                         <div>
                            <dt className="font-bold text-secondary">PD (Proton Density)</dt>
                            <dd>Image contrast dependent primarily on the density of protons (Hydrogen) in tissue, minimizing T1/T2 effects.</dd>
                        </div>
                         <div>
                            <dt className="font-bold text-accent">GRE / FSE</dt>
                            <dd>Gradient Recalled Echo vs Fast Spin Echo. Different methods of creating the echo signal.</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MRISimulator;
