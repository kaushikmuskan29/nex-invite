"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { InvitationRecipient } from "@/data/invitations";
import {
  EVENT, STATES, COLLEGES, COLLEGE_COUNT, SELECTED_HACKERS, SELECTED_TEAMS,
  TRACKS, VAULTS, PRIZE_POOL,
} from "@/data/nexhack";
import Embers from "./Embers";
import { useReveal, useCountUp } from "./useReveal";
import "./invitation.css";

export type Phase = "flight" | "present" | "unroll" | "expand" | "site";

// Timeline (ms) from the start of video playback
// The video is 10s: owl flies across night sky, brings scroll forward ~8.2s
const T_PRESENT = 8200;
const AUTO_OPEN_DELAY = 2600; // auto-open if user doesn't tap the seal
const T_EXPAND = 2400; // unroll animation duration
const T_SITE = T_EXPAND + 1200;

// Ragged "torn parchment" bottom edge
const TORN = (() => {
  const pts = ["0% 0%", "100% 0%"];
  for (let i = 50; i >= 0; i--) {
    const jag = (i * 37 + (i % 3) * 11) % 26;
    pts.push(`${i * 2}% calc(100% - ${jag}px)`);
  }
  return `polygon(${pts.join(",")})`;
})();

const CANDLES = Array.from({ length: 13 }, (_, i) => ({
  left: 4 + i * 7.6,
  top: 20 + ((i * 53) % 70),
  delay: (i * 0.37) % 3,
  h: 44 + ((i * 17) % 26),
}));

function playScrollOpenSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // 1. Crisp wax crack snap
    const snapLen = Math.floor(ctx.sampleRate * 0.12);
    const snapBuf = ctx.createBuffer(1, snapLen, ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }
    const snapSource = ctx.createBufferSource();
    snapSource.buffer = snapBuf;
    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = "highpass";
    snapFilter.frequency.setValueAtTime(800, ctx.currentTime);
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.4, ctx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapSource.start(ctx.currentTime);

    // 2. Paper rustle / unroll sweep
    const rustleLen = Math.floor(ctx.sampleRate * 0.6);
    const rustleBuf = ctx.createBuffer(1, rustleLen, ctx.sampleRate);
    const rustleData = rustleBuf.getChannelData(0);
    for (let i = 0; i < rustleLen; i++) {
      rustleData[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / rustleLen);
    }
    const rustleSource = ctx.createBufferSource();
    rustleSource.buffer = rustleBuf;
    const rustleFilter = ctx.createBiquadFilter();
    rustleFilter.type = "bandpass";
    rustleFilter.frequency.setValueAtTime(1400, ctx.currentTime + 0.05);
    rustleFilter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.55);
    rustleFilter.Q.setValueAtTime(2.0, ctx.currentTime);
    const rustleGain = ctx.createGain();
    rustleGain.gain.setValueAtTime(0.01, ctx.currentTime);
    rustleGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
    rustleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.58);
    rustleSource.connect(rustleFilter);
    rustleFilter.connect(rustleGain);
    rustleGain.connect(ctx.destination);
    rustleSource.start(ctx.currentTime + 0.05);
  } catch {
    // Ignore if audio context is blocked
  }
}

