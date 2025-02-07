// Placeholder assets as data URLs for development
export const placeholderAssets = {
  // Player character - spritesheet with run and jump frames
  player: `data:image/svg+xml;base64,${btoa(`
    <svg width="192" height="32" xmlns="http://www.w3.org/2000/svg">
      <!-- Frame 1: Standing -->
      <g transform="translate(0,0)">
        <rect x="2" y="2" width="28" height="28" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
      </g>
      <!-- Frame 2: Run 1 -->
      <g transform="translate(32,0)">
        <rect x="2" y="2" width="28" height="28" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="2" y="24" width="8" height="6" fill="#2980b9"/>
      </g>
      <!-- Frame 3: Run 2 -->
      <g transform="translate(64,0)">
        <rect x="2" y="2" width="28" height="28" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="22" y="24" width="8" height="6" fill="#2980b9"/>
      </g>
      <!-- Frame 4: Run 3 -->
      <g transform="translate(96,0)">
        <rect x="2" y="2" width="28" height="28" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="2" y="24" width="8" height="6" fill="#2980b9"/>
      </g>
      <!-- Frame 5: Jump start -->
      <g transform="translate(128,0)">
        <rect x="2" y="2" width="28" height="26" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
      </g>
      <!-- Frame 6: Jump peak -->
      <g transform="translate(160,0)">
        <rect x="2" y="2" width="28" height="24" fill="#4a90e2" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
      </g>
    </svg>
  `)}`,

  // Enemy character - spritesheet with walk animation
  enemy: `data:image/svg+xml;base64,${btoa(`
    <svg width="128" height="32" xmlns="http://www.w3.org/2000/svg">
      <!-- Frame 1: Walk 1 -->
      <g transform="translate(0,0)">
        <rect x="2" y="2" width="28" height="28" fill="#e74c3c" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="2" y="24" width="8" height="6" fill="#c0392b"/>
      </g>
      <!-- Frame 2: Walk 2 -->
      <g transform="translate(32,0)">
        <rect x="2" y="2" width="28" height="28" fill="#e74c3c" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="22" y="24" width="8" height="6" fill="#c0392b"/>
      </g>
      <!-- Frame 3: Walk 3 -->
      <g transform="translate(64,0)">
        <rect x="2" y="2" width="28" height="28" fill="#e74c3c" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="2" y="24" width="8" height="6" fill="#c0392b"/>
      </g>
      <!-- Frame 4: Walk 4 -->
      <g transform="translate(96,0)">
        <rect x="2" y="2" width="28" height="28" fill="#e74c3c" rx="4"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="20" cy="12" r="3" fill="white"/>
        <rect x="22" y="24" width="8" height="6" fill="#c0392b"/>
      </g>
    </svg>
  `)}`,

  // Platform - detailed platform with grass and dirt
  platform: `data:image/svg+xml;base64,${btoa(`
    <svg width="64" height="24" xmlns="http://www.w3.org/2000/svg">
      <!-- Main platform body -->
      <rect y="4" width="64" height="20" fill="#8B4513"/>
      <!-- Top grass layer -->
      <rect width="64" height="6" fill="#2ecc71"/>
      <!-- Grass tufts -->
      <path d="M5 0 L8 -2 L11 0" stroke="#27ae60" stroke-width="1" fill="none"/>
      <path d="M20 0 L23 -3 L26 0" stroke="#27ae60" stroke-width="1" fill="none"/>
      <path d="M40 0 L43 -2 L46 0" stroke="#27ae60" stroke-width="1" fill="none"/>
      <path d="M55 0 L58 -3 L61 0" stroke="#27ae60" stroke-width="1" fill="none"/>
      <!-- Dirt details -->
      <rect x="10" y="10" width="4" height="4" fill="#6B3000"/>
      <rect x="30" y="12" width="3" height="3" fill="#6B3000"/>
      <rect x="50" y="8" width="5" height="5" fill="#6B3000"/>
    </svg>
  `)}`,

  // Platform Small - for decoration
  platformSmall: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="12" xmlns="http://www.w3.org/2000/svg">
      <rect y="2" width="32" height="10" fill="#8B4513"/>
      <rect width="32" height="3" fill="#2ecc71"/>
    </svg>
  `)}`,

  // Background layer 1 - distant mountains with details
  bgLayer1: `data:image/svg+xml;base64,${btoa(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
      <!-- Sky gradient with more color stops -->
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0f9b8e"/>
          <stop offset="40%" style="stop-color:#1abc9c"/>
          <stop offset="70%" style="stop-color:#5daeeb"/>
          <stop offset="100%" style="stop-color:#87ceeb"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#skyGradient)"/>
      
      <!-- Enhanced sun with glow effect -->
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#f1c40f"/>
          <stop offset="80%" style="stop-color:#f1c40f"/>
          <stop offset="100%" style="stop-color:#f1c40f00"/>
        </radialGradient>
      </defs>
      <circle cx="1440" cy="180" r="100" fill="url(#sunGlow)"/>
      <circle cx="1440" cy="180" r="80" fill="#f1c40f"/>
      
      <!-- Distant mountains with more detail -->
      <path d="M0 720 L480 360 L960 630 L1440 270 L1920 720 L1920 1080 L0 1080 Z" 
            fill="#34495e" 
            stroke="#2c3e50" 
            stroke-width="2"/>
      
      <!-- Enhanced mountain details -->
      <path d="M432 396 L480 360 L528 396 L480 380 Z" fill="#2c3e50"/>
      <path d="M1392 306 L1440 270 L1488 306 L1440 290 Z" fill="#2c3e50"/>
      
      <!-- Detailed snow caps -->
      <path d="M456 378 L480 360 L504 378 Q480 370 456 378" fill="white"/>
      <path d="M1416 288 L1440 270 L1464 288 Q1440 280 1416 288" fill="white"/>
      
      <!-- Additional mountain range for depth -->
      <path d="M-100 800 L400 600 L900 750 L1400 580 L1920 770 L1920 1080 L-100 1080 Z" 
            fill="#2c3e50" 
            fill-opacity="0.5"/>
            
      <!-- Subtle cloud details -->
      <path d="M200 200 Q300 180 400 200 Q500 180 600 200 Q500 220 400 200 Q300 220 200 200" 
            fill="white" 
            fill-opacity="0.2"/>
      <path d="M1200 300 Q1300 280 1400 300 Q1500 280 1600 300 Q1500 320 1400 300 Q1300 320 1200 300" 
            fill="white" 
            fill-opacity="0.2"/>
    </svg>
  `)}`,

  // Background layer 2 - closer hills with details
  bgLayer2: `data:image/svg+xml;base64,${btoa(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
      <!-- Closer hills with enhanced detail -->
      <path d="M0 810 L720 540 L1200 720 L1680 450 L1920 810 L1920 1080 L0 1080 Z" 
            fill="#2c3e50"
            stroke="#34495e"
            stroke-width="2"/>
      
      <!-- Enhanced hill details with smoother curves -->
      <path d="M240 900 Q360 864 480 900 T720 900" 
            fill="none" 
            stroke="#34495e" 
            stroke-width="3"
            stroke-opacity="0.6"/>
      
      <path d="M960 936 Q1080 900 1200 936 T1440 936" 
            fill="none" 
            stroke="#34495e" 
            stroke-width="3"
            stroke-opacity="0.6"/>
      
      <path d="M1440 864 Q1560 828 1680 864" 
            fill="none" 
            stroke="#34495e" 
            stroke-width="3"
            stroke-opacity="0.6"/>
            
      <!-- Additional terrain details -->
      <path d="M0 900 L1920 900 L1920 1080 L0 1080 Z" 
            fill="#2c3e50"
            fill-opacity="0.3"/>
    </svg>
  `)}`,

  // Background layer 3 - foreground elements
  bgLayer3: `data:image/svg+xml;base64,${btoa(`
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
      <!-- Enhanced clouds with more detail -->
      <path d="M240 180 Q360 144 480 180 Q600 144 720 180 Q600 216 480 180 Q360 216 240 180" 
            fill="white" 
            fill-opacity="0.8"/>
      
      <path d="M1200 270 Q1320 234 1440 270 Q1560 234 1680 270 Q1560 306 1440 270 Q1320 306 1200 270" 
            fill="white" 
            fill-opacity="0.8"/>
      
      <!-- Enhanced floating platforms -->
      <g transform="translate(120,720)">
        <rect width="96" height="24" fill="#2ecc71" rx="4"/>
        <rect y="6" width="96" height="18" fill="#27ae60" rx="2"/>
      </g>
      
      <g transform="translate(720,630)">
        <rect width="72" height="19" fill="#2ecc71" rx="4"/>
        <rect y="5" width="72" height="14" fill="#27ae60" rx="2"/>
      </g>
      
      <g transform="translate(1440,810)">
        <rect width="120" height="29" fill="#2ecc71" rx="4"/>
        <rect y="7" width="120" height="22" fill="#27ae60" rx="2"/>
      </g>
    </svg>
  `)}`,

  // UI Button
  button: `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" fill="#3498db" rx="8"/>
    </svg>
  `)}`,

  // Collectible - simple star
  collectible: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 15,9 22,9 16,14 19,21 12,17 5,21 8,14 2,9 9,9" fill="#f1c40f"/>
    </svg>
  `)}`
}; 