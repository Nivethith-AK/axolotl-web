"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer, 
  Scissors, 
  RefreshCw, 
  Check, 
  Download, 
  Volume2, 
  VolumeX, 
  FileText,
  Sparkles,
  Barcode as BarcodeIcon,
  QrCode as QrCodeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  total: number;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscOrSwift?: string;
  upiId?: string;
  branch?: string;
}

export interface InvoiceData {
  /** Document title: e.g. "TAX INVOICE", "INVOICE", "PROFORMA INVOICE", "BILL OF SUPPLY" */
  invoiceTitle?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  time?: string;
  poNumber?: string;
  paymentTerms?: string;

  // Company / Seller details
  companyName: string;
  companySubtitle?: string;
  companyAddress?: string;
  companyGstin?: string; // GSTIN or Tax Identification Number (e.g. 33AAACL1234F1Z5)
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogo?: string; // Image URL for brand logo
  companyLogoBadge?: string; // Text badge fallback (e.g. "LW")

  // Client / Buyer details
  clientName: string;
  clientRef?: string;
  clientAddress?: string;
  clientGstin?: string; // Client GSTIN / Tax ID
  clientEmail?: string;
  clientPhone?: string;

  // Currency & Items
  currency?: string;
  currencySymbol?: string;
  items: InvoiceItem[];

  // Financial Breakdown
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  discount?: number;
  shippingAmount?: number;
  total: number;

  // Payment & Banking
  paymentMethod?: string;
  transactionId?: string;
  authCode?: string;
  bankDetails?: BankDetails;

  // Sign-off & Notes
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
  signatureImageUrl?: string;
  termsAndConditions?: string;
  footerNote?: string;
}

export interface InvoicePrinterProps {
  /** Custom invoice data to render on the receipt or A4 sheet */
  invoiceData?: Partial<InvoiceData>;
  /** Printer format mode: corporate A4 sheet (default, primary) or compact Thermal POS receipt (secondary) */
  format?: "a4" | "thermal";
  /** Visual theme mode: light, dark, or system matching container/class */
  theme?: "light" | "dark" | "system";
  /** Print speed multiplier (0.5x slow-mo for social reels, 1x normal, 2x fast) */
  speed?: number;
  /** Whether procedural Web Audio mechanical sound effects are enabled */
  soundEnabled?: boolean;
  /** Whether to automatically trigger printing on mount */
  autoPrint?: boolean;
  /** Whether to stamp a rubber "PAID" mark upon completion */
  showStamp?: boolean;
  /** Custom text for the stamp (default: "PAID IN FULL") */
  stampText?: string;
  /** Custom stamp color class or hex */
  stampType?: "paid" | "verified" | "approved";
  /** Stamp placement position */
  stampPosition?: "bottom-right" | "center" | "top-right";
  /** Whether interactive receipt tearing is permitted */
  allowTear?: boolean;
  /** Whether to render the tactile action control bar at the outer bottom */
  showControls?: boolean;
  /** Optional class name for the outer container */
  className?: string;
  /** Optional class name for the printer hardware chassis */
  printerClassName?: string;
  /** Optional class name for the emerging paper element */
  receiptClassName?: string;
  /** Callback fired when the printing animation begins */
  onPrintStart?: () => void;
  /** Callback fired when the paper feed finishes printing */
  onPrintComplete?: (data: InvoiceData) => void;
  /** Callback fired when the paper is torn off */
  onTear?: () => void;
  /** Callback fired when download/PDF action is clicked */
  onDownload?: (data: InvoiceData) => void;
  /** Callback fired when brand logo badge or image is clicked */
  onLogoClick?: () => void;
}

export type PrinterStatus = "idle" | "preparing" | "printing" | "completed" | "torn";

// ============================================================================
// DEFAULT INVOICE DATA
// ============================================================================

export const defaultInvoiceData: InvoiceData = {
  invoiceTitle: "TAX INVOICE",
  invoiceNumber: "INV-2026-089",
  issueDate: "04 SEP 2026",
  dueDate: "18 SEP 2026",
  time: "12:45 IST",
  poNumber: "PO-LW-9921",
  paymentTerms: "NET 14 DAYS",
  companyName: "LIGHTSWIND STUDIO PVT LTD",
  companySubtitle: "INTERACTIVE MOTION & DESIGN LABS",
  companyAddress: "ONE INFINITE LOOP, SUITE 400, CA 95014",
  companyGstin: "GSTIN: 33AAACL1234F1Z5",
  companyEmail: "billing@lightswind.com",
  companyPhone: "+1 (800) 555-0199",
  companyWebsite: "https://lightswind.com",
  companyLogoBadge: "LW",
  clientName: "ENTERPRISE CLIENT CORP",
  clientRef: "ACC #88219-B",
  clientAddress: "742 EVERGREEN TERRACE, SEATTLE, WA 98101",
  clientGstin: "GSTIN: 27ABCDE1234F1Z8",
  clientEmail: "procurement@enterprise.io",
  currency: "USD",
  currencySymbol: "$",
  items: [
    {
      id: "1",
      description: "UI Motion Physics Kit & Shader Engine",
      hsnCode: "998313",
      qty: 1,
      rate: 450.00,
      total: 450.00,
    },
    {
      id: "2",
      description: "Sound Design & Procedural Audio Engine",
      hsnCode: "998314",
      qty: 1,
      rate: 250.00,
      total: 250.00,
    },
  ],
  subtotal: 700.00,
  taxRate: 10,
  taxAmount: 70.00,
  discount: 0,
  total: 770.00,
  paymentMethod: "APPLE PAY (TAP TO PAY)",
  transactionId: "TXN_998124098",
  authCode: "AUTH_OK_7719",
  bankDetails: {
    bankName: "SILICON VALLEY BANK",
    accountNumber: "•••• •••• •••• 8842",
    ifscOrSwift: "SVBUS6S",
    upiId: "lightswind@okhdfcbank",
  },
  authorizedSignatoryName: "MUHILAN K.",
  authorizedSignatoryTitle: "DIRECTOR & LEAD ARCHITECT",
  termsAndConditions: "Payment is due within 14 days of invoice date. All intellectual property remains with Lightswind Studio until full clearance.",
  footerNote: "THANK YOU FOR YOUR BUSINESS",
};

// ============================================================================
// PROCEDURAL WEB AUDIO SYNTHESIZER (ZERO EXTERNAL ASSETS)
// ============================================================================

class ProceduralPrinterAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private printingInterval: number | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopPrintingSound();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Tactile mechanical switch click
  public playButtonClick() {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // AudioContext fallback
    }
  }

  // Thermal stepper motor and printhead buzz
  public startPrintingSound(speedMultiplier: number = 1) {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc.type = "sawtooth";
      this.motorOsc.frequency.setValueAtTime(180 * speedMultiplier, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(3.5, now);

      this.motorGain.gain.setValueAtTime(0.06, now);

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);

      this.motorOsc.start(now);

      const stepInterval = Math.max(60, Math.floor(130 / speedMultiplier));
      this.printingInterval = window.setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        const tickTime = this.ctx.currentTime;

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(1800, tickTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, tickTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.022);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(tickTime);
      }, stepInterval);
    } catch {
      // AudioContext fallback
    }
  }

  // Office Laser paper roll advance sweep sound
  public startOfficePrinterSound(speedMultiplier: number = 1) {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc.type = "sine";
      this.motorOsc.frequency.setValueAtTime(120 * speedMultiplier, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);

      this.motorGain.gain.setValueAtTime(0.08, now);

      this.motorOsc.connect(filter);
      filter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);

      this.motorOsc.start(now);

      const intervalMs = Math.max(80, Math.floor(180 / speedMultiplier));
      this.printingInterval = window.setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        const tickTime = this.ctx.currentTime;

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const sweep = this.ctx.createBufferSource();
        sweep.buffer = buffer;

        const sweepFilter = this.ctx.createBiquadFilter();
        sweepFilter.type = "bandpass";
        sweepFilter.frequency.setValueAtTime(800 + Math.random() * 200, tickTime);
        sweepFilter.Q.setValueAtTime(2, tickTime);

        const sweepGain = this.ctx.createGain();
        sweepGain.gain.setValueAtTime(0.08, tickTime);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.038);

        sweep.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(this.ctx.destination);

        sweep.start(tickTime);
      }, intervalMs);
    } catch {
      // AudioContext fallback
    }
  }

  public stopPrintingSound() {
    if (this.printingInterval !== null) {
      clearInterval(this.printingInterval);
      this.printingInterval = null;
    }
    if (this.motorOsc) {
      try {
        this.motorOsc.stop();
        this.motorOsc.disconnect();
      } catch {
        // Ignored
      }
      this.motorOsc = null;
    }
    if (this.motorGain) {
      this.motorGain.disconnect();
      this.motorGain = null;
    }
  }

  // Realistic paper tear rip effect
  public playTearSound() {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 0.16;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize;
        const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.6);
        const stutter = Math.sin(i * 0.08) > 0 ? 1 : 0.4;
        data[i] = (Math.random() * 2 - 1) * envelope * stutter;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.linearRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // AudioContext fallback
    }
  }

  // Heavy rubber stamp "THUD" sound
  public playStampSound() {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext fallback
    }
  }
}

// Global audio singleton instance
const printerAudio = new ProceduralPrinterAudio();

// ============================================================================
// THERMAL RECEIPT DOCUMENT COMPONENT
// ============================================================================

