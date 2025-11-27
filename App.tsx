
import React, { useRef, useEffect, useState } from 'react';
import { GRID_SIZE, COLORS } from './constants';
import { useGameLogic } from './hooks/useGameLogic';
import { GameStatus, ItemType, Direction, ObstacleType } from './types';

// SVGs for 8-bit Icons

const CoinIcon = () => (
  <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
    {/* Dark Outline */}
    <path d="M4 1 H8 V2 H10 V4 H11 V8 H10 V10 H8 V11 H4 V10 H2 V8 H1 V4 H2 V2 H4 Z" fill="#78350f" />
    {/* Gold Face */}
    <path d="M4 2 H8 V3 H9 V4 H10 V8 H9 V9 H8 V10 H4 V9 H3 V8 H2 V4 H3 V3 H4 Z" fill="#fbbf24" />
    {/* Shine / Detail */}
    <rect x="3" y="3" width="1" height="1" fill="#fef3c7" />
    <rect x="4" y="4" width="1" height="4" fill="#d97706" opacity="0.5" />
    <rect x="7" y="4" width="1" height="4" fill="#d97706" opacity="0.5" />
    {/* Animation */}
    <rect x="5" y="4" width="2" height="4" fill="#fef3c7" className="animate-pulse" opacity="0.8" />
  </svg>
);

const GemIcon = () => (
  <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-md animate-pulse" shapeRendering="crispEdges">
    {/* Outline */}
    <path d="M4 1 H8 V2 H10 V4 H11 V6 H10 V9 H8 V11 H4 V9 H2 V6 H1 V4 H2 V2 H4 Z" fill="#0369a1" />
    {/* Inner Gem */}
    <path d="M4 2 H8 V3 H9 V4 H10 V6 H9 V8 H8 V10 H4 V8 H3 V6 H2 V4 H3 V3 H4 Z" fill="#38bdf8" />
    {/* Facets / Shine */}
    <rect x="4" y="2" width="4" height="1" fill="#e0f2fe" />
    <rect x="3" y="3" width="1" height="1" fill="#e0f2fe" />
    <rect x="5" y="5" width="2" height="2" fill="#bae6fd" opacity="0.5" />
    <rect x="4" y="7" width="4" height="1" fill="#0284c7" opacity="0.5" />
  </svg>
);

const PotionIcon = () => (
  <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
    {/* Cork */}
    <rect x="5" y="1" width="2" height="1" fill="#78350f" />
    {/* Bottle Neck Outline */}
    <rect x="5" y="2" width="2" height="2" fill="#991b1b" />
    {/* Bottle Body Outline */}
    <path d="M4 4 H8 V5 H9 V10 H8 V11 H4 V10 H3 V5 H4 Z" fill="#991b1b" />
    {/* Liquid */}
    <rect x="4" y="5" width="4" height="5" fill="#ef4444" />
    <rect x="3" y="6" width="1" height="4" fill="#ef4444" />
    <rect x="8" y="6" width="1" height="4" fill="#ef4444" />
    {/* Shine / Glass */}
    <rect x="4" y="5" width="1" height="2" fill="#fecaca" opacity="0.8" />
    <rect x="5" y="6" width="1" height="1" fill="#fecaca" opacity="0.8" />
    {/* Bubbles */}
    <rect x="6" y="8" width="1" height="1" fill="#fee2e2" className="animate-bounce" style={{ animationDuration: '2s' }} />
  </svg>
);

const HourglassIcon = () => (
  <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
    {/* Frame Wood */}
    <rect x="2" y="1" width="8" height="1" fill="#854d0e" />
    <rect x="2" y="10" width="8" height="1" fill="#854d0e" />
    {/* Glass Outline */}
    <path d="M3 2 H9 V3 H8 V5 H7 V6 H5 V7 H4 V9 H3 Z" fill="#52525b" opacity="0.5" />
    <path d="M9 2 V3 H8 V5 H7 V6 H5 V7 H4 V9 H3 V10 H9 V9 H8 V7 H7 V6 H5 V5 H4 V3 H3 V2 Z" fill="none" stroke="#52525b" strokeWidth="1" />
    {/* Sand Top */}
    <path d="M4 3 H8 V4 H7 V5 H5 V4 H4 Z" fill="#facc15" className="animate-pulse" />
    {/* Sand Bottom (Pile) */}
    <path d="M5 8 H7 V9 H8 V10 H4 V9 H5 Z" fill="#facc15" />
    {/* Falling Grain */}
    <rect x="5" y="6" width="2" height="1" fill="#facc15" className="animate-ping" style={{ animationDuration: '1s' }} />
  </svg>
);

const RockIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Main Body */}
    <path d="M4 14 H12 V13 H13 V7 H11 V5 H9 V4 H6 V5 H4 V7 H3 V13 H4 Z" fill="#57534e" />
    
    {/* Shadow / Depth */}
    <path d="M4 13 H12 V14 H4 Z" fill="#292524" opacity="0.5" />
    <path d="M12 13 V7 H13 V13 Z" fill="#292524" opacity="0.3" />
    
    {/* Highlights */}
    <rect x="5" y="6" width="2" height="2" fill="#a8a29e" opacity="0.5" />
    <rect x="9" y="5" width="2" height="1" fill="#a8a29e" opacity="0.5" />
    
    {/* Cracks */}
    <rect x="7" y="9" width="3" height="1" fill="#292524" opacity="0.3" />
    <rect x="8" y="10" width="1" height="1" fill="#292524" opacity="0.3" />

    {/* Glint animation */}
    <rect x="5" y="6" width="1" height="1" fill="#e7e5e4" className="animate-pulse" />
  </svg>
);

const RedRockIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Base Shape - Taller Mesa */}
    <path d="M3 14 H13 V12 H12 V6 H11 V4 H5 V6 H4 V12 H3 Z" fill="#7c2d12" />
    
    {/* Layer 1 (Darker bottom) */}
    <rect x="3" y="12" width="10" height="2" fill="#451a03" opacity="0.5" />
    
    {/* Layer 2 (Orange Stripe) */}
    <rect x="4" y="8" width="8" height="2" fill="#ea580c" />
    
    {/* Layer 3 (Top Highlight) */}
    <rect x="5" y="4" width="6" height="2" fill="#c2410c" />

    {/* Heat Haze Pulse */}
    <rect x="4" y="9" width="8" height="1" fill="#fdba74" opacity="0.4" className="animate-pulse" />
    <rect x="5" y="5" width="6" height="1" fill="#fdba74" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
  </svg>
);

const IceSpikeIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Main Crystal Mass */}
    <path d="M2 14 H14 V12 H13 V9 H11 V4 H8 V2 H6 V5 H4 V10 H2 Z" fill="#0891b2" />
    
    {/* Lighter Facet (Left) */}
    <path d="M4 12 V10 H6 V5 H8 V2 L6 11 L4 12" fill="#22d3ee" />
    
    {/* Highlight Facet (Top/Edge) */}
    <path d="M6 5 L8 2 L11 4 L8 6 Z" fill="#cffafe" />
    
    {/* Deep Shadow (Right/Bottom) */}
    <path d="M11 4 L13 9 V12 H14 V14 H2 V13 H13 V9 L11 4" fill="#164e63" opacity="0.4" />

    {/* Sparkle */}
    <rect x="7" y="3" width="1" height="1" fill="#ffffff" className="animate-pulse" />
    <rect x="5" y="8" width="1" height="1" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
    <rect x="11" y="6" width="1" height="1" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Building Body */}
    <rect x="3" y="2" width="10" height="14" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
    <rect x="4" y="2" width="8" height="1" fill="#334155" /> {/* Roof trim */}
    
    {/* Windows (Lit) */}
    <rect x="5" y="4" width="2" height="2" fill="#facc15" className="animate-pulse" />
    <rect x="9" y="4" width="2" height="2" fill="#0ea5e9" />
    
    <rect x="5" y="8" width="2" height="2" fill="#334155" /> {/* Dark window */}
    <rect x="9" y="8" width="2" height="2" fill="#facc15" />
    
    <rect x="5" y="12" width="2" height="2" fill="#f43f5e" />
    <rect x="9" y="12" width="2" height="2" fill="#334155" />

    {/* Antenna */}
    <rect x="7" y="0" width="1" height="2" fill="#94a3b8" />
    <rect x="8" y="0" width="1" height="2" fill="#64748b" />
    <rect x="7" y="0" width="1" height="1" fill="#ef4444" className="animate-ping" />
  </svg>
);

const AlienPodIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Main Egg Shape - Pixelated */}
    <path d="M6 14 H10 V13 H11 V11 H12 V8 H11 V5 H10 V4 H6 V5 H5 V8 H4 V11 H5 V13 H6 Z" fill="#581c87" />
    
    {/* Darker Base / Shadow */}
    <rect x="5" y="12" width="6" height="2" fill="#3b0764" />

    {/* Glowing Core / Spots */}
    <rect x="7" y="6" width="2" height="2" fill="#d946ef" className="animate-pulse" />
    <rect x="5" y="9" width="1" height="1" fill="#a855f7" />
    <rect x="10" y="8" width="1" height="1" fill="#d946ef" className="animate-pulse" style={{ animationDelay: '0.3s' }} />

    {/* Tendrils */}
    <rect x="3" y="13" width="2" height="1" fill="#3b0764" />
    <rect x="2" y="14" width="1" height="1" fill="#3b0764" />
    
    <rect x="11" y="13" width="2" height="1" fill="#3b0764" />
    <rect x="13" y="14" width="1" height="1" fill="#3b0764" />
  </svg>
);

const LakeIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Outline / Deep Water (Pixelated Circle Shape) */}
    <path 
      d="M5 1 H11 V2 H14 V5 H15 V11 H14 V14 H11 V15 H5 V14 H2 V11 H1 V5 H2 V2 H5 Z" 
      fill="#1d4ed8" 
    />
    {/* Main Water Body (Lighter) - 1px inset */}
    <path 
      d="M5 2 H11 V3 H13 V5 H14 V11 H13 V13 H11 V14 H5 V13 H3 V11 H2 V5 H3 V3 H5 Z" 
      fill="#3b82f6" 
    />
    {/* Highlights / Ripples - Pulsing */}
    <rect x="4" y="4" width="2" height="1" fill="#bfdbfe" opacity="0.9" className="animate-pulse" style={{ animationDelay: '0s' }} />
    <rect x="8" y="5" width="1" height="1" fill="#bfdbfe" opacity="0.9" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
    <rect x="10" y="10" width="2" height="1" fill="#bfdbfe" opacity="0.7" className="animate-pulse" style={{ animationDelay: '1s' }} />
    <rect x="4" y="11" width="3" height="1" fill="#bfdbfe" opacity="0.7" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
  </svg>
);

const IceHoleIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Ice Rim */}
    <path 
      d="M5 1 H11 V2 H14 V5 H15 V11 H14 V14 H11 V15 H5 V14 H2 V11 H1 V5 H2 V2 H5 Z" 
      fill="#e2e8f0" 
    />
    {/* Deep Water */}
    <path 
      d="M5 3 H11 V4 H13 V6 H14 V10 H13 V12 H11 V13 H5 V12 H3 V10 H2 V6 H3 V4 H5 Z" 
      fill="#1e3a8a" 
    />
    {/* Highlight in water - Ripples */}
    <rect x="4" y="5" width="2" height="1" fill="#3b82f6" opacity="0.5" className="animate-pulse" />
    <rect x="10" y="9" width="1" height="1" fill="#3b82f6" opacity="0.5" className="animate-pulse" style={{ animationDelay: '1s' }} />
  </svg>
);

const CactusIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
      {/* Main Stem */}
      <rect x="6" y="3" width="4" height="12" fill="#15803d" />
      <rect x="6" y="3" width="4" height="1" fill="#166534" /> {/* Top shadow */}
      
      {/* Left Arm */}
      <rect x="2" y="6" width="4" height="3" fill="#15803d" />
      <rect x="2" y="5" width="2" height="2" fill="#15803d" />

      {/* Right Arm */}
      <rect x="10" y="7" width="4" height="3" fill="#15803d" />
      <rect x="12" y="4" width="2" height="3" fill="#15803d" />

      {/* Spikes / Details - Pulsing */}
      <rect x="7" y="5" width="1" height="1" fill="#86efac" className="animate-pulse" />
      <rect x="8" y="9" width="1" height="1" fill="#86efac" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <rect x="7" y="12" width="1" height="1" fill="#86efac" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
      <rect x="3" y="6" width="1" height="1" fill="#86efac" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
      <rect x="13" y="5" width="1" height="1" fill="#86efac" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
   </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Side View Retro Sedan */}
    
    {/* Wheels */}
    <rect x="2" y="11" width="3" height="3" fill="#171717" />
    <rect x="11" y="11" width="3" height="3" fill="#171717" />
    <rect x="3" y="12" width="1" height="1" fill="#525252" /> {/* Hubcap */}
    <rect x="12" y="12" width="1" height="1" fill="#525252" />

    {/* Car Body (Lower) */}
    <rect x="1" y="8" width="14" height="4" fill="#dc2626" />
    <rect x="1" y="8" width="14" height="1" fill="#ef4444" /> {/* Highlight top edge */}
    
    {/* Car Roof / Cabin */}
    <rect x="3" y="5" width="9" height="3" fill="#dc2626" />
    
    {/* Windows */}
    <rect x="4" y="6" width="3" height="2" fill="#bae6fd" />
    <rect x="8" y="6" width="3" height="2" fill="#bae6fd" />
    
    {/* Bumpers */}
    <rect x="0" y="10" width="1" height="2" fill="#991b1b" />
    <rect x="15" y="10" width="1" height="2" fill="#991b1b" />

    {/* Headlight */}
    <rect x="15" y="9" width="1" height="1" fill="#facc15" className="animate-pulse" />
    
    {/* Taillight */}
    <rect x="0" y="9" width="1" height="1" fill="#7f1d1d" />
  </svg>
);

