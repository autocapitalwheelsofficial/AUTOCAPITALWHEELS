'use client';

import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

interface EmiCalculatorProps {
  vehiclePrice: number;
}

export default function EmiCalculator({ vehiclePrice }: EmiCalculatorProps) {
  // We assume a standard 20% down payment by default for realistic numbers
  const defaultDownPayment = Math.round(vehiclePrice * 0.20);
  const defaultLoanAmount = vehiclePrice - defaultDownPayment;

  const [loanAmount, setLoanAmount] = useState<number>(defaultLoanAmount);
  const [interestRate, setInterestRate] = useState<number>(9.5); // Default 9.5%
  const [tenureYears, setTenureYears] = useState<number>(5); // Default 5 years
  const [emi, setEmi] = useState<number>(0);

  useEffect(() => {
    // Calculate EMI
    // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (P > 0 && r > 0 && n > 0) {
      const calculatedEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(Math.round(calculatedEmi));
    } else {
      setEmi(0);
    }
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <div className="bg-[#121215] border border-[#1f1f26] hover:border-[#b48d36]/20 transition-all duration-300 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 mb-6 border-b border-[#1f1f26] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#b48d36]/10 flex items-center justify-center">
          <Calculator className="text-[#b48d36]" size={20} />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg tracking-wide uppercase">EMI Calculator</h3>
          <p className="text-[10px] text-neutral-400 tracking-widest uppercase">Estimate Your Monthly Payment</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Loan Amount (₹)</label>
            <span className="text-xs font-bold text-white">₹{(loanAmount / 100000).toFixed(2)} Lakh</span>
          </div>
          <input
            type="range"
            min={100000}
            max={vehiclePrice}
            step={50000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#b48d36]"
          />
          <div className="flex justify-between mt-1 text-[9px] text-neutral-500 font-medium">
            <span>₹1L</span>
            <span>₹{(vehiclePrice / 100000).toFixed(2)}L</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Interest Rate (%)</label>
            <span className="text-xs font-bold text-white">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={7}
            max={15}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#b48d36]"
          />
          <div className="flex justify-between mt-1 text-[9px] text-neutral-500 font-medium">
            <span>7%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Loan Tenure (Years)</label>
            <span className="text-xs font-bold text-white">{tenureYears} Years</span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#b48d36]"
          />
          <div className="flex justify-between mt-1 text-[9px] text-neutral-500 font-medium">
            <span>1 Yr</span>
            <span>7 Yrs</span>
          </div>
        </div>

        {/* Result */}
        <div className="bg-[#0a0a0c] border border-neutral-800/50 rounded-xl p-5 mt-4 text-center hover:shadow-[0_0_20px_rgba(180,141,54,0.05)] transition-all duration-300">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Estimated EMI</p>
          <p className="font-display font-black text-3xl text-metallic-gold drop-shadow-md">
            ₹{emi.toLocaleString('en-IN')} <span className="text-sm text-neutral-500 font-medium">/mo</span>
          </p>
          <p className="text-[9px] text-neutral-500 mt-2 font-medium">
            *Indicative figures based on provided inputs. Final terms may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
