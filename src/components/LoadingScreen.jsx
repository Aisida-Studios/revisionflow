// src/components/LoadingScreen.jsx
import React from 'react'
import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20,
      background:'var(--bg-base)'
    }}>
      <div style={{
        width:56, height:56, borderRadius:16,
        background:'var(--brand-gradient)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 0 32px rgba(34,197,94,0.45)',
        animation:'pulse 1.5s ease-in-out infinite'
      }}>
        <Zap size={28} color="#fff" />
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
        <span style={{fontWeight:800,fontSize:'1.3rem'}}>
          Revision<span style={{color:'var(--accent-light)'}}>Flow</span>
        </span>
        <div className="spinner" />
      </div>
      <style>{`
        @keyframes pulse {
          0%,100%{transform:scale(1);box-shadow:0 0 32px rgba(34,197,94,0.45);}
          50%{transform:scale(1.05);box-shadow:0 0 48px rgba(34,197,94,0.7);}
        }
      `}</style>
    </div>
  )
}