export default function Invitation({ recipient }: { recipient: InvitationRecipient }) {
  const [phase, setPhase] = useState<Phase>("flight");
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const openScroll = useCallback(() => {
    playScrollOpenSound();
    setPhase("unroll");
    timers.current.push(
      setTimeout(() => setPhase("expand"), T_EXPAND),
      setTimeout(() => setPhase("site"), T_SITE)
    );
  }, []);

  const skipToSite = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase("site");
  }, []);

  const begin = useCallback(() => {
    if (started.current) return;
    started.current = true;
    timers.current.push(
      setTimeout(() => {
        setPhase("present");
        // Automatically open if unattended after AUTO_OPEN_DELAY
        timers.current.push(setTimeout(openScroll, AUTO_OPEN_DELAY));
      }, T_PRESENT)
    );
  }, [openScroll]);

  useEffect(() => {
    const t = timers.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = setTimeout(() => setPhase("site"), 0);
      return () => clearTimeout(r);
    }
    // Fallback if video autoplay blocked
    const fallback = setTimeout(begin, 4000);
    return () => {
      clearTimeout(fallback);
      t.forEach(clearTimeout);
    };
  }, [begin]);

  return (
    <div className="inv" data-phase={phase}>
      {/* Skip button for quick navigation */}
      {phase !== "site" && (
        <button className="skip-btn" onClick={skipToSite} aria-label="Skip intro to invitation">
          Skip to Invitation ✦
        </button>
      )}

      {/* Cinematic owl-post video */}
      <div className="stage">
        <video
          className="stage-video"
          src="/assets/owl-flight.mp4"
          poster="/assets/owl-flight.jpg"
          muted
          playsInline
          autoPlay
          preload="auto"
          onPlaying={begin}
          onError={begin}
        />
        <div className="vignette" />
      </div>

      {/* Authentic Rolled Parchment Scroll Container */}
      <div className="scroll-ceremony" aria-label="Imperial Summons Scroll">
        {/* Closed Scroll Body (Presented after owl flight) */}
        <div
          className="authentic-closed-scroll"
          onClick={phase === "present" ? openScroll : undefined}
          role={phase === "present" ? "button" : undefined}
          tabIndex={phase === "present" ? 0 : -1}
          onKeyDown={(e) => {
            if (phase === "present" && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              openScroll();
            }
          }}
        >
          {/* Authentic Rolled Parchment Letter Asset */}
          <div className="scroll-graphic">
            <Image
              src="/assets/authentic-scroll-cropped.png"
              alt="Authentic Rolled Parchment Scroll"
              width={881}
              height={326}
              className="scroll-img"
              priority
            />
          </div>

          {/* Interactive Wax Seal on the Flap */}
          <div className="wax-seal-interactive">
            {phase === "unroll" || phase === "expand" || phase === "site" ? (
              <div className="seal-cracked">
                <div className="seal-half left">
                  <Image src="/assets/authentic-seal-l.png" alt="Broken Seal Left" width={156} height={156} priority />
                </div>
                <div className="seal-half right">
                  <Image src="/assets/authentic-seal-r.png" alt="Broken Seal Right" width={156} height={156} priority />
                </div>
              </div>
            ) : (
              <div className="seal-intact">
                <Image src="/assets/authentic-seal.png" alt="Wax Seal" width={156} height={156} priority />
                <div className="seal-aura" />
              </div>
            )}
            <div className="magic-burst" />
          </div>

          {/* Call to action prompt */}
          {phase === "present" && (
            <div className="break-seal-prompt">
              <span className="prompt-spark">✦</span>
              <span>Tap the Wax Seal to Break &amp; Open</span>
              <span className="prompt-spark">✦</span>
            </div>
          )}
        </div>

        {/* Authentic Top & Bottom Parchment Rolls (Active during unrolling) */}
        <div className="authentic-unrolling-rolls" aria-hidden="true">
          <div className="authentic-roll top">
            <Image
              src="/assets/authentic-top-roll.png"
              alt="Parchment Top Roll"
              width={881}
              height={68}
              className="roll-img"
              priority
            />
          </div>
          <div className="authentic-roll bot">
            <Image
              src="/assets/authentic-bot-roll.png"
              alt="Parchment Bottom Roll"
              width={881}
              height={68}
              className="roll-img"
              priority
            />
          </div>
        </div>
      </div>

      {/* The website / invitation document */}
      <main className="site">
        <div className="night" />
        <Embers />
        <div className="paper-wrap">
          <div className="paper" style={{ clipPath: TORN }} />
        </div>
        <Hero recipient={recipient} />
        {phase === "site" && <Body />}
      </main>
    </div>
  );
}

/* ─────────────────────────── HERO (the letter) ─────────────────────────── */

function Hero({ recipient }: { recipient: InvitationRecipient }) {
  return (
    <section className="hero">
      <div className="logos">
        <Image src="/images/nexhack/gu_logo.webp" alt="Geeta University" width={741} height={337} className="logo-gu" priority />
        <Image src="/images/nexhack/logo.webp" alt="NexHack" width={120} height={120} className="logo-nh" priority />
      </div>
      <p className="kicker">By owl post · An imperial summons</p>
      <h1 className="title">{EVENT.name}</h1>
      <p className="tagline">{EVENT.tagline}</p>
      <div className="orn"><span>✦</span></div>
      <p className="salute">{recipient.salutation ?? "Respected Guest"},</p>
      <p className="who">{recipient.name}</p>
      <p className="desig">{recipient.designation} · {recipient.organization}</p>
      {recipient.personalNote && <p className="note">{recipient.personalNote}</p>}
      <p className="when">{EVENT.dates} · Geeta University, Panipat</p>
      <div className="hint" aria-hidden="true">
        <span>Scroll — the numbers await</span>
        <b />
      </div>
    </section>
  );
}

/* ───────────────────────────── BODY SECTIONS ───────────────────────────── */

function Heading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="sec-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
      <div className="orn"><span>✦</span></div>
    </header>
  );
}