export interface ThermalReceiptProps {
  data: InvoiceData;
  isCompleted?: boolean;
  showStamp?: boolean;
  stampText?: string;
  stampType?: "paid" | "verified" | "approved";
  stampPosition?: "bottom-right" | "center" | "top-right";
  isTorn?: boolean;
  className?: string;
  onLogoClick?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  data,
  isCompleted = false,
  showStamp = true,
  stampText = "PAID IN FULL",
  stampType = "paid",
  stampPosition = "center",
  isTorn = false,
  className,
  onLogoClick,
}) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-[320px] select-none text-neutral-900 bg-[#fbfbf9] transition-all duration-300 shadow-2xl",
        className
      )}
    >
      {/* Serrated Top Edge - ONLY shown when torn or detached */}
      {isTorn && (
        <div className="w-full h-2 overflow-hidden text-[#fbfbf9] relative -mt-[1px]">
          <svg
            viewBox="0 0 320 8"
            className="w-full h-2 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,8 L5,0 L10,8 L15,0 L20,8 L25,0 L30,8 L35,0 L40,8 L45,0 L50,8 L55,0 L60,8 L65,0 L70,8 L75,0 L80,8 L85,0 L90,8 L95,0 L100,8 L105,0 L110,8 L115,0 L120,8 L125,0 L130,8 L135,0 L140,8 L145,0 L150,8 L155,0 L160,8 L165,0 L170,8 L175,0 L180,8 L185,0 L190,8 L195,0 L200,8 L205,0 L210,8 L215,0 L220,8 L225,0 L230,8 L235,0 L240,8 L245,0 L250,8 L255,0 L260,8 L265,0 L270,8 L275,0 L280,8 L285,0 L290,8 L295,0 L300,8 L305,0 L310,8 L315,0 L320,8 Z" />
          </svg>
        </div>
      )}

      {/* Main Thermal Receipt Content */}
      <div
        className={cn(
          "px-5 py-3 font-mono text-[11px] leading-snug text-[#111111] relative",
          !isTorn && "pt-3"
        )}
      >
        {/* Compact Brand Header */}
        <div className="text-center pb-2">
          {data.companyLogo ? (
            <img
              src={data.companyLogo}
              alt={data.companyName}
              onClick={onLogoClick}
              className={cn(
                "w-8 h-8 object-contain mx-auto mb-1 rounded",
                onLogoClick && "cursor-pointer hover:opacity-80 transition-opacity"
              )}
              title={onLogoClick ? "Click to change brand logo" : undefined}
            />
          ) : (
            <div
              onClick={onLogoClick}
              className={cn("flex justify-center mb-1", onLogoClick && "cursor-pointer hover:scale-105 transition-transform")}
              title={onLogoClick ? "Click to change brand logo" : undefined}
            >
              <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center space-x-[1.5px] p-0.5">
                <span className="w-[1.5px] h-2.5 bg-black" />
                <span className="w-[1.5px] h-4 bg-black" />
                <span className="w-[1.5px] h-2 bg-black" />
                <span className="w-[1.5px] h-3 bg-black" />
              </div>
            </div>
          )}
          {data.invoiceTitle && (
            <p className="text-[8.5px] tracking-widest text-neutral-500 font-bold uppercase mb-0.5">
              {data.invoiceTitle}
            </p>
          )}
          <h3 className="font-extrabold text-sm tracking-wider uppercase">
            {data.companyName}
          </h3>
          {data.companySubtitle && (
            <p className="text-[9px] tracking-widest text-neutral-600 uppercase">
              {data.companySubtitle}
            </p>
          )}
          {data.companyAddress && (
            <p className="text-[8.5px] text-neutral-500 font-mono leading-tight mt-0.5 max-w-[240px] mx-auto">
              {data.companyAddress}
            </p>
          )}
          {data.companyGstin && (
            <div className="text-[8.5px] font-mono font-bold text-neutral-800 tracking-tight mt-0.5">
              {data.companyGstin}
            </div>
          )}
        </div>

        {/* Metadata Bar */}
        <div className="border-y border-dashed border-neutral-400 py-1.5 my-1 text-[9px] flex justify-between tracking-tight text-neutral-700">
          <span>{data.invoiceNumber}</span>
          <span>{data.issueDate}</span>
          <span className="font-bold text-black">{data.clientName}</span>
        </div>

        {/* Client Extended Details (Address & GSTIN) */}
        {(data.clientAddress || data.clientGstin) && (
          <div className="text-[8.5px] font-mono text-neutral-600 pb-1.5 border-b border-dashed border-neutral-300 space-y-0.5 text-left">
            {data.clientAddress && <div>ADDR: {data.clientAddress}</div>}
            {data.clientGstin && (
              <div className="font-bold text-black">BUYER GST: {data.clientGstin}</div>
            )}
          </div>
        )}

        {/* Itemized Table */}
        <div className="py-2">
          <div className="flex justify-between font-bold border-b border-neutral-300 pb-1 text-[10px] uppercase">
            <span>ITEM DESCRIPTION</span>
            <span>TOTAL</span>
          </div>

          <div className="divide-y divide-neutral-200/80">
            {data.items.map((item) => (
              <div key={item.id} className="py-1.5 flex justify-between items-center">
                <div className="pr-2 truncate">
                  <div className="font-bold truncate text-[10.5px]">
                    {item.description}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-normal">
                    {item.hsnCode && <span className="mr-1.5 text-[8px] text-neutral-400">HSN:{item.hsnCode}</span>}
                    {item.qty} × {data.currencySymbol || "$"}{item.rate.toFixed(2)}
                  </div>
                </div>
                <div className="font-bold text-right text-[10.5px] whitespace-nowrap">
                  {data.currencySymbol || "$"}{item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-t border-dashed border-neutral-400 pt-1.5 space-y-0.5 text-[10px]">
          <div className="flex justify-between text-neutral-600">
            <span>SUBTOTAL</span>
            <span>{data.currencySymbol || "$"}{data.subtotal.toFixed(2)}</span>
          </div>
          {data.taxRate !== undefined && (
            <div className="flex justify-between text-neutral-600">
              <span>TAX ({data.taxRate}%)</span>
              <span>{data.currencySymbol || "$"}{(data.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-xs text-black border-t border-black pt-1 mt-1">
            <span>TOTAL DUE</span>
            <span>{data.currencySymbol || "$"}{data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment & Bank Details */}
        <div className="border-t border-dotted border-neutral-300 pt-2 mt-2 text-[9px] text-neutral-500 space-y-0.5">
          <div className="flex justify-between">
            <span>PAID: {data.paymentMethod || "ELECTRONIC"}</span>
            <span>{data.authCode || "AUTH OK"}</span>
          </div>
          {data.bankDetails?.upiId && (
            <div className="text-right text-[8px] font-bold text-neutral-600">
              UPI ID: {data.bankDetails.upiId}
            </div>
          )}
        </div>

        {/* Crisp Barcode */}
        <div className="pt-2 pb-1 flex flex-col items-center">
          <div className="w-full flex items-end justify-center space-x-[2px] h-6 overflow-hidden px-4">
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[2.5px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[3px] h-full bg-black" />
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[3.5px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[3px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[3px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[3.5px] h-full bg-black" />
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[2.5px] h-full bg-black" />
            <span className="w-[1px] h-full bg-black" />
            <span className="w-[3px] h-full bg-black" />
            <span className="w-[1.5px] h-full bg-black" />
            <span className="w-[2px] h-full bg-black" />
          </div>
          <span className="text-[8px] tracking-widest text-neutral-400 mt-0.5">
            *{data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "")}*
          </span>
        </div>

        {/* Footer Note */}
        {data.footerNote && (
          <div className="text-center text-[8.5px] text-neutral-400 tracking-wider pt-1 uppercase">
            *** {data.footerNote} ***
          </div>
        )}

        {/* Rubber Ink Stamp */}
        <AnimatePresence>
          {isCompleted && showStamp && (
            <motion.div
              key="thermal-rubber-stamp"
              initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 0.88, rotate: -12 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 18,
                delay: 0.1,
              }}
              className={cn(
                "pointer-events-none z-20",
                stampPosition === "bottom-right"
                  ? "absolute bottom-12 right-6"
                  : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              )}
            >
              <div
                className={cn(
                  "px-4 py-1.5 border-4 border-dashed rounded-lg text-center tracking-widest font-black uppercase text-base shadow-sm transform -rotate-6",
                  stampType === "verified"
                    ? "border-emerald-700 text-emerald-800"
                    : stampType === "approved"
                    ? "border-sky-700 text-sky-800"
                    : "border-red-600 text-red-700"
                )}
                style={{
                  textShadow: "1px 1px 0px rgba(0,0,0,0.1)",
                }}
              >
                {stampText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Serrated Bottom Edge */}
      <div className="w-full h-2 overflow-hidden text-[#fbfbf9] relative -mb-[1px]">
        <svg
          viewBox="0 0 320 8"
          className="w-full h-2 fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L5,8 L10,0 L15,8 L20,0 L25,8 L30,0 L35,8 L40,0 L45,8 L50,0 L55,8 L60,0 L65,8 L70,0 L75,8 L80,0 L85,8 L90,0 L95,8 L100,0 L105,8 L110,0 L115,8 L120,0 L125,8 L130,0 L135,8 L140,0 L145,8 L150,0 L155,8 L160,0 L165,8 L170,0 L175,8 L180,0 L185,8 L190,0 L195,8 L200,0 L205,8 L210,0 L215,8 L220,0 L225,8 L230,0 L235,8 L240,0 L245,8 L250,0 L255,8 L260,0 L265,8 L270,0 L275,8 L280,0 L285,8 L290,0 L295,8 L300,0 L305,8 L310,0 L315,8 L320,0 Z" />
        </svg>
      </div>
    </div>
  );
};

// ============================================================================
// CORPORATE A4 INVOICE SHEET COMPONENT
// ============================================================================

export interface A4InvoiceSheetProps {
  data: InvoiceData;
  isCompleted?: boolean;
  showStamp?: boolean;
  stampText?: string;
  stampType?: "paid" | "verified" | "approved";
  stampPosition?: "bottom-right" | "center" | "top-right";
  className?: string;
  onLogoClick?: () => void;
}

export const A4InvoiceSheet: React.FC<A4InvoiceSheetProps> = ({
  data,
  isCompleted = false,
  showStamp = true,
  stampText = "PAID IN FULL",
  stampType = "paid",
  stampPosition = "bottom-right",
  className,
  onLogoClick,
}) => {
  return (
    <div
      className={cn(
        "relative w-full max-w-[480px] bg-white text-neutral-900 select-none shadow-2xl rounded-sm border border-neutral-200/80 transition-all duration-300 font-sans",
        className
      )}
    >
      {/* Header Accent Bar */}
      <div className="h-2 w-full bg-neutral-900 rounded-t-sm" />

      {/* Main A4 Document Body */}
      <div className="p-7 text-xs leading-relaxed text-neutral-800 relative">
        {/* Top Header: Brand Identity & Title */}
        <div className="flex justify-between items-start pb-5 border-b border-neutral-200">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              {data.companyLogo ? (
                <div className="relative group/logo">
                  <img
                    src={data.companyLogo}
                    alt={data.companyName}
                    onClick={onLogoClick}
                    className={cn(
                      "w-10 h-10 object-contain rounded-lg border border-neutral-200 p-0.5 shadow-sm bg-white",
                      onLogoClick && "cursor-pointer hover:ring-2 hover:ring-black/20 hover:scale-105 transition-all"
                    )}
                    title={onLogoClick ? "Click to customize brand logo" : undefined}
                  />
                  {onLogoClick && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/logo:opacity-100 transition-opacity shadow pointer-events-none">
                      ✎
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative group/logo">
                  <div
                    onClick={onLogoClick}
                    className={cn(
                      "w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-black text-sm shadow-sm tracking-tight",
                      onLogoClick && "cursor-pointer hover:ring-2 hover:ring-black/30 hover:scale-105 transition-all"
                    )}
                    title={onLogoClick ? "Click to customize brand logo" : undefined}
                  >
                    {data.companyLogoBadge || data.companyName.slice(0, 2).toUpperCase()}
                  </div>
                  {onLogoClick && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-neutral-800 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/logo:opacity-100 transition-opacity shadow pointer-events-none">
                      ✎
                    </span>
                  )}
                </div>
              )}
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-black leading-snug">
                  {data.companyName}
                </h2>
                {data.companySubtitle && (
                  <p className="text-[10px] text-neutral-500 font-mono tracking-tight">
                    {data.companySubtitle}
                  </p>
                )}
              </div>
            </div>

            {data.companyAddress && (
              <p className="text-[9.5px] text-neutral-500 font-mono leading-tight max-w-[260px]">
                {data.companyAddress}
              </p>
            )}

            {data.companyGstin && (
              <div className="inline-flex items-center space-x-1 mt-1.5 px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[9px] font-mono font-bold text-neutral-800">
                <span>{data.companyGstin}</span>
              </div>
            )}

            {(data.companyEmail || data.companyPhone) && (
              <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                {[data.companyEmail, data.companyPhone].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          {/* Invoice Title & Number */}
          <div className="text-right">
            <h1 className="font-black text-2xl tracking-tight text-neutral-900 mb-0.5 uppercase">
              {data.invoiceTitle || "TAX INVOICE"}
            </h1>
            <p className="text-[10.5px] font-mono text-neutral-500 font-bold tracking-wider">
              {data.invoiceNumber}
            </p>

            <div className="flex flex-col items-end space-y-1 mt-2">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-neutral-100 rounded text-[9.5px] font-mono text-neutral-700">
                <span className="text-neutral-400 font-semibold">DATE:</span>
                <span className="font-bold">{data.issueDate}</span>
              </div>
              {data.dueDate && (
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9.5px] font-mono text-amber-700 font-bold">
                  <span className="opacity-70">DUE:</span>
                  <span>{data.dueDate}</span>
                </div>
              )}
              {data.poNumber && (
                <span className="text-[9px] font-mono text-neutral-400 font-medium">
                  PO: {data.poNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-100 text-[11px]">
          <div>
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              BILLED TO (BUYER):
            </span>
            <p className="font-extrabold text-neutral-900 text-xs leading-tight">{data.clientName}</p>
            {data.clientRef && <p className="text-[10px] text-neutral-500 font-mono">{data.clientRef}</p>}
            {data.clientAddress && (
              <p className="text-[9.5px] text-neutral-600 font-mono leading-tight mt-0.5 max-w-[210px]">
                {data.clientAddress}
              </p>
            )}
            {data.clientGstin && (
              <div className="mt-1.5 font-mono text-[9px] text-neutral-800 font-bold bg-neutral-100 px-2 py-0.5 rounded inline-flex items-center border border-neutral-200">
                <span className="text-neutral-400 mr-1">BUYER GST:</span>
                <span>{data.clientGstin}</span>
              </div>
            )}
            {data.clientEmail && (
              <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{data.clientEmail}</p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              PAYMENT & TERMS:
            </span>
            <p className="font-mono text-neutral-800 font-bold text-xs">{data.paymentMethod || "ELECTRONIC TRANSFER"}</p>
            {data.paymentTerms && (
              <p className="text-[9.5px] font-mono text-neutral-600 font-semibold">{data.paymentTerms}</p>
            )}
            {data.authCode && <p className="text-[9px] text-neutral-400 font-mono">{data.authCode}</p>}

            {/* Bank / UPI Details */}
            {data.bankDetails && (
              <div className="mt-2 text-[8.5px] font-mono text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-200/80 text-right leading-tight space-y-0.5">
                {data.bankDetails.bankName && <div className="font-bold text-neutral-800">{data.bankDetails.bankName}</div>}
                {data.bankDetails.accountNumber && <div>A/C: {data.bankDetails.accountNumber}</div>}
                {data.bankDetails.ifscOrSwift && <div>IFSC/SWIFT: {data.bankDetails.ifscOrSwift}</div>}
                {data.bankDetails.upiId && <div className="text-emerald-700 font-bold">UPI: {data.bankDetails.upiId}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-[10px] font-mono font-bold uppercase text-neutral-600">
                <th className="py-2">Description</th>
                <th className="py-2 text-center w-12">Qty</th>
                <th className="py-2 text-right w-24">Rate</th>
                <th className="py-2 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.items.map((item) => (
                <tr key={item.id} className="text-[11px]">
                  <td className="py-2.5 pr-2">
                    <div className="font-bold text-neutral-900 leading-snug">{item.description}</div>
                    {item.hsnCode && (
                      <span className="text-[9px] font-mono text-neutral-400 block">
                        HSN/SAC: {item.hsnCode}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center font-mono text-neutral-600">
                    {item.qty}
                  </td>
                  <td className="py-2.5 text-right font-mono text-neutral-600">
                    {data.currencySymbol || "$"}{item.rate.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-neutral-900">
                    {data.currencySymbol || "$"}{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-neutral-200 pt-3 flex justify-end">
          <div className="w-56 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono">{data.currencySymbol || "$"}{data.subtotal.toFixed(2)}</span>
            </div>
            {data.taxRate !== undefined && (
              <div className="flex justify-between text-neutral-600">
                <span>Tax ({data.taxRate}%)</span>
                <span className="font-mono">{data.currencySymbol || "$"}{(data.taxAmount || 0).toFixed(2)}</span>
              </div>
            )}
            {data.discount !== undefined && data.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-mono">-{data.currencySymbol || "$"}{data.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-neutral-900 border-t-2 border-neutral-900 pt-2 mt-1">
              <span>Grand Total</span>
              <span className="font-mono">{data.currencySymbol || "$"}{data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="border-t border-neutral-200 pt-4 mt-4 flex justify-between items-end text-[10px] text-neutral-500">
          <div className="max-w-[240px]">
            {data.termsAndConditions ? (
              <p className="text-[8.5px] text-neutral-400 font-mono leading-tight">
                <span className="font-bold text-neutral-600">TERMS: </span>
                {data.termsAndConditions}
              </p>
            ) : (
              <div>
                <p className="font-bold text-neutral-800">Authorized Electronic Receipt</p>
                <p className="font-mono text-[9px]">{data.transactionId}</p>
              </div>
            )}
          </div>

          <div className="text-right">
            {data.authorizedSignatoryName && (
              <div className="text-[10px] font-bold text-neutral-800 tracking-wide uppercase mb-0.5">
                {data.authorizedSignatoryName}
              </div>
            )}
            <div className="w-28 border-b border-neutral-400 mb-1 ml-auto" />
            <span className="text-[8.5px] font-mono uppercase tracking-widest text-neutral-400">
              {data.authorizedSignatoryTitle || "AUTHORIZED SIGNATORY"}
            </span>
          </div>
        </div>

        {/* Rubber Stamp */}
        <AnimatePresence>
          {isCompleted && showStamp && (
            <motion.div
              key="a4-rubber-stamp"
              initial={{ scale: 2.2, opacity: 0, rotate: -22 }}
              animate={{ scale: 1, opacity: 0.88, rotate: -12 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 18,
                delay: 0.1,
              }}
              className={cn(
                "pointer-events-none z-20",
                stampPosition === "center"
                  ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  : stampPosition === "top-right"
                  ? "absolute top-20 right-8"
                  : "absolute bottom-14 right-8"
              )}
            >
              <div
                className={cn(
                  "px-5 py-2 border-4 border-dashed rounded-lg text-center tracking-widest font-black uppercase text-lg shadow-sm transform -rotate-6",
                  stampType === "verified"
                    ? "border-emerald-700 text-emerald-800"
                    : stampType === "approved"
                    ? "border-sky-700 text-sky-800"
                    : "border-red-600 text-red-700"
                )}
                style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.1)" }}
              >
                {stampText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// ISOLATED INVOICE PRINT & DOWNLOAD ENGINE (PRINT ONLY THE INVOICE)
// ============================================================================

/**
 * Generates clean, self-contained HTML for printing or downloading ONLY the
 * invoice receipt or corporate A4 sheet with zero external dependencies.
 */
export function generateInvoicePrintHtml(
  data: InvoiceData,
  format: "a4" | "thermal" = "a4",
  showStamp: boolean = true,
  stampText: string = "PAID IN FULL",
  stampType: "paid" | "verified" | "approved" = "paid",
  stampPosition: "bottom-right" | "center" | "top-right" = "bottom-right"
): string {
  const isThermal = format === "thermal";
  const currSym = data.currencySymbol || "$";

  const stampColor =
    stampType === "verified"
      ? { border: "#047857", text: "#065f46" }
      : stampType === "approved"
      ? { border: "#0284c7", text: "#0369a1" }
      : { border: "#dc2626", text: "#b91c1c" };

  const barcodePattern = [
    2, 1, 3, 1, 4, 2, 2, 1, 4, 1, 2, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 3, 1, 3, 1, 4, 2, 3
  ];
  const barcodeSpans = barcodePattern
    .map(
      (w) =>
        `<span style="display:inline-block;width:${w}px;height:24px;background:#000;margin-right:1.5px;"></span>`
    )
    .join("");

  const thermalItemsHtml = data.items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #e5e5e5;">
        <div style="flex:1;padding-right:8px;">
          <div style="font-weight:700;font-size:11.5px;color:#000;">${item.description}</div>
          <div style="font-size:9.5px;color:#555;">
            ${item.hsnCode ? `<span style="margin-right:6px;font-size:8.5px;color:#888;">HSN:${item.hsnCode}</span>` : ""}
            ${item.qty} × ${currSym}${item.rate.toFixed(2)}
          </div>
        </div>
        <div style="font-weight:700;font-size:11.5px;text-align:right;white-space:nowrap;color:#000;">
          ${currSym}${item.total.toFixed(2)}
        </div>
      </div>
    `
    )
    .join("");

  const a4ItemsHtml = data.items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #e5e7eb;font-size:11px;">
        <td style="padding:9px 4px;">
          <div style="font-weight:700;color:#111827;line-height:1.3;">${item.description}</div>
          ${item.hsnCode ? `<div style="font-size:9px;color:#9ca3af;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;margin-top:1px;">HSN/SAC: ${item.hsnCode}</div>` : ""}
        </td>
        <td style="padding:9px 4px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#4b5563;">${item.qty}</td>
        <td style="padding:9px 4px;text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#4b5563;">${currSym}${item.rate.toFixed(2)}</td>
        <td style="padding:9px 4px;text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#111827;">${currSym}${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const thermalContent = `
    <div class="thermal-receipt">
      <div class="receipt-header">
        ${data.companyLogo ? `<img src="${data.companyLogo}" style="width:32px;height:32px;object-fit:contain;margin:0 auto 4px;display:block;" />` : `
          <div class="logo-ring">
            <span style="display:inline-block;width:2px;height:10px;background:#000;margin:0 1px;"></span>
            <span style="display:inline-block;width:2px;height:16px;background:#000;margin:0 1px;"></span>
            <span style="display:inline-block;width:2px;height:8px;background:#000;margin:0 1px;"></span>
            <span style="display:inline-block;width:2px;height:13px;background:#000;margin:0 1px;"></span>
          </div>
        `}
        ${data.invoiceTitle ? `<div style="font-size:9px;letter-spacing:1.5px;color:#666;font-weight:700;text-transform:uppercase;">${data.invoiceTitle}</div>` : ""}
        <h2 style="margin:2px 0;font-size:15px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">${data.companyName}</h2>
        ${data.companySubtitle ? `<div style="font-size:9.5px;letter-spacing:2px;color:#555;text-transform:uppercase;">${data.companySubtitle}</div>` : ""}
        ${data.companyAddress ? `<div style="font-size:9px;color:#666;margin-top:2px;">${data.companyAddress}</div>` : ""}
        ${data.companyGstin ? `<div style="font-size:9px;font-weight:700;color:#111;margin-top:2px;">${data.companyGstin}</div>` : ""}
      </div>

      <div class="divider-dashed">
        <span>${data.invoiceNumber}</span>
        <span>${data.issueDate}</span>
        <span style="font-weight:700;color:#000;">${data.clientName}</span>
      </div>

      ${(data.clientAddress || data.clientGstin) ? `
        <div style="font-size:8.5px;color:#555;padding-bottom:5px;border-bottom:1px dashed #777;margin-bottom:6px;">
          ${data.clientAddress ? `<div>ADDR: ${data.clientAddress}</div>` : ""}
          ${data.clientGstin ? `<div style="font-weight:700;color:#000;">BUYER GST: ${data.clientGstin}</div>` : ""}
        </div>
      ` : ""}

      <div style="margin:8px 0;">
        <div style="display:flex;justify-content:space-between;font-weight:800;border-bottom:1px solid #bbb;padding-bottom:4px;font-size:10px;text-transform:uppercase;">
          <span>ITEM DESCRIPTION</span>
          <span>TOTAL</span>
        </div>
        ${thermalItemsHtml}
      </div>

      <div class="totals-section">
        <div style="display:flex;justify-content:space-between;color:#555;margin-bottom:3px;">
          <span>SUBTOTAL</span>
          <span>${currSym}${data.subtotal.toFixed(2)}</span>
        </div>
        ${
          data.taxRate !== undefined
            ? `
          <div style="display:flex;justify-content:space-between;color:#555;margin-bottom:3px;">
            <span>TAX (${data.taxRate}%)</span>
            <span>${currSym}${(data.taxAmount || 0).toFixed(2)}</span>
          </div>
        `
            : ""
        }
        <div class="total-due">
          <span>TOTAL DUE</span>
          <span>${currSym}${data.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="payment-details">
        <span>PAID: ${data.paymentMethod || "ELECTRONIC"}</span>
        <span>${data.authCode || "AUTH OK"}</span>
      </div>

      ${data.bankDetails?.upiId ? `<div style="font-size:8.5px;text-align:right;color:#333;margin-top:3px;font-weight:700;">UPI: ${data.bankDetails.upiId}</div>` : ""}

      <div class="barcode-area">
        <div class="barcode-bars">
          ${barcodeSpans}
        </div>
        <div class="barcode-text">*${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "")}*</div>
      </div>

      ${data.footerNote ? `<div class="footer-note">*** ${data.footerNote} ***</div>` : ""}

      ${
        showStamp
          ? `
        <div class="rubber-stamp rubber-stamp-${stampPosition}" style="border-color:${stampColor.border};color:${stampColor.text};">
          ${stampText}
        </div>
      `
          : ""
      }
    </div>
  `;

  const a4Content = `
    <div class="a4-card">
      <div class="a4-accent-bar"></div>

      <div class="a4-body">
        <div class="a4-top-header">
          <div class="a4-brand-col">
            <div class="a4-brand-row">
              ${data.companyLogo ? `
                <img src="${data.companyLogo}" class="a4-logo-img" />
              ` : `
                <div class="a4-logo-badge">${data.companyLogoBadge || data.companyName.slice(0, 2).toUpperCase()}</div>
              `}
              <div>
                <h2 class="a4-company-name">${data.companyName}</h2>
                ${data.companySubtitle ? `<div class="a4-company-subtitle">${data.companySubtitle}</div>` : ""}
              </div>
            </div>
            ${data.companyAddress ? `<div class="a4-company-address">${data.companyAddress}</div>` : ""}
            ${data.companyGstin ? `<div class="a4-gstin-badge">${data.companyGstin}</div>` : ""}
            ${(data.companyEmail || data.companyPhone) ? `<div class="a4-company-contact">${[data.companyEmail, data.companyPhone].filter(Boolean).join(" • ")}</div>` : ""}
          </div>

          <div class="a4-invoice-meta-col">
            <h1 class="a4-invoice-title">${data.invoiceTitle || "TAX INVOICE"}</h1>
            <div class="a4-invoice-num">${data.invoiceNumber}</div>
            <div class="a4-date-pill">
              <span style="color:#9ca3af;font-weight:600;margin-right:4px;">DATE:</span>
              <strong>${data.issueDate}</strong>
            </div>
            ${data.dueDate ? `<div class="a4-due-pill"><span style="opacity:0.75;margin-right:3px;">DUE:</span>${data.dueDate}</div>` : ""}
            ${data.poNumber ? `<div class="a4-po-num">PO: ${data.poNumber}</div>` : ""}
          </div>
        </div>

        <div class="a4-details-grid">
          <div>
            <div class="a4-field-label">BILLED TO (BUYER):</div>
            <div class="a4-client-name">${data.clientName}</div>
            ${data.clientRef ? `<div class="a4-client-ref">${data.clientRef}</div>` : ""}
            ${data.clientAddress ? `<div class="a4-client-address">${data.clientAddress}</div>` : ""}
            ${data.clientGstin ? `<div class="a4-gstin-badge" style="margin-top:4px;">BUYER GST: ${data.clientGstin}</div>` : ""}
            ${data.clientEmail ? `<div style="font-size:9px;color:#9ca3af;font-family:ui-monospace,monospace;margin-top:3px;">${data.clientEmail}</div>` : ""}
          </div>

          <div style="text-align:right;">
            <div class="a4-field-label">PAYMENT & TERMS:</div>
            <div class="a4-payment-method">${data.paymentMethod || "ELECTRONIC TRANSFER"}</div>
            ${data.paymentTerms ? `<div class="a4-payment-terms">${data.paymentTerms}</div>` : ""}
            ${data.authCode ? `<div style="font-size:9px;color:#9ca3af;font-family:ui-monospace,monospace;margin-top:1px;">${data.authCode}</div>` : ""}
            ${data.bankDetails ? `
              <div class="a4-bank-box">
                ${data.bankDetails.bankName ? `<div style="font-weight:700;color:#111827;">${data.bankDetails.bankName}</div>` : ""}
                ${data.bankDetails.accountNumber ? `<div>A/C: ${data.bankDetails.accountNumber}</div>` : ""}
                ${data.bankDetails.ifscOrSwift ? `<div>IFSC/SWIFT: ${data.bankDetails.ifscOrSwift}</div>` : ""}
                ${data.bankDetails.upiId ? `<div style="color:#047857;font-weight:700;">UPI: ${data.bankDetails.upiId}</div>` : ""}
              </div>
            ` : ""}
          </div>
        </div>

        <div class="a4-table-wrap">
          <table class="a4-table">
            <thead>
              <tr>
                <th style="text-align:left;">Description</th>
                <th style="text-align:center;width:48px;">Qty</th>
                <th style="text-align:right;width:85px;">Rate</th>
                <th style="text-align:right;width:95px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${a4ItemsHtml}
            </tbody>
          </table>
        </div>

        <div class="a4-totals-row">
          <div class="a4-totals-box">
            <div class="a4-total-line">
              <span>Subtotal</span>
              <span class="a4-mono">${currSym}${data.subtotal.toFixed(2)}</span>
            </div>
            ${
              data.taxRate !== undefined
                ? `
              <div class="a4-total-line">
                <span>Tax (${data.taxRate}%)</span>
                <span class="a4-mono">${currSym}${(data.taxAmount || 0).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            ${
              data.discount !== undefined && data.discount > 0
                ? `
              <div class="a4-total-line" style="color:#047857;">
                <span>Discount</span>
                <span class="a4-mono">-${currSym}${data.discount.toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div class="a4-grand-total-line">
              <span>Grand Total</span>
              <span class="a4-mono">${currSym}${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="a4-footer-row">
          <div class="a4-footer-left">
            ${data.termsAndConditions ? `
              <div style="font-size:8.5px;color:#6b7280;font-family:ui-monospace,monospace;line-height:1.35;">
                <strong style="color:#111827;">TERMS:</strong> ${data.termsAndConditions}
              </div>
            ` : `
              <div style="font-weight:700;color:#1f2937;">Authorized Electronic Receipt</div>
              <div style="font-family:ui-monospace,monospace;font-size:9px;color:#6b7280;">${data.transactionId || ""}</div>
            `}
          </div>
          <div class="a4-footer-right">
            ${data.authorizedSignatoryName ? `<div style="font-weight:700;color:#111827;font-size:10px;text-transform:uppercase;margin-bottom:3px;">${data.authorizedSignatoryName}</div>` : ""}
            <div class="a4-sign-line"></div>
            <div class="a4-sign-label">
              ${data.authorizedSignatoryTitle || "AUTHORIZED SIGNATORY"}
            </div>
          </div>
        </div>

        ${
          showStamp
            ? `
          <div class="a4-stamp a4-stamp-${stampPosition}" style="border-color:${stampColor.border};color:${stampColor.text};">
            ${stampText}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice - ${data.invoiceNumber}</title>
    <style>
      @page {
        size: ${isThermal ? "80mm auto" : "A4 portrait"};
        margin: 0mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #111827;
        -webkit-font-smoothing: antialiased;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: ${isThermal ? "4mm" : "12mm 15mm"};
        min-height: ${isThermal ? "auto" : "297mm"};
      }
      /* Thermal POS Styles */
      .thermal-receipt {
        position: relative;
        width: 100%;
        max-width: 72mm;
        padding: 10px 8px;
        background: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
        color: #111111;
        border: 1px dashed #e5e7eb;
      }
      .receipt-header {
        text-align: center;
        padding-bottom: 6px;
      }
      .logo-ring {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border: 1px solid #000;
        border-radius: 50%;
        margin-bottom: 4px;
      }
      .divider-dashed {
        border-top: 1px dashed #777;
        border-bottom: 1px dashed #777;
        padding: 5px 0;
        margin: 8px 0;
        font-size: 9.5px;
        display: flex;
        justify-content: space-between;
        color: #444;
      }
      .totals-section {
        border-top: 1px dashed #777;
        padding-top: 6px;
        font-size: 10px;
      }
      .total-due {
        display: flex;
        justify-content: space-between;
        font-weight: 900;
        font-size: 13px;
        border-top: 1px solid #000;
        padding-top: 5px;
        margin-top: 5px;
        color: #000;
      }
      .payment-details {
        border-top: 1px dotted #aaa;
        margin-top: 8px;
        padding-top: 6px;
        font-size: 9px;
        display: flex;
        justify-content: space-between;
        color: #555;
      }
      .barcode-area {
        margin-top: 10px;
        text-align: center;
      }
      .barcode-bars {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        height: 24px;
        overflow: hidden;
      }
      .barcode-text {
        font-size: 8px;
        letter-spacing: 1.5px;
        color: #666;
        margin-top: 2px;
      }
      .footer-note {
        text-align: center;
        font-size: 8.5px;
        color: #555;
        margin-top: 8px;
        text-transform: uppercase;
      }
      /* Rubber Stamp for Thermal POS */
      .rubber-stamp {
        position: absolute;
        pointer-events: none;
        border: 3.5px dashed;
        border-radius: 8px;
        padding: 5px 14px;
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 2px;
        text-transform: uppercase;
        opacity: 0.88;
      }
      .rubber-stamp-bottom-right {
        bottom: 35px;
        right: 12px;
        transform: rotate(-10deg);
      }
      .rubber-stamp-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-12deg);
      }
      .rubber-stamp-top-right {
        top: 60px;
        right: 12px;
        transform: rotate(-10deg);
      }

      /* Corporate A4 Sheet Styles (Matches UI 1:1) */
      .a4-card {
        position: relative;
        width: 100%;
        max-width: 175mm;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .a4-accent-bar {
        height: 8px;
        width: 100%;
        background: #111827;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        flex-shrink: 0;
      }
      .a4-body {
        position: relative;
        padding: 24px 28px 22px 28px;
        font-size: 12px;
        line-height: 1.45;
        color: #1f2937;
        display: flex;
        flex-direction: column;
      }
      .a4-top-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 18px;
        border-bottom: 1px solid #e5e7eb;
      }
      .a4-brand-col {
        max-width: 62%;
      }
      .a4-brand-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
      }
      .a4-logo-badge {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: #000000;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 13px;
        letter-spacing: -0.5px;
        margin-right: 10px;
        flex-shrink: 0;
      }
      .a4-logo-img {
        width: 38px;
        height: 38px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        padding: 2px;
        background: #ffffff;
        margin-right: 10px;
        flex-shrink: 0;
      }
      .a4-company-name {
        margin: 0;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: -0.3px;
        color: #000000;
        line-height: 1.25;
        text-transform: uppercase;
      }
      .a4-company-subtitle {
        font-size: 9.5px;
        color: #6b7280;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        letter-spacing: 0.2px;
        margin-top: 1px;
      }
      .a4-company-address {
        font-size: 9.5px;
        color: #6b7280;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        line-height: 1.35;
        max-width: 270px;
        margin-top: 4px;
      }
      .a4-gstin-badge {
        display: inline-flex;
        align-items: center;
        margin-top: 6px;
        padding: 2px 7px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 9px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        color: #1f2937;
      }
      .a4-company-contact {
        font-size: 9px;
        color: #9ca3af;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        margin-top: 3px;
      }
      .a4-invoice-meta-col {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .a4-invoice-title {
        margin: 0 0 2px 0;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.5px;
        color: #111827;
        text-transform: uppercase;
        line-height: 1.1;
      }
      .a4-invoice-num {
        font-size: 11px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        color: #6b7280;
        letter-spacing: 0.5px;
      }
      .a4-date-pill {
        display: inline-flex;
        align-items: center;
        margin-top: 8px;
        padding: 2.5px 8px;
        background: #f3f4f6;
        border-radius: 4px;
        font-size: 9.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #374151;
      }
      .a4-due-pill {
        display: inline-flex;
        align-items: center;
        margin-top: 4px;
        padding: 2.5px 8px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 4px;
        font-size: 9.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #b45309;
        font-weight: 700;
      }
      .a4-po-num {
        font-size: 9px;
        color: #9ca3af;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        margin-top: 4px;
      }
      .a4-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        padding: 14px 0;
        border-bottom: 1px solid #f3f4f6;
        font-size: 11px;
      }
      .a4-field-label {
        font-size: 9px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 3px;
      }
      .a4-client-name {
        font-size: 12.5px;
        font-weight: 800;
        color: #111827;
        line-height: 1.25;
      }
      .a4-client-ref {
        font-size: 10px;
        color: #6b7280;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        margin-top: 1px;
      }
      .a4-client-address {
        font-size: 9.5px;
        color: #4b5563;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        line-height: 1.35;
        max-width: 220px;
        margin-top: 3px;
      }
      .a4-payment-method {
        font-size: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        color: #1f2937;
      }
      .a4-payment-terms {
        font-size: 9.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #4b5563;
        font-weight: 600;
        margin-top: 2px;
      }
      .a4-bank-box {
        margin-top: 8px;
        padding: 6px 8px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 8.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #4b5563;
        line-height: 1.35;
        text-align: right;
      }
      .a4-table-wrap {
        padding: 12px 0 6px 0;
      }
      .a4-table {
        width: 100%;
        border-collapse: collapse;
      }
      .a4-table thead tr {
        border-bottom: 2px solid #111827;
        font-size: 10px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        text-transform: uppercase;
        color: #4b5563;
      }
      .a4-table th {
        padding: 8px 4px;
      }
      .a4-table tbody tr {
        border-bottom: 1px solid #e5e7eb;
        font-size: 11px;
      }
      .a4-table td {
        padding: 9px 4px;
      }
      .a4-totals-row {
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid #e5e7eb;
        padding-top: 10px;
        margin-top: 2px;
      }
      .a4-totals-box {
        width: 220px;
        font-size: 11px;
      }
      .a4-total-line {
        display: flex;
        justify-content: space-between;
        color: #4b5563;
        margin-bottom: 4px;
      }
      .a4-grand-total-line {
        display: flex;
        justify-content: space-between;
        font-weight: 900;
        font-size: 14px;
        color: #111827;
        border-top: 2px solid #111827;
        padding-top: 8px;
        margin-top: 4px;
      }
      .a4-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .a4-footer-row {
        border-top: 1px solid #e5e7eb;
        margin-top: 16px;
        padding-top: 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 10px;
        color: #6b7280;
      }
      .a4-footer-left {
        max-width: 240px;
      }
      .a4-footer-right {
        text-align: right;
      }
      .a4-sign-line {
        width: 120px;
        border-bottom: 1px solid #9ca3af;
        margin-bottom: 3px;
        margin-left: auto;
      }
      .a4-sign-label {
        font-size: 8.5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #9ca3af;
      }

      /* Rubber Stamp for Corporate A4 */
      .a4-stamp {
        position: absolute;
        pointer-events: none;
        border: 3.5px dashed;
        border-radius: 8px;
        padding: 6px 18px;
        font-size: 17px;
        font-weight: 900;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        opacity: 0.88;
        white-space: nowrap;
      }
      .a4-stamp-bottom-right {
        bottom: 16px;
        right: 28px;
        transform: rotate(-7deg);
      }
      .a4-stamp-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-10deg);
      }
      .a4-stamp-top-right {
        top: 80px;
        right: 28px;
        transform: rotate(-10deg);
      }
    </style>
  </head>
  <body>
    ${isThermal ? thermalContent : a4Content}
  </body>
</html>`;
}

/**
 * Triggers browser print/PDF preview exclusively for the invoice document
 * by isolating it in a temporary iframe. This prevents the parent webpage,
 * navbar, sidebar, or UI controls from appearing in the print output.
 */
export function printInvoiceDocument(
  data: InvoiceData,
  format: "a4" | "thermal" = "a4",
  showStamp: boolean = true,
  stampText: string = "PAID IN FULL",
  stampType: "paid" | "verified" | "approved" = "paid",
  stampPosition: "bottom-right" | "center" | "top-right" = "bottom-right"
): void {
  if (typeof window === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.id = "invoice-printer-isolated-frame";
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;z-index:-9999;"
  );
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const html = generateInvoicePrintHtml(data, format, showStamp, stampText, stampType, stampPosition);

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Invoice printing failed:", err);
    } finally {
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          } else if (iframe.remove) {
            iframe.remove();
          }
        } catch {
          // ignore already removed
        }
      }, 2500);
    }
  }, 250);
}

/**
 * Directly downloads the standalone HTML invoice document.
 */
export function downloadInvoiceHtml(
  data: InvoiceData,
  format: "a4" | "thermal" = "a4",
  showStamp: boolean = true,
  stampText: string = "PAID IN FULL",
  stampType: "paid" | "verified" | "approved" = "paid",
  stampPosition: "bottom-right" | "center" | "top-right" = "bottom-right"
): void {
  if (typeof window === "undefined") return;

  const html = generateInvoicePrintHtml(data, format, showStamp, stampText, stampType, stampPosition);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.invoiceNumber || "invoice"}.html`;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// MAIN COMPONENT: INVOICE PRINTER
// ============================================================================

export function InvoicePrinter({
  invoiceData: customData,
  format = "a4",
  theme = "system",
  speed = 1,
  soundEnabled = true,
  autoPrint = false,
  showStamp = true,
  stampText = "PAID IN FULL",
  stampType = "paid",
  stampPosition = "bottom-right",
  allowTear = true,
  showControls = true,
  className,
  printerClassName,
  receiptClassName,
  onPrintStart,
  onPrintComplete,
  onTear,
  onDownload,
  onLogoClick,
}: InvoicePrinterProps) {
  // Merge customized invoice data with defaults
  const data: InvoiceData = {
    ...defaultInvoiceData,
    ...customData,
  };

  const [status, setStatus] = useState<PrinterStatus>("idle");
  const [isTorn, setIsTorn] = useState<boolean>(false);
  const [printPercentage, setPrintPercentage] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const componentId = useId();

  // Sync mute state with prop
  useEffect(() => {
    setIsMuted(!soundEnabled);
    printerAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Determine light/dark theme
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme === "light") {
      setResolvedTheme("light");
    } else if (theme === "dark") {
      setResolvedTheme("dark");
    } else {
      // System or dark class on document element
      const isDocDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      setResolvedTheme(isDocDark ? "dark" : "light");

      if (typeof document === "undefined") return;
      const observer = new MutationObserver(() => {
        const isDarkNow = document.documentElement.classList.contains("dark");
        setResolvedTheme(isDarkNow ? "dark" : "light");
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }
  }, [theme]);

  const isLight = resolvedTheme === "light";
  const printDuration = format === "a4" ? 4.8 / speed : 4.0 / speed;

  // Print execution handler
  const handleStartPrint = () => {
    if (status === "printing") return;

    printerAudio.playButtonClick();
    setStatus("preparing");
    setIsTorn(false);
    setPrintPercentage(0);
    onPrintStart?.();

    setTimeout(() => {
      setStatus("printing");
      if (format === "a4") {
        printerAudio.startOfficePrinterSound(speed);
      } else {
        printerAudio.startPrintingSound(speed);
      }

      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        const pct = Math.min(100, Math.floor((elapsed / printDuration) * 100));
        setPrintPercentage(pct);
        if (pct >= 100) {
          clearInterval(interval);
        }
      }, 40);

      setTimeout(() => {
        clearInterval(interval);
        setPrintPercentage(100);
        printerAudio.stopPrintingSound();
        printerAudio.playStampSound();
        setStatus("completed");
        onPrintComplete?.(data);
      }, printDuration * 1000);
    }, 380);
  };

  // Tear-off execution handler
  const handleTear = () => {
    if (status !== "completed" || isTorn || !allowTear) return;
    printerAudio.playTearSound();
    setIsTorn(true);
    setStatus("torn");
    onTear?.();
  };

  // Reset handler
  const handleReset = () => {
    printerAudio.playButtonClick();
    printerAudio.stopPrintingSound();
    setStatus("idle");
    setIsTorn(false);
    setPrintPercentage(0);
  };

  // Download / Print PDF handler (Prints ONLY the isolated invoice)
  const handleDownload = () => {
    printerAudio.playButtonClick();
    if (onDownload) {
      onDownload(data);
    } else {
      printInvoiceDocument(data, format, showStamp, stampText, stampType, stampPosition);
    }
  };

  // Auto-print on mount if requested
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handleStartPrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      printerAudio.stopPrintingSound();
    };
  }, []);

  // Keyboard shortcut listener: Space to print, T to tear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "idle" || status === "torn" || status === "completed") {
          handleStartPrint();
        }
      }
      if (e.code === "KeyT") {
        if (status === "completed" && !isTorn && allowTear) {
          handleTear();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isTorn, allowTear]);

  // ==========================================================================
  // RENDER: THERMAL POS RECEIPT PRINTER
  // ==========================================================================
  if (format === "thermal") {
    return (
      <div className={cn("flex flex-col items-center justify-start w-full max-w-xl mx-auto select-none py-2", className)}>
        {/* =====================================================================
            PRINTER CHASSIS (OUTLET SLIT IS THE EXACT PHYSICAL BOTTOM END)
            ===================================================================== */}
        <div className={cn("relative w-full max-w-md z-30 flex flex-col items-center", printerClassName)}>
          {/* Ambient Desk Occlusion Shadow */}
          <div
            className="absolute -bottom-6 left-6 right-6 h-10 rounded-full blur-2xl pointer-events-none -z-10 transition-opacity duration-300"
            style={{
              backgroundColor: isLight ? "rgba(0, 0, 0, 0.16)" : "rgba(0, 0, 0, 0.95)",
            }}
          />

          {/* Printer Main Housing */}
          <motion.div
            animate={
              status === "printing"
                ? {
                    x: [-0.4, 0.4, -0.2, 0.2, 0],
                    y: [-0.15, 0.15, -0.1, 0.1, 0],
                  }
                : { x: 0, y: 0 }
            }
            transition={{
              repeat: status === "printing" ? Infinity : 0,
              duration: 0.1,
              ease: "linear",
            }}
            className={cn(
              "w-full relative rounded-t-3xl overflow-hidden border-t-2 border-x-2 transition-all duration-300",
              isLight
                ? "bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#edf2f7] border-slate-300/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]"
                : "bg-gradient-to-b from-[#27272a] via-[#18181b] to-[#101013] border-neutral-700/60 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9)]"
            )}
          >
            {/* PRINTER TOP LID: Paper Roll Compartment, Status LEDs & Latch */}
            <div className="p-4 pb-3 flex items-center justify-between">
              {/* Smoked Roll Inspection Window */}
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "relative w-14 h-7 rounded-lg border overflow-hidden flex items-center justify-center shadow-inner",
                    isLight ? "bg-slate-200/90 border-slate-300" : "bg-black/80 border-neutral-800"
                  )}
                >
                  <div className="flex items-center space-x-0.5">
                    <div className={cn("w-1 h-4 rounded-sm", isLight ? "bg-slate-400" : "bg-neutral-600")} />
                    <div
                      className={cn(
                        "w-8 h-4 rounded-sm flex items-center justify-center shadow-sm",
                        isLight ? "bg-white text-slate-800" : "bg-neutral-100 text-neutral-800"
                      )}
                    >
                      <span className="text-[7px] font-mono font-extrabold tracking-tighter">80mm</span>
                    </div>
                    <div className={cn("w-1 h-4 rounded-sm", isLight ? "bg-slate-400" : "bg-neutral-600")} />
                  </div>
                </div>

                <div>
                  <span className={cn("block text-xs font-bold tracking-wide", isLight ? "text-slate-900" : "text-white")}>
                    THERMAL POS PRINTER
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        status === "printing"
                          ? "bg-amber-400 animate-ping"
                          : status === "completed"
                          ? "bg-emerald-500"
                          : "bg-emerald-500/70"
                      )}
                    />
                    <span className={cn("text-[9px] font-mono font-semibold", isLight ? "text-slate-500" : "text-neutral-400")}>
                      {status === "idle" && "ROLL: 94% • READY"}
                      {status === "preparing" && "HEATING HEAD..."}
                      {status === "printing" && `FEEDING... ${printPercentage}%`}
                      {status === "completed" && "PRINT COMPLETE"}
                      {status === "torn" && "READY FOR NEXT"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware LED Cluster & Latch */}
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center space-y-0.5">
                  <div className="flex space-x-1.5">
                    <span
                      title="Power"
                      className={cn("w-2 h-2 rounded-full", isLight ? "bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.6)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]")}
                    />
                    <span
                      title="Busy"
                      className={cn(
                        "w-2 h-2 rounded-full",
                        status === "printing"
                          ? "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                          : isLight
                          ? "bg-slate-300"
                          : "bg-neutral-800"
                      )}
                    />
                    <span
                      title="Paper"
                      className={cn("w-2 h-2 rounded-full", isLight ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" : "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]")}
                    />
                  </div>
                  <span className={cn("text-[7.5px] font-mono font-bold tracking-widest", isLight ? "text-slate-400" : "text-neutral-600")}>
                    PWR • ERR • PAP
                  </span>
                </div>

                <div
                  className={cn(
                    "w-3 h-5 rounded-sm border shadow-inner flex items-center justify-center",
                    isLight ? "bg-slate-300/80 border-slate-400/80" : "bg-neutral-800 border-neutral-700"
                  )}
                >
                  <span className={cn("w-1.5 h-1 rounded-[1px]", isLight ? "bg-slate-500" : "bg-neutral-500")} />
                </div>
              </div>
            </div>

            {/* CUTTER MOUTH & SERRATED TEETH (Exact Bottom Edge) */}
            <div
              className={cn(
                "relative w-full px-6 pt-1 pb-0 border-t flex flex-col justify-end",
                isLight ? "bg-[#e2e8f0] border-slate-300/90" : "bg-[#111114] border-neutral-800"
              )}
            >
              {/* Recessed Discharge Throat */}
              <div
                className={cn(
                  "relative w-full h-3 rounded-t-sm shadow-inner flex items-center justify-center overflow-hidden",
                  isLight ? "bg-slate-800" : "bg-black"
                )}
              >
                {/* Internal Rubber Pinch Roller */}
                <div
                  className={cn(
                    "w-full h-1 rounded-full opacity-60",
                    isLight ? "bg-slate-600" : "bg-neutral-800"
                  )}
                />
              </div>

              {/* Stainless Steel Serrated Cutter Blade Teeth */}
              <div className="w-full h-2 overflow-hidden text-neutral-400 relative z-30">
                <svg
                  viewBox="0 0 340 8"
                  className={cn("w-full h-2 fill-current", isLight ? "text-slate-400" : "text-neutral-600")}
                  preserveAspectRatio="none"
                >
                  <path d="M0,0 L5,8 L10,0 L15,8 L20,0 L25,8 L30,0 L35,8 L40,0 L45,8 L50,0 L55,8 L60,0 L65,8 L70,0 L75,8 L80,0 L85,8 L90,0 L95,8 L100,0 L105,8 L110,0 L115,8 L120,0 L125,8 L130,0 L135,8 L140,0 L145,8 L150,0 L155,8 L160,0 L165,8 L170,0 L175,8 L180,0 L185,8 L190,0 L195,8 L200,0 L205,8 L210,0 L215,8 L220,0 L225,8 L230,0 L235,8 L240,0 L245,8 L250,0 L255,8 L260,0 L265,8 L270,0 L275,8 L280,0 L285,8 L290,0 L295,8 L300,0 L305,8 L310,0 L315,8 L320,0 L325,8 L330,0 L335,8 L340,0 Z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =====================================================================
            PHYSICS PAPER FEED EMERGENCE (Straight Out from Cutter Teeth)
            ===================================================================== */}
        <div className="relative w-full max-w-md z-20 flex flex-col items-center -mt-[2px]">
          <AnimatePresence mode="wait">
            {(status === "printing" || status === "completed") && !isTorn && (
              <motion.div
                key="attached-receipt"
                initial={{
                  height: 0,
                  opacity: 1,
                  rotateX: 10,
                  transformOrigin: "top center",
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  rotateX: 0,
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15 },
                }}
                transition={{
                  duration: printDuration,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn("w-full flex justify-center overflow-hidden", receiptClassName)}
                style={{
                  perspective: 1200,
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: isLight
                      ? "0 18px 36px -10px rgba(0, 0, 0, 0.18), 0 8px 16px -6px rgba(0, 0, 0, 0.1)"
                      : "0 28px 56px -12px rgba(0, 0, 0, 0.85), 0 12px 24px -6px rgba(0, 0, 0, 0.6)",
                  }}
                  className="w-full max-w-[320px] transition-shadow duration-500"
                >
                  <ThermalReceipt
                    data={data}
                    isCompleted={status === "completed"}
                    showStamp={showStamp}
                    stampText={stampText}
                    stampType={stampType}
                    stampPosition={stampPosition}
                    isTorn={false}
                    onLogoClick={onLogoClick}
                  />
                </motion.div>
              </motion.div>
            )}

            {isTorn && (
              <motion.div
                key="detached-receipt"
                initial={{
                  y: 0,
                  rotate: 0,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  y: 18,
                  rotate: -2.5,
                  scale: 0.98,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn("w-full flex justify-center pt-2", receiptClassName)}
              >
                <div
                  className="w-full max-w-[320px] rounded-sm transition-shadow duration-300"
                  style={{
                    boxShadow: isLight
                      ? "0 20px 35px -10px rgba(0, 0, 0, 0.22)"
                      : "0 30px 60px -15px rgba(0, 0, 0, 0.95)",
                  }}
                >
                  <ThermalReceipt
                    data={data}
                    isCompleted={true}
                    showStamp={showStamp}
                    stampText={stampText}
                    stampType={stampType}
                    stampPosition={stampPosition}
                    isTorn={true}
                    onLogoClick={onLogoClick}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =====================================================================
            OUTER BOTTOM ACTION CONTROLS BAR
            ===================================================================== */}
        {showControls && (
          <div className="w-full max-w-md mt-6 flex flex-col items-center space-y-3 z-40">
            <div className="flex items-center space-x-2.5 w-full justify-center">
              {status === "idle" && (
                <button
                  type="button"
                  onClick={handleStartPrint}
                  className={cn(
                    "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 cursor-pointer active:scale-95 group",
                    isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
                      : "bg-white text-black hover:bg-neutral-200 shadow-white/10"
                  )}
                >
                  <Printer size={16} className="group-hover:scale-110 transition-transform" />
                  <span>PRINT INVOICE</span>
                  <kbd
                    className={cn(
                      "ml-1 text-[10px] px-1.5 py-0.5 rounded border opacity-60 font-mono",
                      isLight ? "border-slate-700 bg-slate-800 text-slate-300" : "border-neutral-300 bg-neutral-100 text-neutral-700"
                    )}
                  >
                    Space
                  </kbd>
                </button>
              )}

              {status === "preparing" && (
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl opacity-90 cursor-wait",
                    isLight ? "bg-slate-800 text-white" : "bg-neutral-800 text-neutral-300"
                  )}
                >
                  <RefreshCw size={15} className="animate-spin text-amber-400" />
                  <span>WARMING UP...</span>
                </button>
              )}

              {status === "printing" && (
                <button
                  type="button"
                  disabled
                  className={cn(
                    "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl cursor-wait",
                    isLight ? "bg-slate-900 text-white" : "bg-neutral-900 text-white border border-neutral-700"
                  )}
                >
                  <RefreshCw size={15} className="animate-spin text-amber-400" />
                  <span>PRINTING... {printPercentage}%</span>
                </button>
              )}

              {status === "completed" && !isTorn && (
                <div className="flex items-center space-x-2 w-full justify-center">
                  {allowTear && (
                    <button
                      type="button"
                      onClick={handleTear}
                      className="flex-1 max-w-[200px] flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-600/25 transition-all cursor-pointer active:scale-95 group"
                    >
                      <Scissors size={15} className="group-hover:scale-110 transition-transform" />
                      <span>TEAR RECEIPT</span>
                      <kbd className="ml-1 text-[10px] px-1 py-0.5 rounded bg-red-800/60 font-mono">
                        T
                      </kbd>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownload}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95",
                      isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white"
                    )}
                    title="Download / Print PDF"
                  >
                    <Download size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95",
                      isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white"
                    )}
                    title="Reset Printer"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}

              {status === "torn" && (
                <div className="flex items-center space-x-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={handleStartPrint}
                    className={cn(
                      "flex-1 max-w-[220px] flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer active:scale-95 group",
                      isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-neutral-200"
                    )}
                  >
                    <Printer size={15} className="group-hover:scale-110 transition-transform" />
                    <span>PRINT ANOTHER</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className={cn(
                      "flex items-center space-x-1.5 py-3 px-4 rounded-2xl border transition-all cursor-pointer text-xs font-bold shadow-sm",
                      isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white"
                    )}
                  >
                    <Download size={14} />
                    <span>PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // RENDER: CORPORATE A4 SHEET PRINTER
  // ==========================================================================
  return (
    <div className={cn("flex flex-col items-center justify-start w-full max-w-2xl mx-auto select-none py-2", className)}>
      {/* A4 Desktop Office Laser Printer Chassis */}
      <div className={cn("relative w-full max-w-lg z-30 flex flex-col items-center", printerClassName)}>
        {/* Soft Ambient Contact Shadow */}
        <div
          className="absolute -bottom-8 left-10 right-10 h-12 rounded-full blur-2xl pointer-events-none -z-10"
          style={{
            backgroundColor: isLight ? "rgba(0, 0, 0, 0.16)" : "rgba(0, 0, 0, 0.95)",
          }}
        />

        {/* Top Paper In-Feed Tray (Paper Stack Behind) */}
        <div
          className={cn(
            "w-[75%] h-8 rounded-t-xl border-t border-x flex items-center justify-center relative -mb-1",
            isLight ? "bg-slate-200 border-slate-300 shadow-inner" : "bg-neutral-800 border-neutral-700 shadow-inner"
          )}
        >
          {/* Staged blank A4 sheets in tray */}
          <div className="w-[85%] h-5 bg-white rounded-t border-t border-x border-neutral-300 shadow-sm flex items-center justify-center">
            <div className="w-full flex justify-between px-3 text-[8px] font-mono text-neutral-400 font-bold">
              <span>A4 // 80 GSM</span>
              <span>READY</span>
            </div>
          </div>
        </div>

        {/* Main Office Printer Housing */}
        <motion.div
          animate={
            status === "printing"
              ? {
                  x: [-0.3, 0.3, -0.2, 0.2, 0],
                  y: [-0.1, 0.1, 0],
                }
              : { x: 0, y: 0 }
          }
          transition={{
            repeat: status === "printing" ? Infinity : 0,
            duration: 0.15,
            ease: "linear",
          }}
          className={cn(
            "w-full relative rounded-2xl overflow-hidden border-2 transition-all duration-300",
            isLight
              ? "bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-300/80 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.12)]"
              : "bg-gradient-to-b from-[#242428] via-[#1a1a1d] to-[#121214] border-neutral-700 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9)]"
          )}
        >
          {/* Front Control Fascia */}
          <div className="p-4 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shadow-inner",
                  isLight ? "bg-slate-200 text-slate-800" : "bg-black text-white"
                )}
              >
                <Printer size={16} />
              </div>
              <div>
                <span className={cn("block text-xs font-bold tracking-wide", isLight ? "text-slate-900" : "text-white")}>
                  INVOICE PRINTER
                </span>
                <span className={cn("text-[9px] font-mono font-medium", isLight ? "text-slate-500" : "text-neutral-400")}>
                  DESKTOP LASERJET • 600 DPI
                </span>
              </div>
            </div>

            {/* Diagnostic readout */}
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9.5px] font-mono border",
                  isLight
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-black/70 border-neutral-800 text-neutral-300"
                )}
              >
                {status === "idle" && "READY"}
                {status === "preparing" && "PROCESSING..."}
                {status === "printing" && `PRINTING ${printPercentage}%`}
                {status === "completed" && "COMPLETED"}
              </div>
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  status === "printing"
                    ? "bg-amber-400 animate-ping"
                    : status === "completed"
                    ? "bg-emerald-500"
                    : "bg-emerald-500/80"
                )}
              />
            </div>
          </div>

          {/* Front Output Ejection Slot */}
          <div
            className={cn(
              "w-full px-6 pt-1 pb-0 border-t flex flex-col justify-end",
              isLight ? "bg-slate-200/80 border-slate-300" : "bg-neutral-900 border-neutral-800"
            )}
          >
            <div
              className={cn(
                "relative w-full h-3 rounded-t-sm shadow-inner flex items-center justify-center overflow-hidden",
                isLight ? "bg-slate-800" : "bg-black"
              )}
            >
              <div className={cn("w-full h-1 rounded-full opacity-60", isLight ? "bg-slate-600" : "bg-neutral-800")} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* A4 Sheet Emergence Animation */}
      <div className="relative w-full max-w-lg z-20 flex flex-col items-center -mt-[2px]">
        <AnimatePresence>
          {(status === "printing" || status === "completed") && (
            <motion.div
              key="a4-sheet-emergence"
              initial={{ height: 0, opacity: 1, rotateX: 6 }}
              animate={{ height: "auto", opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              transition={{
                duration: printDuration,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn("w-full flex justify-center overflow-hidden pt-1", receiptClassName)}
            >
              <A4InvoiceSheet
                data={data}
                isCompleted={status === "completed"}
                showStamp={showStamp}
                stampText={stampText}
                stampType={stampType}
                stampPosition={stampPosition}
                onLogoClick={onLogoClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Controls for A4 */}
      {showControls && (
        <div className="w-full max-w-lg mt-6 flex flex-col items-center space-y-3 z-40">
          <div className="flex items-center space-x-2.5 w-full justify-center">
            {status === "idle" && (
              <button
                type="button"
                onClick={handleStartPrint}
                className={cn(
                  "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 cursor-pointer active:scale-95 group",
                  isLight
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
                    : "bg-white text-black hover:bg-neutral-200 shadow-white/10"
                )}
              >
                <Printer size={16} className="group-hover:scale-110 transition-transform" />
                <span>PRINT INVOICE</span>
                <kbd
                  className={cn(
                    "ml-1 text-[10px] px-1.5 py-0.5 rounded border opacity-60 font-mono",
                    isLight ? "border-slate-700 bg-slate-800 text-slate-300" : "border-neutral-300 bg-neutral-100 text-neutral-700"
                  )}
                >
                  Space
                </kbd>
              </button>
            )}

            {status === "preparing" && (
              <button
                type="button"
                disabled
                className={cn(
                  "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl opacity-90 cursor-wait",
                  isLight ? "bg-slate-800 text-white" : "bg-neutral-800 text-neutral-300"
                )}
              >
                <RefreshCw size={15} className="animate-spin text-amber-400" />
                <span>WARMING UP...</span>
              </button>
            )}

            {status === "printing" && (
              <button
                type="button"
                disabled
                className={cn(
                  "flex-1 max-w-[280px] flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl cursor-wait",
                  isLight ? "bg-slate-900 text-white" : "bg-neutral-900 text-white border border-neutral-700"
                )}
              >
                <RefreshCw size={15} className="animate-spin text-amber-400" />
                <span>PRINTING A4... {printPercentage}%</span>
              </button>
            )}

            {status === "completed" && (
              <div className="flex items-center space-x-2 w-full justify-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 max-w-[200px] flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 group"
                >
                  <Download size={15} className="group-hover:scale-110 transition-transform" />
                  <span>DOWNLOAD PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className={cn(
                    "p-3 rounded-2xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95",
                    isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-neutral-900 border-neutral-700 text-neutral-200 hover:text-white"
                  )}
                  title="Reset Printer"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoicePrinter;
