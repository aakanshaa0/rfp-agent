'use client';

import { useState, useEffect } from 'react';
import { api, getAuthToken, removeAuthToken } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  FaFileUpload,
  FaCheckCircle,
  FaKey,
  FaBullseye,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaTrash,
  FaClock,
  FaUpload,
  FaGlobe,
  FaRobot,
  FaUsers,
  FaChartBar,
} from 'react-icons/fa';
import dynamic from 'next/dynamic';

const ProposalPDF = dynamic(() => import('@/components/ProposalPDF'), { ssr: false });

interface MatchedProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  score: number;
  unitPrice?: number;
  testingFee?: number;
}

interface PriceBreakdown {
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    productCost: number;
    testingFee: number;
  }>;
  subtotal: number;
  testingFees: number;
  logistics: number;
  contingency: number;
  total: number;
}

export default function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [rfps, setRfps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRfp, setCurrentRfp] = useState<any>(null);
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [step, setStep] = useState<'scan' | 'upload' | 'matching' | 'pricing' | 'proposal'>('scan');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      alert('Please login first');
      window.location.href = '/';
      return;
    }
    loadRfps();
  }, []);

  const loadRfps = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await api.getRfps();
      setRfps(response.rfps || []);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
      if (error instanceof Error && error.message.includes('Failed to fetch RFPs')) {
        alert('Session expired. Please login again.');
        removeAuthToken();
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setStep('upload');

    try {
      const result = await api.uploadRfp(file);
      setCurrentRfp(result);
      loadRfps();

      await matchProducts(result.rfpId, result.extractedData.text);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Make sure backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const matchProducts = async (rfpId: string, extractedText: string) => {
    setStep('matching');
    try {
      const response = await api.matchProducts(rfpId, extractedText);
      setMatchedProducts(response.matches || []);

      const initialQuantities: Record<string, number> = {};
      response.matches?.forEach((match: MatchedProduct) => {
        initialQuantities[match.id] = 1;
      });
      setQuantities(initialQuantities);

      setStep('pricing');
    } catch (error) {
      console.error('Matching error:', error);
      alert('Failed to match products');
    }
  };

  const calculatePricing = async () => {
    if (!currentRfp || matchedProducts.length === 0) return;

    try {
      const matchesWithPricing = matchedProducts.map(m => ({
        productId: m.id,
        name: m.name,
        unitPrice: m.unitPrice || 100,
        testingFee: m.testingFee || 50,
      }));

      const response = await api.calculatePrice(currentRfp.rfpId, matchesWithPricing, quantities);
      setPriceBreakdown(response.priceBreakdown);
      setStep('proposal');
    } catch (error) {
      console.error('Pricing error:', error);
      alert('Failed to calculate pricing');
    }
  };

  const generateProposal = async () => {
    if (!currentRfp || !priceBreakdown) return;

    try {
      const response = await api.createProposal(
        currentRfp.rfpId,
        matchedProducts,
        priceBreakdown
      );
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Proposal error:', error);
      alert('Failed to create proposal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this RFP?')) return;
    try {
      await api.deleteRfp(id);
      loadRfps();
      if (currentRfp?.rfpId === id) {
        setCurrentRfp(null);
        setMatchedProducts([]);
        setPriceBreakdown(null);
        setStep('upload');
      }
    } catch (error) {
      alert('Failed to delete RFP');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-rajdhani">
      <Navbar showLogout />

      <div className="flex-1 py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4">
              Agentic AI <span className="text-cyan-neon">RFP Automation</span>
            </h1>
            <p className="text-cyan-neon text-lg">
              From portal discovery to proposal generation - powered by 5 specialized AI agents
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {(['scan', 'upload', 'matching', 'pricing', 'proposal'] as const).map((s, idx) => {
              const stepIndex = ['scan', 'upload', 'matching', 'pricing', 'proposal'].indexOf(step);
              const currentIndex = ['scan', 'upload', 'matching', 'pricing', 'proposal'].indexOf(s);
              const isCompleted = currentIndex < stepIndex;
              const isCurrent = step === s;

              return (
                <button
                  key={s}
                  onClick={() => {
                    if (currentIndex <= stepIndex) {
                      setStep(s);
                    }
                  }}
                  disabled={currentIndex > stepIndex}
                  className={`px-5 py-3 rounded-lg border-2 font-bold flex items-center gap-2 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-green-neon/20 border-green-neon text-green-neon shadow-[0_0_20px_rgba(0,255,0,0.5)] scale-105'
                      : isCompleted
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(255,255,0,0.3)] hover:scale-105 cursor-pointer'
                      : 'bg-white/5 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      isCurrent
                        ? 'bg-green-neon text-black'
                        : isCompleted
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span className="capitalize text-sm">
                    {s === 'scan' ? 'Portal Scan' : s === 'matching' ? 'Product Match' : s}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Step: Portal Scan */}
          {step === 'scan' && (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-2 border-cyan-neon/30 rounded-2xl p-10 shadow-neon-cyan mb-8 hover:border-cyan-neon transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-neon/20 rounded-lg">
                  <FaGlobe className="text-cyan-neon text-4xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-cyan-neon text-shadow-cyan">
                    Portal Discovery (Sales Agent)
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Scan tender portals to discover new RFP opportunities with upcoming deadlines
                  </p>
                </div>
              </div>

              <div className="bg-cyan-neon/10 border-2 border-cyan-neon/50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <FaRobot className="text-cyan-neon text-2xl mt-1" />
                  <div>
                    <h3 className="text-white text-lg font-bold mb-2">Sales Agent Status</h3>
                    <p className="text-gray-400 text-sm">
                      The Sales Agent continuously monitors predefined tender URLs to identify RFP opportunities due within three months.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#0A0A0A] border border-cyan-neon/30 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Portals Monitored</p>
                    <p className="text-cyan-neon text-2xl font-bold">5+</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-cyan-neon/30 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Active RFPs</p>
                    <p className="text-cyan-neon text-2xl font-bold">{rfps.length}</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-cyan-neon/30 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1">Last Scan</p>
                    <p className="text-cyan-neon text-2xl font-bold">Live</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setScanning(true);
                  setStep('upload');
                  setTimeout(() => setScanning(false), 2000);
                }}
                disabled={scanning}
                className={`px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 border-2 flex items-center gap-3 mx-auto block ${
                  scanning
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-neon to-[#0080FF] border-cyan-neon text-white shadow-neon-cyan hover:-translate-y-1 hover:scale-105 hover:shadow-neon-cyan-lg'
                }`}
              >
                <FaGlobe className="text-2xl" />
                <span>{scanning ? 'Scanning Portals...' : 'Scan Tender Portals'}</span>
              </button>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-2 border-magenta-neon/30 rounded-2xl p-10 shadow-neon-magenta mb-8 hover:border-magenta-neon transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-magenta-neon/20 rounded-lg">
                  <FaUsers className="text-magenta-neon text-4xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-magenta-neon text-shadow-magenta">
                    Master Agent Coordination
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Upload RFP document for Master Agent to coordinate specialized worker agents
                  </p>
                </div>
              </div>

              <label
                className={`inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg cursor-pointer transition-all duration-300 border-2 ${
                  uploading
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-magenta-neon to-[#FF0080] border-magenta-neon text-white shadow-neon-magenta hover:-translate-y-1 hover:scale-105 hover:shadow-neon-magenta-lg'
                }`}
              >
                <FaUpload className="text-2xl" />
                <span>{uploading ? 'Processing Your Document...' : 'Select PDF File to Upload'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {currentRfp && (
                <div className="mt-8 p-6 bg-magenta-neon/10 border-2 border-magenta-neon/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCheckCircle className="text-magenta-neon text-2xl" />
                    <p className="text-magenta-neon text-xl font-bold">{currentRfp.filename}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="font-semibold">RFP ID:</span>
                      <span className="text-magenta-neon">{currentRfp.rfpId}</span>
                    </div>
                    {currentRfp.extractedData?.keywords && (
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <FaKey className="text-magenta-neon mt-1" />
                        <div>
                          <span className="font-semibold">Keywords: </span>
                          <span className="text-gray-400">
                            {currentRfp.extractedData.keywords.slice(0, 5).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Matching */}
          {step === 'matching' && matchedProducts.length > 0 && (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-2 border-green-neon/30 rounded-2xl p-10 shadow-neon-green mb-8 hover:border-green-neon transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-neon/20 rounded-lg">
                  <FaBullseye className="text-green-neon text-4xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-green-neon text-shadow-green">
                    Technical Processing (Technical Agent)
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Products matched with Spec Match percentages based on RFP specifications
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {matchedProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="bg-[#0A0A0A] border-2 border-green-neon/30 rounded-xl p-6 hover:border-green-neon hover:shadow-neon-green transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-cyan-neon/20 text-cyan-neon text-sm font-bold rounded">
                            #{idx + 1}
                          </span>
                          <h3 className="text-white text-2xl font-bold">{product.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 font-semibold">{product.category}</p>
                        {product.description && (
                          <p className="text-gray-300 text-sm mt-3 leading-relaxed">{product.description}</p>
                        )}
                      </div>
                      <div
                        className={`ml-4 px-8 py-4 rounded-xl font-black text-2xl min-w-[120px] text-center bg-gradient-to-r ${getScoreColor(
                          product.score
                        )} border-2 ${getScoreTextColor(product.score).replace(
                          'text-',
                          'border-'
                        )} shadow-lg`}
                      >
                        {product.score}%
                      </div>
                    </div>
                    <div className="flex gap-4 items-center mt-4 pt-4 border-t-2 border-gray-700">
                      <label className="text-gray-300 text-base flex items-center gap-3">
                        <span className="font-bold">Quantity:</span>
                        <input
                          type="number"
                          min="1"
                          value={quantities[product.id] || 1}
                          onChange={(e) =>
                            setQuantities({ ...quantities, [product.id]: parseInt(e.target.value) || 1 })
                          }
                          className="px-4 py-3 bg-[#1A1A1A] border-2 border-cyan-neon/50 rounded-lg text-white w-28 focus:outline-none focus:border-cyan-neon focus:shadow-neon-cyan font-bold text-lg"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={calculatePricing}
                className="mt-8 px-10 py-5 bg-gradient-to-r from-orange-500 to-[#FF8C00] border-2 border-orange-500 rounded-xl text-white font-black text-xl shadow-[0_0_20px_rgba(255,165,0,0.6)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,165,0,0.9)] flex items-center gap-3 mx-auto block"
              >
                <FaDollarSign className="text-2xl" />
                Calculate Complete Pricing (Pricing Agent)
              </button>
            </div>
          )}

          {/* Step: Pricing */}
          {step === 'pricing' && priceBreakdown && (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-2 border-orange-500/30 rounded-2xl p-10 shadow-[0_0_30px_rgba(255,165,0,0.3)] mb-8 hover:border-orange-500 transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <FaFileInvoiceDollar className="text-orange-500 text-4xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-orange-500 text-shadow">
                    Cost Calculation (Pricing Agent)
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Complete project costs with testing fees, logistics, and contingency
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {priceBreakdown.products.map((p, idx) => (
                  <div key={idx} className="px-3 py-2 bg-green-neon/5 rounded flex justify-between">
                    <span className="text-gray-300">
                      {p.name} (x{p.quantity})
                    </span>
                    <span className="text-green-neon font-bold">${p.productCost.toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t border-gray-700 mt-3 pt-3 space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">${priceBreakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Testing Fees:</span>
                    <span className="text-white">${priceBreakdown.testingFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Logistics (8%):</span>
                    <span className="text-white">${priceBreakdown.logistics.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Contingency (5%):</span>
                    <span className="text-white">${priceBreakdown.contingency.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-t-2 border-green-neon mt-2">
                    <span className="text-green-neon text-xl font-bold">TOTAL:</span>
                    <span className="text-green-neon text-xl font-bold">
                      ${priceBreakdown.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('proposal')}
                className="mt-8 px-10 py-5 bg-gradient-to-r from-green-neon to-[#00FF80] border-2 border-green-neon rounded-xl text-black font-black text-xl shadow-neon-green transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-neon-green-lg flex items-center gap-3 mx-auto block"
              >
                <FaChartBar className="text-2xl" />
                Generate Final Proposal
              </button>
            </div>
          )}

{/* Step: Proposal & Archive */}
{step === 'proposal' && (
  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-2 border-orange-500/30 rounded-2xl p-10 shadow-[0_0_30px_rgba(255,165,0,0.3)] mb-8 hover:border-orange-500 transition-all duration-300">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-orange-500/20 rounded-lg">
        <FaClipboardList className="text-orange-500 text-4xl" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-orange-500 text-shadow">
          Proposal Generation & RFP Archive
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Download generated proposals and view all your RFP documents
        </p>
      </div>
    </div>

    {currentRfp && priceBreakdown && (
      <div className="mb-8 p-6 bg-green-neon/10 border-2 border-green-neon/50 rounded-xl">
        <h3 className="text-green-neon text-xl font-bold mb-4 flex items-center gap-2">
          <FaCheckCircle />
          Proposal Ready for {currentRfp.filename}
        </h3>
        <ProposalPDF
          rfpDetails={{
            rfpId: currentRfp.rfpId,
            filename: currentRfp.filename,
            createdAt: currentRfp.createdAt || new Date().toISOString(),
          }}
          matchedProducts={matchedProducts}
          priceBreakdown={priceBreakdown}
          quantities={quantities}
        />
      </div>
    )}

    {/* RFP Archive List */}
    {loading ? (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">Loading your documents...</p>
      </div>
    ) : rfps.length === 0 ? (
      <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
        <FaClipboardList className="text-gray-600 text-5xl mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No RFPs uploaded yet</p>
        <p className="text-gray-500 text-sm mt-2">Upload your first RFP document above to get started</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4">
        {rfps.map((rfp) => (
          <div
            key={rfp._id}
            className="bg-[#0A0A0A] border-2 border-orange-500/30 rounded-xl p-6 flex justify-between items-center hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,165,0,0.4)] transition-all duration-300"
          >
            <div className="flex-1">
              <h3 className="text-cyan-neon text-xl mb-2 font-bold">{rfp.filename}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold ${
                      rfp.status === 'processed'
                        ? 'bg-green-500/20 text-green-500 border border-green-500'
                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500'
                    }`}
                  >
                    {rfp.status}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <FaClock className="text-xs" />
                  <span>{new Date(rfp.createdAt).toLocaleDateString()}</span>
                </div>
                {rfp.language && (
                  <>
                    <span>•</span>
                    <span>Language: {rfp.language}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(rfp._id)}
              className="px-5 py-3 bg-transparent border-2 border-red-500 text-red-500 rounded-lg cursor-pointer text-sm font-bold transition-all duration-300 hover:bg-red-500 hover:text-white hover:scale-105 flex items-center gap-2"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>

      <Footer />
    </div>
  );
}