const AcidPoolIcon = () => (
  <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
    {/* Toxic Rim */}
    <path 
      d="M5 2 H11 V3 H13 V5 H14 V11 H13 V13 H11 V14 H5 V13 H3 V11 H2 V5 H3 V3 H5 Z" 
      fill="#3f6212" 
    />
    {/* Acid Liquid */}
    <path 
      d="M5 3 H11 V4 H13 V6 H14 V10 H13 V12 H11 V13 H5 V12 H3 V10 H2 V6 H3 V4 H5 Z" 
      fill="#84cc16" 
    />
    
    {/* Bubbles */}
    <rect x="6" y="5" width="2" height="2" fill="#d9f99d" className="animate-ping" style={{ animationDuration: '2s' }} />
    <rect x="10" y="10" width="1" height="1" fill="#d9f99d" className="animate-ping" style={{ animationDelay: '1s', animationDuration: '1.5s' }} />
    <rect x="4" y="9" width="1" height="1" fill="#d9f99d" />
  </svg>
);

interface PlayerSpriteProps {
  facing: Direction;
  frame: boolean;
}

const PlayerSprite: React.FC<PlayerSpriteProps> = ({ facing, frame }) => {
  // Helpers for leg animation
  const legOffset = frame ? 1 : 0;
  
  // Transform for left/right mirroring
  const isLeft = facing === 'LEFT';
  const transform = isLeft ? 'scaleX(-1)' : undefined;
  const transformOrigin = isLeft ? 'center' : undefined;

  // Render logic based on direction
  const renderBody = () => {
    if (facing === 'UP') {
      return (
        <>
          {/* Back of Head */}
          <rect x="3" y="1" width="6" height="4" fill="#78350f" />
          <rect x="2" y="3" width="8" height="2" fill="#78350f" />
          {/* Body Back */}
          <rect x="2" y="6" width="8" height="4" fill="#2563eb" />
          <rect x="4" y="6" width="4" height="3" fill="#1d4ed8" />
          {/* Arms */}
          <rect x="1" y="6" width="1" height="3" fill="#fdba74" />
          <rect x="10" y="6" width="1" height="3" fill="#fdba74" />
          {/* Legs (Animated) */}
          <rect x="3" y={10 + (frame ? 0 : -1)} width="2" height={frame ? 2 : 1} fill="#1e293b" />
          <rect x="7" y={10 + (frame ? -1 : 0)} width="2" height={frame ? 1 : 2} fill="#1e293b" />
        </>
      );
    } else if (facing === 'RIGHT' || facing === 'LEFT') {
      return (
        <>
           {/* Head Side */}
           <rect x="4" y="1" width="5" height="2" fill="#78350f" />
           <rect x="3" y="2" width="2" height="3" fill="#78350f" /> {/* Hair back */}
           <rect x="4" y="3" width="5" height="3" fill="#fdba74" />
           <rect x="8" y="4" width="1" height="1" fill="#000" /> {/* Eye */}
           {/* Body Side */}
           <rect x="4" y="6" width="4" height="4" fill="#2563eb" />
           {/* Arm (swinging) */}
           <rect x={frame ? 6 : 5} y="7" width="1" height="3" fill="#fdba74" />
           {/* Legs (Walking stride) */}
           {frame ? (
             <>
               <rect x="3" y="10" width="2" height="2" fill="#1e293b" /> {/* Back leg */}
               <rect x="7" y="10" width="2" height="2" fill="#1e293b" /> {/* Front leg */}
             </>
           ) : (
             <>
               <rect x="5" y="10" width="2" height="2" fill="#1e293b" /> {/* Standing */}
             </>
           )}
        </>
      )
    } 
    
    // Default: DOWN
    return (
      <>
        {/* Hat/Hair */}
        <rect x="3" y="1" width="6" height="2" fill="#78350f" /> 
        <rect x="4" y="0" width="4" height="1" fill="#78350f" /> 
        {/* Face */}
        <rect x="3" y="3" width="6" height="3" fill="#fdba74" />
        <rect x="4" y="4" width="1" height="1" fill="#000" /> {/* Eye L */}
        <rect x="7" y="4" width="1" height="1" fill="#000" /> {/* Eye R */}
        {/* Body */}
        <rect x="2" y="6" width="8" height="4" fill="#2563eb" /> {/* Shirt */}
        <rect x="4" y="7" width="4" height="3" fill="#1d4ed8" /> {/* Shirt detail */}
        {/* Arms */}
        <rect x="1" y="6" width="1" height="3" fill="#fdba74" />
        <rect x="10" y="6" width="1" height="3" fill="#fdba74" />
        {/* Legs (Animated) */}
        <rect x="3" y={10 + (frame ? 0 : -1)} width="2" height={frame ? 2 : 1} fill="#1e293b" />
        <rect x="7" y={10 + (frame ? -1 : 0)} width="2" height={frame ? 1 : 2} fill="#1e293b" />
      </>
    );
  };

  return (
    <svg 
      viewBox="0 0 12 12" 
      className="w-full h-full drop-shadow-lg relative z-10" 
      style={{ transform, transformOrigin }}
    >
      {renderBody()}
    </svg>
  );
};