function Stat({ value, suffix = "", prefix = "", label, active }: { value: number; suffix?: string; prefix?: string; label: string; active: boolean }) {
  const v = useCountUp(value, active);
  return (
    <div className="stat">
      <strong>{prefix}{v.toLocaleString("en-IN")}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

function Body() {
  const totalRegs = STATES.reduce((a, s) => a + s.registrations, 0);
  const maxState = Math.max(...STATES.map((s) => s.registrations));
  const [statsRef, statsSeen] = useReveal<HTMLDivElement>(0.25);
  const [barsRef, barsSeen] = useReveal<HTMLDivElement>(0.1);
  const sortedStates = [...STATES].sort((a, b) => b.registrations - a.registrations);

  return (
    <div className="body">
      <div className="hall" aria-hidden="true">
        {CANDLES.map((c, i) => (
          <div key={i} className="candle" style={{ left: `${c.left}%`, top: c.top, animationDelay: `${c.delay}s` }}>
            <i className="flame" style={{ animationDelay: `${c.delay}s` }} />
            <i className="wax" style={{ height: c.h }} />
          </div>
        ))}
      </div>
      {/* STATS */}
      <section className="sec">
        <Heading eyebrow="The Great Tally" title="NexHack at a Glance" sub="Registrations received for NexHack 2.0" />
        <div ref={statsRef} className="stats">
          <Stat active={statsSeen} value={totalRegs} label="Registrations" />
          <Stat active={statsSeen} value={COLLEGE_COUNT} suffix="+" label="Colleges" />
          <Stat active={statsSeen} value={STATES.length} label="States & UTs" />
          <Stat active={statsSeen} value={SELECTED_HACKERS} suffix="+" label="Shortlisted Hackers" />
          <Stat active={statsSeen} value={SELECTED_TEAMS} suffix="+" label="Teams" />
          <Stat active={statsSeen} value={TRACKS.length} label="Innovation Tracks" />
          <Stat active={statsSeen} value={24} label="Hours of Hacking" />
          <div className="stat"><strong>{PRIZE_POOL}</strong><span>Prize Vault</span></div>
        </div>
      </section>

      {/* STATES */}
      <section className="sec">
        <Heading eyebrow="From Every Corner of the Realm" title="Registrations by State" sub={`${STATES.length} states & union territories`} />
        <div ref={barsRef} className={`bars ${barsSeen ? "in" : ""}`}>
          {sortedStates.map((s, i) => (
            <div key={s.name} className="bar-row" style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="bar-name">{s.name}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ ["--w" as string]: `${(s.registrations / maxState) * 100}%` }} />
              </div>
              <span className="bar-val">{s.registrations}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COLLEGES */}
      <section className="sec">
        <Heading eyebrow="The Houses Assemble" title="Participating Colleges" sub={`${COLLEGE_COUNT}+ institutions have registered · a few of them below`} />
        <Reveal className="colleges">
          {COLLEGES.map((c) => (
            <div key={c.name} className="college">
              <h3>{c.name}</h3>
              <p>{c.state}</p>
              <span>{c.teams} teams</span>
            </div>
          ))}
          <div className="college more">
            <h3>+ {Math.max(0, COLLEGE_COUNT - COLLEGES.length)} more</h3>
            <p>institutions across India</p>
          </div>
        </Reveal>
      </section>

      {/* TRACKS */}
      <section className="sec">
        <Heading eyebrow="Ten Spells, Ten Challenges" title="Innovation Tracks" />
        <Reveal className="tracks">
          {TRACKS.map((t) => (
            <div key={t.spell} className="track">
              <div className="t-icon">{t.icon}</div>
              <small>{t.spell}</small>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* PRIZES */}
      <section className="sec">
        <Heading eyebrow="Gringotts Vaults" title="The Prize Vault" sub={`Total prize pool ${PRIZE_POOL}`} />
        <Reveal className="vaults">
          {VAULTS.map((v, i) => (
            <div key={v.rank} className={`vault ${i === 0 ? "gold" : ""}`}>
              <small>{v.vault}</small>
              <h3>{v.rank}</h3>
              <strong>{v.bounty}</strong>
              <p>{v.perks}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* VENUE */}
      <section className="sec">
        <Heading eyebrow="Where &amp; When" title="Your Presence Awaited" />
        <Reveal className="venue">
          <div><small>Dates</small><strong>{EVENT.dates}</strong></div>
          <div><small>Format</small><strong>{EVENT.format}</strong></div>
          <div><small>Reporting</small><strong>{EVENT.reporting}</strong></div>
          <div className="wide"><small>Venue</small><strong>{EVENT.venue}</strong></div>
        </Reveal>
      </section>

      <footer className="foot">
        <div className="orn"><span>✦</span></div>
        <p className="sign">With the warmest regards,</p>
        <p className="org">The Organising Committee · NexHack 2.0 · Geeta University</p>
        <button className="replay" onClick={() => window.location.reload()}>↻ Replay the owl post</button>
      </footer>
    </div>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, seen] = useReveal<HTMLDivElement>(0.1);
  return <div ref={ref} className={`${className} rv ${seen ? "in" : ""}`}>{children}</div>;
}
