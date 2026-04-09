export const PIXEL_HUD = {
  overlayBackdrop: 'bg-[rgba(8,6,3,0.78)]',
  panel:
    'border-2 border-[#5e4820] bg-[#12100a] text-[#efe6c8] shadow-[4px_4px_0_#1d1408,inset_0_0_0_1px_#2f2410]',
  panelMuted:
    'border-2 border-[#4d3c1d] bg-[#0d0c08] text-[#d9cfad] shadow-[3px_3px_0_#1b1308,inset_0_0_0_1px_#2a1f0f]',
  panelDanger:
    'border-2 border-[#7a3024] bg-[#1b0908] text-[#f0d6c8] shadow-[4px_4px_0_#220a08,inset_0_0_0_1px_#3d1711]',
  panelSuccess:
    'border-2 border-[#476934] bg-[#0f170a] text-[#d7ebc4] shadow-[4px_4px_0_#10170b,inset_0_0_0_1px_#27331e]',
  heading: 'font-mono uppercase tracking-[0.22em] text-[#e0c881]',
  subHeading: 'font-mono uppercase tracking-[0.16em] text-[#bba879]',
  text: 'font-mono text-[#efe6c8]',
  hint: 'font-mono text-[#a7966d]',
  tag: 'border border-[#6e562a] bg-[#20170c] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d5bc7a]',
  buttonBase:
    'border-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-100 active:translate-y-px',
  buttonPrimary:
    'border-[#8a6a2b] bg-[#b28a3b] text-[#1d1204] shadow-[2px_2px_0_#4d3713] hover:bg-[#c59a44]',
  buttonSecondary:
    'border-[#5e4820] bg-[#241a0d] text-[#d9c896] shadow-[2px_2px_0_#171108] hover:bg-[#2d2010]',
  buttonDisabled:
    'cursor-not-allowed border-[#3f341d] bg-[#17130a] text-[#7b6c4a] shadow-[2px_2px_0_#0f0c07]',
  barTrack: 'border border-[#4b3a18] bg-[#0c0a06] p-[2px]',
  barFillAmber: 'bg-[#c79a43]',
  barFillGreen: 'bg-[#74a248]',
  barFillRed: 'bg-[#b14635]',
} as const;