const GrassTile = ({ variant }: { variant: 'light' | 'dark' }) => {
  // Vibrant green palette
  const colors = variant === 'light' 
    ? { base: '#76c442', detail: '#5ea332', highlight: '#95d66d' } 
    : { base: '#6db83b', detail: '#56962f', highlight: '#8cc965' };

  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" preserveAspectRatio="none">
      <rect width="16" height="16" fill={colors.base} />
      
      {/* Texture: Grass blades / Noise */}
      <rect x="2" y="3" width="1" height="2" fill={colors.detail} />
      <rect x="3" y="4" width="1" height="1" fill={colors.detail} />
      
      <rect x="8" y="9" width="1" height="2" fill={colors.detail} />
      <rect x="9" y="10" width="1" height="1" fill={colors.detail} />
      
      <rect x="12" y="2" width="1" height="2" fill={colors.detail} />
      <rect x="13" y="3" width="1" height="1" fill={colors.detail} />

      <rect x="5" y="12" width="1" height="2" fill={colors.detail} />
      <rect x="6" y="13" width="1" height="1" fill={colors.detail} />
      
      {/* Highlights for texture depth */}
      <rect x="3" y="3" width="1" height="1" fill={colors.highlight} opacity="0.5" />
      <rect x="9" y="9" width="1" height="1" fill={colors.highlight} opacity="0.5" />
      <rect x="13" y="2" width="1" height="1" fill={colors.highlight} opacity="0.5" />
      <rect x="6" y="12" width="1" height="1" fill={colors.highlight} opacity="0.5" />
      
      {/* Random specks */}
      <rect x="0" y="0" width="1" height="1" fill={colors.detail} opacity="0.3" />
      <rect x="15" y="15" width="1" height="1" fill={colors.detail} opacity="0.3" />
      <rect x="14" y="6" width="1" height="1" fill={colors.detail} opacity="0.3" />
    </svg>
  );
};

const SandTile = ({ variant }: { variant: 'light' | 'dark' }) => {
  // Desert Sand Palette
  const colors = variant === 'light'
    ? { base: '#fcd34d', detail: '#f59e0b', highlight: '#fef3c7' } // Amber-300
    : { base: '#fbbf24', detail: '#d97706', highlight: '#fde68a' }; // Amber-400

  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" preserveAspectRatio="none">
      <rect width="16" height="16" fill={colors.base} />
      
      {/* Sand Ripples */}
      <rect x="2" y="3" width="2" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="8" y="8" width="2" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="12" y="12" width="2" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="4" y="10" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="6" y="4" width="1" height="1" fill={colors.detail} opacity="0.5" />

      {/* Highlights */}
      <rect x="1" y="14" width="1" height="1" fill={colors.highlight} opacity="0.6" />
      <rect x="14" y="2" width="1" height="1" fill={colors.highlight} opacity="0.6" />
    </svg>
  );
};

const SnowTile = ({ variant }: { variant: 'light' | 'dark' }) => {
  // Arctic Snow Palette
  const colors = variant === 'light'
    ? { base: '#f8fafc', detail: '#cbd5e1', highlight: '#ffffff' } // Slate-50
    : { base: '#e2e8f0', detail: '#94a3b8', highlight: '#f1f5f9' }; // Slate-200

  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" preserveAspectRatio="none">
      <rect width="16" height="16" fill={colors.base} />
      
      {/* Snow Drifts / Texture */}
      <rect x="1" y="1" width="2" height="1" fill={colors.highlight} opacity="0.8" />
      <rect x="12" y="3" width="2" height="1" fill={colors.highlight} opacity="0.8" />
      <rect x="5" y="10" width="2" height="1" fill={colors.highlight} opacity="0.8" />
      
      <rect x="3" y="4" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="10" y="12" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="14" y="8" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="7" y="2" width="1" height="1" fill={colors.detail} opacity="0.5" />

      {/* Blue tint hint */}
      <rect width="16" height="16" fill="#0ea5e9" opacity="0.05" />
    </svg>
  );
};

const AsphaltTile = ({ variant }: { variant: 'light' | 'dark' }) => {
  // City Asphalt Palette
  const colors = variant === 'light'
    ? { base: '#475569', detail: '#334155', highlight: '#64748b' } // Slate-600
    : { base: '#334155', detail: '#1e293b', highlight: '#475569' }; // Slate-700

  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" preserveAspectRatio="none">
      <rect width="16" height="16" fill={colors.base} />
      
      {/* Gritty texture */}
      <rect x="2" y="2" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="14" y="3" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="5" y="8" width="1" height="1" fill={colors.detail} opacity="0.5" />
      <rect x="10" y="12" width="1" height="1" fill={colors.detail} opacity="0.5" />
      
      {/* Highlights */}
      <rect x="3" y="5" width="1" height="1" fill={colors.highlight} opacity="0.3" />
      <rect x="12" y="10" width="1" height="1" fill={colors.highlight} opacity="0.3" />
      <rect x="8" y="2" width="1" height="1" fill={colors.highlight} opacity="0.3" />

      {/* Road Markings hint (optional, subtle) */}
      <rect x="7" y="0" width="2" height="16" fill="#000" opacity="0.1" />
    </svg>
  );
};

