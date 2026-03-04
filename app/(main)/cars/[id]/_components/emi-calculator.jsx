"use client";

import React, { useEffect, useState } from "react";

function EmiCalculator({ price = 1500000 }) {
  const [loanAmount, setLoanAmount] = useState(price);
  const [downPayment, setDownPayment] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(0);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTenure, setLoanTenure] = useState(4);
  const [results, setResults] = useState(null);

  const MIN_PRICE = 500000;
  const MAX_PRICE = 15000000;

  const handleLoanAmountChange = (value) => {
    const newLoanAmount = Math.min(Math.max(value, MIN_PRICE), MAX_PRICE);
    setLoanAmount(newLoanAmount);

    const newDownPayment = (downPaymentPercent / 100) * newLoanAmount;
    setDownPayment(newDownPayment);

    calculateLoan(newLoanAmount, newDownPayment, interestRate, loanTenure);
  };

  const handleDownPaymentChange = (value) => {
    const newDownPayment = Math.min(Math.max(value, 0), loanAmount);
    setDownPayment(newDownPayment);
    setDownPaymentPercent((newDownPayment / loanAmount) * 100);

    calculateLoan(loanAmount, newDownPayment, interestRate, loanTenure);
  };

  const handleInterestRateChange = (value) => {
    const newRate = Math.min(Math.max(value, 5), 25);
    setInterestRate(newRate);
    calculateLoan(loanAmount, downPayment, newRate, loanTenure);
  };

  const handleLoanTenureChange = (value) => {
    const newTenure = Math.min(Math.max(value, 1), 8);
    setLoanTenure(newTenure);
    calculateLoan(loanAmount, downPayment, interestRate, newTenure);
  };

  const calculateLoan = (principal, down, rate, years) => {
    const loanPrincipal = principal - down;
    if (loanPrincipal <= 0) {
      setResults(null);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    const emi =
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanPrincipal;

    setResults({
      emi,
      totalInterest,
      totalPayment,
      loanPrincipal,
      downPayment: down,
    });
  };

  useEffect(() => {
    calculateLoan(loanAmount, downPayment, interestRate, loanTenure);
  }, []);

  const formatKES = (num) =>
    new Intl.NumberFormat("en-KE").format(Math.round(num));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        Car Loan EMI Calculator
      </h2>

      {/* Vehicle Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Vehicle Price (KSh)
        </label>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => handleLoanAmountChange(+e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
        />
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          value={loanAmount}
          onChange={(e) => handleLoanAmountChange(+e.target.value)}
          className="w-full"
        />
      </div>

      {/* Down Payment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Down Payment (KSh)
        </label>
        <input
          type="number"
          value={downPayment}
          onChange={(e) => handleDownPaymentChange(+e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
        />
        <input
          type="range"
          min={0}
          max={loanAmount}
          value={downPayment}
          onChange={(e) => handleDownPaymentChange(+e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          {downPaymentPercent.toFixed(1)}% of vehicle price
        </p>
      </div>

      {/* Rate & Term */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Interest Rate (% p.a)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => handleInterestRateChange(+e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Loan Term (Years)
          </label>
          <input
            type="number"
            value={loanTenure}
            onChange={(e) => handleLoanTenureChange(+e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-50 border rounded-xl p-5 space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">Monthly EMI</p>
            <p className="text-3xl font-bold text-black">
              KSh {formatKES(results.emi)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <p>
              <span className="text-gray-500">Loan Amount:</span>{" "}
              <strong>KSh {formatKES(results.loanPrincipal)}</strong>
            </p>
            <p>
              <span className="text-gray-500">Total Interest:</span>{" "}
              <strong>KSh {formatKES(results.totalInterest)}</strong>
            </p>
            <p>
              <span className="text-gray-500">Total Payment:</span>{" "}
              <strong>KSh {formatKES(results.totalPayment)}</strong>
            </p>
            <p>
              <span className="text-gray-500">Total Cost:</span>{" "}
              <strong>
                KSh{" "}
                {formatKES(
                  results.downPayment + results.totalPayment
                )}
              </strong>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        * EMI values are estimates and may vary based on bank or SACCO terms.
      </p>
    </div>
  );
}

export default EmiCalculator;
export { EmiCalculator };
