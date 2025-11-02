import React, { useState } from 'react';
import { analyzeProductUrl } from './services/geminiService';
import { getPriceHistory, savePriceHistory } from './services/historyService';
import type { AnalysisResult, PriceHistoryEntry, GroundingChunk } from './types';
import AnalysisResultCard from './components/AnalysisResult';
import Loader from './components/Loader';
import { BeakerIcon } from './components/icons';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleAnalyzeClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) {
      return;
    }

    try {
      new URL(url);
    } catch (_) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSources([]);
    setPriceHistory([]);

    try {
      const { result, sources } = await analyzeProductUrl(url);
      setAnalysisResult(result);
      setSources(sources);
      if (result && result.bestDeal && result.productName !== 'Product Not Found') {
        savePriceHistory(url, result.bestDeal.price);
        setPriceHistory(getPriceHistory(url));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-cyan-300 selection:text-cyan-900">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"
          aria-hidden="true"
        ></div>
        <main className="container mx-auto max-w-2xl w-full z-10">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-2">
              <BeakerIcon className="w-10 h-10 text-cyan-400"/>
              <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
                Deal Analyzer AI
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Paste a product link from any major e-commerce site to find the best deal.
            </p>
          </header>

          <form onSubmit={handleAnalyzeClick} className="w-full mb-8">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.example-store.com/product/..."
                className="w-full p-4 pr-32 text-lg bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-slate-200 placeholder-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </form>

          <div className="w-full">
            {isLoading && <Loader />}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center animate-fade-in">
                <p className="font-semibold">Analysis Failed</p>
                <p>{error}</p>
              </div>
            )}
            {analysisResult && <AnalysisResultCard result={analysisResult} history={priceHistory} sources={sources} />}
          </div>
        </main>

        <footer className="text-center text-slate-500 mt-12 z-10">
            <p>Powered by Gemini API with Google Search</p>
        </footer>
    </div>
  );
};

export default App;