const AlienTile = ({ variant }: { variant: 'light' | 'dark' }) => {
  // Alien Purple Palette
  const colors = variant === 'light'
    ? { base: '#5b21b6', detail: '#4c1d95', highlight: '#7c3aed' } // Violet-800/900
    : { base: '#4c1d95', detail: '#2e1065', highlight: '#6d28d9' }; // Violet-900/950

  return (
    <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" preserveAspectRatio="none">
      <rect width="16" height="16" fill={colors.base} />
      
      {/* Craters */}
      <circle cx="4" cy="4" r="2" fill={colors.detail} />
      <circle cx="12" cy="10" r="1.5" fill={colors.detail} />
      
      {/* Veins */}
      <path d="M8 2 L9 4 L8 6" fill="none" stroke={colors.highlight} strokeWidth="0.5" opacity="0.4" />
      <path d="M2 12 L4 13 L5 11" fill="none" stroke={colors.highlight} strokeWidth="0.5" opacity="0.4" />

      {/* Specks */}
      <rect x="10" y="2" width="1" height="1" fill={colors.highlight} opacity="0.5" />
      <rect x="6" y="14" width="1" height="1" fill={colors.highlight} opacity="0.5" />
    </svg>
  );
};

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {muted ? (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#52525b"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#facc15"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </>
    )}
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="#16a34a" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="#fbbf24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const App: React.FC = () => {
  const { status, playerPos, items, obstacles, score, timeLeft, highScore, isSpeedBoosted, startGame, isMuted, toggleMute, togglePause, facing, walkFrame, level, targetScore } = useGameLogic();
  
  // Debug State for manual theme override
  const [forcedLevel, setForcedLevel] = useState<number | null>(null);

  // Ref to track previous position for transition logic
  const prevPosRef = useRef(playerPos);

  // Listen for Debug Keys
  useEffect(() => {
    const handleDebugKeys = (e: KeyboardEvent) => {
      // Only enable in playing state to avoid confusion, or generally
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        setForcedLevel(parseInt(e.key));
      } else if (e.key === '0') {
        setForcedLevel(null);
      }
    };
    window.addEventListener('keydown', handleDebugKeys);
    return () => window.removeEventListener('keydown', handleDebugKeys);
  }, []);

  // Determine Level Theme (Use override if present, else actual level)
  const currentDisplayLevel = forcedLevel ?? level;
  const isDesert = currentDisplayLevel === 2;
  const isArctic = currentDisplayLevel === 3;
  const isCity = currentDisplayLevel === 4;
  const isAlien = currentDisplayLevel >= 5;

  // Background color helper
  let containerBgClass = 'bg-green-800';
  if (isDesert) containerBgClass = 'bg-orange-800';
  if (isArctic) containerBgClass = 'bg-slate-800';
  if (isCity) containerBgClass = 'bg-gray-900';
  if (isAlien) containerBgClass = 'bg-indigo-950';

  // Update ref after render
  useEffect(() => {
    prevPosRef.current = playerPos;
  }, [playerPos]);

  // Calculate distance from previous position
  // If > 1.5 (e.g., 11 when wrapping from 0 to 11), we consider it a teleport
  const dist = Math.abs(playerPos.x - prevPosRef.current.x) + Math.abs(playerPos.y - prevPosRef.current.y);
  const isTeleporting = dist > 1.5;

  // Helper to calculate pixel position for items/player
  const getStyle = (x: number, y: number) => ({
    left: `${(x / GRID_SIZE) * 100}%`,
    top: `${(y / GRID_SIZE) * 100}%`,
    width: `${100 / GRID_SIZE}%`,
    height: `${100 / GRID_SIZE}%`,
  });

  // Render Obstacle Icon Helper
  const renderObstacle = (type: ObstacleType) => {
    if (type === ObstacleType.ROCK) {
        if (isDesert) return <RedRockIcon />;
        if (isArctic) return <IceSpikeIcon />;
        if (isCity) return <BuildingIcon />;
        if (isAlien) return <AlienPodIcon />;
        return <RockIcon />;
    } else {
        // Lake
        if (isDesert) return <CactusIcon />;
        if (isArctic) return <IceHoleIcon />;
        if (isCity) return <CarIcon />;
        if (isAlien) return <AcidPoolIcon />;
        return <LakeIcon />;
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#202020] text-white select-none overflow-hidden font-pixel">
      
      {/* Background Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      {/* HUD Header */}
      <div className="absolute top-4 w-full max-w-2xl px-4 flex justify-between items-end z-20">
        {/* Score Card */}
        <div className="flex flex-col gap-1 bg-amber-900/90 p-2 rounded border-2 border-amber-700 shadow-lg min-w-[100px]">
            <div className="flex justify-between items-center text-[10px] text-amber-200 uppercase tracking-widest">
               <span>Level {level}</span>
               {forcedLevel && <span className="text-red-400 font-bold ml-2">VIEW: {forcedLevel}</span>}
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xl text-yellow-400 pixel-text drop-shadow-md">{score}</span>
              <span className="text-[10px] text-amber-400/80">/ {targetScore}</span>
            </div>
        </div>

        {/* Center Title / Status */}
        <div className="flex flex-col items-center gap-2">
             {(status === GameStatus.PLAYING || status === GameStatus.PAUSED) && isSpeedBoosted && (
                <div className="animate-bounce bg-red-600 border border-red-400 text-white px-3 py-1 rounded-full text-[10px] shadow-lg">
                  SPEED POTION!
                </div>
             )}
             
             {/* Controls Group */}
             <div className="flex gap-2">
               {/* Sound Toggle */}
               <button 
                  onClick={toggleMute}
                  className="p-2 bg-amber-900/90 border-2 border-amber-700 rounded-full text-amber-100 hover:bg-amber-800 transition-colors shadow-lg"
                >
                  <VolumeIcon muted={isMuted} />
                </button>

               {/* Pause Toggle */}
               {(status === GameStatus.PLAYING || status === GameStatus.PAUSED) && (
                 <button 
                    onClick={togglePause}
                    className="p-2 bg-amber-900/90 border-2 border-amber-700 rounded-full text-amber-100 hover:bg-amber-800 transition-colors shadow-lg"
                 >
                   {status === GameStatus.PAUSED ? <PlayIcon /> : <PauseIcon />}
                 </button>
               )}
             </div>
        </div>

        {/* Time Card */}
        <div className="flex flex-col gap-1 text-right bg-amber-900/90 p-2 rounded border-2 border-amber-700 shadow-lg min-w-[100px]">
             <span className="text-[10px] text-amber-200 uppercase tracking-widest">Time</span>
             <span className={`text-xl pixel-text drop-shadow-md ${timeLeft < 10 && status === GameStatus.PLAYING ? 'text-red-500 animate-pulse' : 'text-white'}`}>
               {timeLeft}s
             </span>
        </div>
      </div>

      {/* Main Game Container */}
      <div className={`mt-[30px] relative aspect-square w-full max-w-[min(90vw,600px)] border-8 border-stone-700 shadow-2xl rounded-sm overflow-hidden ${containerBgClass}`}>
        
        {/* Grid Background */}
        <div 
          className="absolute inset-0 grid pointer-events-none z-0"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
             const x = i % GRID_SIZE;
             const y = Math.floor(i / GRID_SIZE);
             const isEven = (x + y) % 2 === 0;
             return (
               <div key={i} className="w-full h-full">
                 {isAlien ? (
                    <AlienTile variant={isEven ? 'light' : 'dark'} />
                 ) : isCity ? (
                    <AsphaltTile variant={isEven ? 'light' : 'dark'} />
                 ) : isArctic ? (
                    <SnowTile variant={isEven ? 'light' : 'dark'} />
                 ) : isDesert ? (
                     <SandTile variant={isEven ? 'light' : 'dark'} />
                 ) : (
                     <GrassTile variant={isEven ? 'light' : 'dark'} />
                 )}
               </div>
             );
          })}
        </div>

        {/* Game World */}
        {(status === GameStatus.PLAYING || status === GameStatus.GAME_OVER || status === GameStatus.PAUSED || status === GameStatus.LEVEL_TRANSITION) && (
          <div className="absolute inset-0 z-10">
            
            {/* Obstacles Layer */}
            {obstacles.map(obs => (
              <div 
                key={obs.id} 
                className="absolute"
                style={getStyle(obs.position.x, obs.position.y)}
              >
                {renderObstacle(obs.type)}
              </div>
            ))}

            {/* Items */}
            {items.map(item => (
              <div
                key={item.id}
                className={`absolute transition-all duration-300 flex items-center justify-center p-1`}
                style={getStyle(item.position.x, item.position.y)}
              >
                {item.type === ItemType.CRYSTAL_COMMON && <CoinIcon />}
                {item.type === ItemType.CRYSTAL_RARE && <GemIcon />}
                {item.type === ItemType.POWERUP_SPEED && <PotionIcon />}
                {item.type === ItemType.POWERUP_TIME && <HourglassIcon />}
              </div>
            ))}

            {/* Player */}
            <div
              className={`absolute z-20 p-[2px] ${isTeleporting ? '' : 'transition-all duration-200 ease-linear'}`}
              style={getStyle(playerPos.x, playerPos.y)}
            >
              <PlayerSprite facing={facing} frame={walkFrame} />
            </div>

          </div>
        )}

        {/* Overlays */}
        
        {/* Main Menu */}
        {status === GameStatus.MENU && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#202020]/90 backdrop-blur-sm">
            <h1 className="text-3xl md:text-5xl text-center text-yellow-400 mb-8 pixel-text leading-relaxed drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
              PIXEL<br/><span className="text-2xl text-green-500">ADVENTURER</span>
            </h1>
            
            <div className="mb-10 text-center text-[10px] md:text-xs text-stone-300 space-y-3 bg-stone-800 p-6 rounded border-2 border-stone-600">
              <p className="flex items-center justify-center gap-2"><span className="inline-block w-4 h-4"><CoinIcon/></span> Collect COINS</p>
              <p className="flex items-center justify-center gap-2"><span className="inline-block w-4 h-4"><GemIcon/></span> Find RARE GEMS</p>
              <p className="flex items-center justify-center gap-2"><span className="inline-block w-4 h-4"><PotionIcon/></span> Drink POTIONS for Speed</p>
              <p className="flex items-center justify-center gap-2"><span className="inline-block w-4 h-4"><HourglassIcon/></span> Grab HOURS to extend Time</p>
            </div>

            <button 
              onClick={startGame}
              className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:mt-1 transition-all"
            >
              <span className="text-white font-bold tracking-widest pixel-text shadow-sm">START ADVENTURE</span>
            </button>
            
            <div className="mt-8 text-stone-500 text-[10px]">
                USE ARROW KEYS TO MOVE
            </div>
          </div>
        )}

        {/* Level Transition Overlay */}
        {status === GameStatus.LEVEL_TRANSITION && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <h2 className="text-4xl text-yellow-400 mb-4 pixel-text drop-shadow-[4px_4px_0_rgba(0,0,0,1)] scale-110">
              LEVEL {level}
            </h2>
            <div className="bg-stone-800 px-6 py-3 rounded border-2 border-stone-600 text-center">
               <p className="text-white text-xs mb-1">TARGET SCORE</p>
               <p className="text-2xl text-green-400 pixel-text">{targetScore}</p>
            </div>
            <p className="mt-8 text-white/70 text-[10px] animate-pulse">GET READY...</p>
          </div>
        )}

        {/* Paused Overlay */}
        {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <h2 className="text-4xl text-yellow-400 mb-6 pixel-text drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-pulse">PAUSED</h2>
            <button 
              onClick={togglePause}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 active:border-b-0 active:mt-1 transition-all pixel-text text-sm"
            >
              RESUME
            </button>
             <div className="mt-4 text-white/50 text-[10px]">
                PRESS SPACE TO RESUME
            </div>
          </div>
        )}

        {/* Game Over */}
        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
            <h2 className="text-4xl text-red-500 mb-6 pixel-text drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">TIME UP!</h2>
            
            <div className="bg-amber-100 text-amber-900 p-6 rounded border-4 border-amber-300 shadow-2xl mb-8 min-w-[240px] text-center">
              <div className="mb-4">
                <div className="text-xs uppercase font-bold text-amber-700">Adventure Result</div>
                <div className="text-3xl font-bold pixel-text">{score}</div>
                <div className="text-[10px] text-amber-600 mt-1">Reached Level {level}</div>
              </div>
              <div className="border-t border-amber-300 pt-2">
                 <div className="text-[10px] uppercase text-amber-600">Best Record</div>
                 <div className="text-lg font-bold">{Math.max(score, highScore)}</div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 active:border-b-0 active:mt-1 transition-all pixel-text text-sm"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls Hint */}
      <div className="mt-8 text-stone-500 text-[10px] hidden md:block">
        PRESS ARROW KEYS TO MOVE • SPACE TO PAUSE • 1-5 TO PREVIEW THEMES
      </div>

      {/* Mobile Touch Controls */}
      <div className="md:hidden mt-6 grid grid-cols-3 gap-2 w-[160px]">
         <div></div>
         <button className="w-12 h-12 bg-stone-700 rounded shadow-lg active:bg-stone-600 border-b-4 border-stone-900 active:border-b-0 active:translate-y-1" 
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowUp'})); }}>▲</button>
         <div></div>
         <button className="w-12 h-12 bg-stone-700 rounded shadow-lg active:bg-stone-600 border-b-4 border-stone-900 active:border-b-0 active:translate-y-1"
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'})); }}>◀</button>
         <button className="w-12 h-12 bg-stone-700 rounded shadow-lg active:bg-stone-600 border-b-4 border-stone-900 active:border-b-0 active:translate-y-1"
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowDown'})); }}>▼</button>
         <button className="w-12 h-12 bg-stone-700 rounded shadow-lg active:bg-stone-600 border-b-4 border-stone-900 active:border-b-0 active:translate-y-1"
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'})); }}>▶</button>
      </div>

      {/* Copyright Footer */}
      <div className="mt-4 text-[8px] text-stone-600">
        (c) 2025 <a href="https://t.me/gamulator" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 underline">Alex Kozlov</a>
      </div>

    </div>
  );
};

export default App;
