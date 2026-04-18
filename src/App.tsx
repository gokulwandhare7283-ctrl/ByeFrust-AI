import { useState, useEffect } from 'react';
import { getNextQuestion, getTotalQuestions, Question } from './data/questions';
import { scoreProducts, ScoredProduct, getTradeoffs, parseBudget } from './lib/scoring';
import { generateExplanation } from './lib/gemini';
import { Bot, User, RefreshCw, ChevronRight, Star, ThumbsUp, ThumbsDown, Cpu, Info, X, CheckCircle2, Circle } from 'lucide-react';

export default function App() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [showHelp, setShowHelp] = useState(false);
  
  const nextQ = getNextQuestion(answers);
  const totalQ = getTotalQuestions(answers);
  const answeredQ = Object.keys(answers).length;
  const progress = Math.min((answeredQ / Math.max(totalQ, 1)) * 100, 100);

  useEffect(() => {
    setShowHelp(false);
  }, [nextQ?.key]);

  const handleNext = () => {
    if (nextQ) {
      if (nextQ.type === 'multiselect' && currentAnswer.length > 3) {
        alert("Please select up to 3 options.");
        return;
      }
      if ((!currentAnswer || currentAnswer.length === 0) && nextQ.type !== 'text') {
        alert("Please provide an answer.");
        return;
      }
      
      const newAnswers = { ...answers, [nextQ.key]: currentAnswer };
      setAnswers(newAnswers);
      
      const upcomingQ = getNextQuestion(newAnswers);
      
      if (upcomingQ) {
        if (upcomingQ.type === 'multiselect') setCurrentAnswer([]);
        else if (upcomingQ.type === 'slider') setCurrentAnswer(3);
        else setCurrentAnswer('');
      } else {
        setInterviewComplete(true);
      }
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setInterviewComplete(false);
    setCurrentAnswer('');
  };

  const isTechSavvy = answers.tech_comfort_level?.includes("tech-savvy");
  const shouldShowHelpButton = nextQ?.help_text && !isTechSavvy;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold leading-tight">ByeFrust AI</h1>
              <p className="text-xs text-gray-500">End the confusion. Make confident choices.</p>
            </div>
          </div>
          <button 
            onClick={handleRestart}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!interviewComplete ? (
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Question {answeredQ + 1} of ~{totalQ}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Chat History */}
            <div className="space-y-4 mb-8">
              {Object.entries(answers).map(([key, val]) => (
                <div key={key} className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                    <span className="text-xs opacity-75 block mb-1 capitalize">{key.replace(/_/g, ' ')}</span>
                    {Array.isArray(val) ? val.join(', ') : val}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Question */}
            {nextQ && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl rounded-tl-sm shadow-sm flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-medium text-lg">{typeof nextQ.text === 'function' ? nextQ.text(answers) : nextQ.text}</h3>
                    {shouldShowHelpButton && (
                      <button 
                        onClick={() => setShowHelp(!showHelp)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors flex-shrink-0"
                        title="What does this mean?"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {showHelp && shouldShowHelpButton && (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-sm animate-in fade-in slide-in-from-top-2">
                      <div className="font-bold flex items-center gap-2 mb-1">
                        <Info className="w-4 h-4" /> What does this mean?
                      </div>
                      <p>{nextQ.help_text}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {nextQ.type === 'radio' && (
                      <div className="space-y-2">
                        {(typeof nextQ.options === 'function' ? nextQ.options(answers) : (nextQ.options as string[])).map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input 
                              type="radio" 
                              name={nextQ.key} 
                              value={opt}
                              checked={currentAnswer === opt}
                              onChange={(e) => setCurrentAnswer(e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {nextQ.type === 'selectbox' && (
                      <select 
                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                      >
                        <option value="" disabled>Select an option...</option>
                        {(typeof nextQ.options === 'function' ? nextQ.options(answers) : (nextQ.options as string[])).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {nextQ.type === 'multiselect' && (
                      <div className="flex flex-wrap gap-2">
                        {(typeof nextQ.options === 'function' ? nextQ.options(answers) : (nextQ.options as string[])).map(opt => {
                          const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                const curr = Array.isArray(currentAnswer) ? currentAnswer : [];
                                if (isSelected) {
                                  setCurrentAnswer(curr.filter(item => item !== opt));
                                } else {
                                  if (curr.length < 3) setCurrentAnswer([...curr, opt]);
                                }
                              }}
                              className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                                isSelected 
                                  ? 'bg-blue-600 text-white border-blue-600' 
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {nextQ.type === 'slider' && (
                      <div className="space-y-4 px-2">
                        <input 
                          type="range" 
                          min={(typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options)![0] as number} 
                          max={(typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options)![1] as number} 
                          value={currentAnswer || 3}
                          onChange={(e) => setCurrentAnswer(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                          <span>{(typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options)![0]} (Low)</span>
                          <span className="text-blue-600 font-bold text-lg">{currentAnswer || 3}</span>
                          <span>{(typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options)![1]} (High)</span>
                        </div>
                      </div>
                    )}

                    {nextQ.type === 'text' && (
                      <input 
                        type="text" 
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      />
                    )}

                    {['radio', 'selectbox', 'multiselect'].includes(nextQ.type) && (
                      <div className="pt-2 border-t mt-4">
                        <p className="text-sm text-gray-500 mb-2 mt-2">Or, if none of these fit, you can type your own answer:</p>
                        <input 
                          type="text" 
                          value={
                            nextQ.type === 'multiselect' 
                              ? (Array.isArray(currentAnswer) && currentAnswer.length === 1 && !((typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options) as string[])?.includes(currentAnswer[0]) ? currentAnswer[0] : '')
                              : (typeof currentAnswer === 'string' && !((typeof nextQ.options === 'function' ? nextQ.options(answers) : nextQ.options) as string[])?.includes(currentAnswer) ? currentAnswer : '')
                          }
                          onChange={(e) => {
                            if (nextQ.type === 'multiselect') {
                              setCurrentAnswer(e.target.value ? [e.target.value] : []);
                            } else {
                              setCurrentAnswer(e.target.value);
                            }
                          }}
                          placeholder="Type your own answer..."
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultsView answers={answers} />
        )}
      </main>
    </div>
  );
}

function ResultsView({ answers }: { answers: Record<string, any> }) {
  const [products, setProducts] = useState<ScoredProduct[]>([]);
  const [tradeoffs, setTradeoffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const scored = scoreProducts(answers);
    const maxBudget = parseBudget(answers.budget);
    
    // Split into strictly budget-compliant (primary) and overall top 10 pool
    let primary = scored.filter(p => p.price <= maxBudget);
    
    // Fallback: If zero products match the budget perfectly but we have results,
    // just use the top matching results to show something.
    if (primary.length === 0 && scored.length > 0) {
      primary = scored;
    }
    
    // The top 3-5 to show as standard recommendations
    const primaryTop5 = primary.slice(0, 5);
    setProducts(primaryTop5);

    if (primaryTop5.length > 0) {
      const suggestions = getTradeoffs(answers, primaryTop5, scored.slice(0, 15));
      setTradeoffs(suggestions);
    }
    setLoading(false);
  }, [answers]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : (prev.length < 3 ? [...prev, id] : prev));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Analyzing the best options for you... 🔍</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">No perfect match found</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Your criteria might be a bit too strict. Try adjusting your budget or removing brand exclusions.
        </p>
      </div>
    );
  }

  if (showComparison) {
    const compareProducts = products.filter(p => compareIds.includes(String(p.id)));
    return <ComparisonView products={compareProducts} onClose={() => setShowComparison(false)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative pb-20">
      <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-center gap-3 shadow-sm">
        <div className="bg-green-100 p-2 rounded-full">
          <Star className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="font-bold">Interview Complete!</h2>
          <p className="text-sm">Here are your top {products.length} recommendations based on your profile.</p>
        </div>
      </div>

      <div className="space-y-6">
        {products.map((product, idx) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            profile={answers} 
            rank={idx + 1} 
            isSelectedForCompare={compareIds.includes(String(product.id))}
            onToggleCompare={() => toggleCompare(String(product.id))}
            showCompareOptions={true}
          />
        ))}
      </div>

      {tradeoffs.length > 0 && (
        <div className="bg-transparent mt-8 border-t border-gray-200 pt-8">
          <div className="space-y-4">
            {tradeoffs.map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md relative overflow-hidden">
                {t.type === 'slight_budget_stretch' && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                      <Info className="w-3.5 h-3.5" /> VALUE STRETCH (OPTIONAL)
                    </h3>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      For just ₹{(t.suggested_budget! - t.current_budget!).toLocaleString('en-IN')} more, consider the {t.product_name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      If you can manage ₹{t.suggested_budget?.toLocaleString('en-IN')}, this product gives you a <strong>{t.benefit}</strong> compared to your top match. It's a highly recommended upgrade if this truly matters to you.
                    </p>
                  </>
                )}
                {t.type === 'budget_stretch' && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                      <Info className="w-3.5 h-3.5" /> VALUE STRETCH (OPTIONAL)
                    </h3>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      Stretch by ₹{(t.suggested_budget! - t.current_budget!).toLocaleString('en-IN')} for the {t.product_name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      If you can go up to ₹{t.suggested_budget?.toLocaleString('en-IN')}, the <strong>{t.product_name}</strong> gives you {t.benefit}. It's a meaningful upgrade over the standard top matches.
                    </p>
                  </>
                )}
                {t.type === 'requirement_relax' && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <h3 className="text-xs font-bold text-amber-600 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                      <Info className="w-3.5 h-3.5" /> SMART REQUIREMENT RELAX
                    </h3>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      Willing to compromise on {t.feature_to_relax?.replace('_', ' ')}?
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      If you can live without it, the <strong>{t.product_name}</strong> absolutely nails your core priorities and stays beautifully within your budget.
                    </p>
                  </>
                )}
                {t.type === 'save_money' && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h3 className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                      <Info className="w-3.5 h-3.5" /> SMART SAVING (OPTIONAL)
                    </h3>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      You could spend ₹{(t.current_budget! - t.suggested_budget!).toLocaleString('en-IN')} less
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Consider the <strong>{t.product_name}</strong> at just ₹{t.suggested_budget?.toLocaleString('en-IN')}. It {t.benefit}. This is a highly efficient choice for your budget.
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {compareIds.length > 0 && !showComparison && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-center animate-in slide-in-from-bottom-5">
          <div className="w-full max-w-3xl flex items-center justify-between px-2">
            <div className="font-medium text-gray-700">
              <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full mr-3">{compareIds.length}/3</span> 
              Products selected to compare
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCompareIds([])} className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Clear</button>
              <button 
                disabled={compareIds.length < 2}
                onClick={() => setShowComparison(true)}
                className="bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Compare Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ 
  product, profile, rank,
  isSelectedForCompare, onToggleCompare, showCompareOptions = false
}: { 
  key?: string | number, product: ScoredProduct, profile: Record<string, any>, rank: number,
  isSelectedForCompare?: boolean, onToggleCompare?: () => void, showCompareOptions?: boolean
}) {
  const [details, setDetails] = useState<{ confidence: string, pros: string[], cons: string[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSeeDetails = async () => {
    if (details) return;
    setLoadingDetails(true);
    const result = await generateExplanation(product, profile);
    setDetails(result);
    setLoadingDetails(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">#{rank}</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">{product.category}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
              {product.product_name}
              {product.verification_status === 'TRIPLE_VERIFIED' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✅ VERIFIED
                </span>
              )}
            </h3>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-xl md:text-2xl font-bold text-blue-600">₹{product.price.toLocaleString('en-IN')}</div>
            <div className="flex items-center justify-end gap-1 text-sm font-medium text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              {product.match_score.toFixed(1)}/5.0
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-inner">
          <Cpu className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
          <p>{product.specs_text}</p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          {!details && !loadingDetails && (
            <button 
              onClick={handleSeeDetails}
              className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              See AI Insights
            </button>
          )}

          {loadingDetails && (
            <div className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2 border border-gray-200">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
              Generating insights...
            </div>
          )}

          {showCompareOptions && (
            <button 
              onClick={onToggleCompare}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all duration-200 ${
                isSelectedForCompare ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isSelectedForCompare ? <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              <span className="hidden sm:inline">{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
            </button>
          )}
        </div>

        {details && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-500">
            <div className="p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 font-medium shadow-sm">
              "{details.confidence}"
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-green-800 mb-3">
                  <ThumbsUp className="w-4 h-4" /> Pros for you
                </h4>
                <ul className="space-y-2">
                  {details.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
                <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-3">
                  <ThumbsDown className="w-4 h-4" /> Trade-offs
                </h4>
                <ul className="space-y-2">
                  {details.cons.map((con, i) => (
                    <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonView({ products, onClose }: { products: ScoredProduct[], onClose: () => void }) {
  if (products.length === 0) return null;
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-[73px] z-20">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-600" /> Compare Products
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 font-medium text-gray-600 text-sm">
          <X className="w-5 h-5 text-gray-500" /> Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto relative">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-200 bg-gray-50/80 w-1/4 sticky left-0 z-10 backdrop-blur-sm">Feature</th>
              {products.map(p => (
                <th key={p.id} className="p-6 border-b border-gray-200 bg-white text-center align-top min-w-[220px]">
                  <div className="flex justify-center mb-2">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded w-max">
                      {p.category}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[56px] leading-snug">{p.product_name}</div>
                  <div className="text-blue-600 font-bold text-xl mb-3">₹{p.price.toLocaleString('en-IN')}</div>
                  <div className="inline-flex items-center gap-1 text-sm bg-amber-50 text-amber-600 font-medium px-3 py-1.5 rounded-full border border-amber-100">
                    <Star className="w-4 h-4 fill-current text-amber-500" /> Match: {p.match_score.toFixed(1)}/5.0
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Key Specs</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-sm text-gray-700 leading-relaxed font-medium bg-white">
                  {p.specs_text}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Best For</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-sm font-medium bg-white">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {p.use_case_tags.split(',').map(tag => (
                      <span key={tag} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md text-xs font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Performance Score</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-center bg-white text-lg font-bold text-gray-800">{p.performance_score}<span className="text-sm font-normal text-gray-400">/5</span></td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Battery Score</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-center bg-white text-lg font-bold text-gray-800">{p.battery_score}<span className="text-sm font-normal text-gray-400">/5</span></td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Display Score</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-center bg-white text-lg font-bold text-gray-800">{p.display_score}<span className="text-sm font-normal text-gray-400">/5</span></td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 border-r border-gray-100 bg-gray-50/80 font-medium text-gray-700 sticky left-0 z-10 backdrop-blur-sm">Portability Score</td>
              {products.map(p => (
                <td key={p.id} className="p-5 text-center bg-white text-lg font-bold text-gray-800">{p.portability_score}<span className="text-sm font-normal text-gray-400">/5</span></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
