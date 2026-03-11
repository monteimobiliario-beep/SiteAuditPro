import React, { useState, useEffect, useMemo } from 'react';
import { Search, Globe, Zap, BarChart3, AlertCircle, Loader2, ArrowRight, Layout, SearchCode, FileText, Target, Mail, User, MessageSquare, Menu, X, Languages, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { analyzeWebsite } from './services/geminiService';
import { translations } from './constants';

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';
type View = 'home' | 'pricing' | 'about' | 'contact' | 'auth';
type Language = 'en' | 'pt';
type BillingCycle = 'monthly' | 'annual';

interface UserData {
  id: number;
  email: string;
  name: string;
  avatar?: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [view, setView] = useState<View>('home');
  const [lang, setLang] = useState<Language>('pt');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [user, setUser] = useState<UserData | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');

  const t = translations[lang];

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setUser(data.user))
      .catch(() => {});

    // Listen for OAuth messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setUser(event.data.user);
        setView('home');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const res = await fetch(`/api/auth/${provider}/url`);
      const { url } = await res.json();
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (err) {
      console.error("OAuth failed", err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setView('home');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email');
    const password = formData.get('password');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setView('home');
    }
  };

  const loadingSteps = useMemo(() => [
    lang === 'en' ? "Connecting to server..." : "Ligando ao servidor...",
    lang === 'en' ? "Fetching website structure..." : "Obtendo estrutura do site...",
    lang === 'en' ? "Analyzing SEO metadata..." : "Analisando metadados SEO...",
    lang === 'en' ? "Evaluating UX and Design patterns..." : "Avaliando padrões de UX e Design...",
    lang === 'en' ? "Checking performance metrics..." : "Verificando métricas de desempenho...",
    lang === 'en' ? "Assessing content depth..." : "Avaliando profundidade do conteúdo...",
    lang === 'en' ? "Generating prioritized action plan..." : "Gerando plano de ação priorizado...",
    lang === 'en' ? "Finalizing report..." : "Finalizando relatório..."
  ], [lang]);

  useEffect(() => {
    let interval: number;
    if (status === 'loading') {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, loadingSteps]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setStatus('loading');
    setError(null);
    setResult(null);
    setLoadingStep(0);
    setView('home');

    try {
      const analysis = await analyzeWebsite(formattedUrl);
      setResult(analysis || "No analysis generated.");
      setStatus('success');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  const chartData = [
    { subject: t.uxDesign, A: 85, fullMark: 100 },
    { subject: t.seoScore, A: 92, fullMark: 100 },
    { subject: t.performance, A: 78, fullMark: 100 },
    { subject: t.conversion, A: 65, fullMark: 100 },
    { subject: t.about, A: 90, fullMark: 100 },
  ];

  const renderHome = () => (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[120px]"></div>
        </div>

        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-6 border border-indigo-100"
          >
            <Zap size={14} />
            {(t as any).heroTag}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]"
          >
            {t.tagline.split('&').length > 1 ? (
              <>
                {t.tagline.split('&')[0]} <span className="text-indigo-600">&</span> {t.tagline.split('&')[1]}
              </>
            ) : t.tagline.split('e').length > 1 ? (
              <>
                {t.tagline.split('e')[0]} <span className="text-indigo-600">e</span> {t.tagline.split('e')[1]}
              </>
            ) : (
              t.tagline
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.description}
          </motion.p>

          {/* Input Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative"
          >
            <form onSubmit={handleAnalyze} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Globe className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.placeholder}
                className="block w-full pl-16 pr-44 py-6 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl shadow-indigo-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-xl font-medium"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !url}
                className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                {status === 'loading' ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    {(t as any).heroCTA} <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                Instant AI Report
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Data / Features Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { icon: <BarChart3 className="text-indigo-600" />, title: "Traffic Insights", desc: "Understand where your visitors come from and what they do." },
          { icon: <SearchCode className="text-blue-600" />, title: "Keyword Tracking", desc: "Find the best keywords to rank higher on Google." },
          { icon: <Zap className="text-amber-600" />, title: "Speed Audit", desc: "Identify bottlenecks that are slowing down your site." }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Status Display */}
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-xl"
          >
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="text-indigo-600" size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">{loadingSteps[loadingStep]}</h3>
            <p className="text-slate-500 font-medium">{t.loading}</p>
            
            {/* Fake Progress Bar */}
            <div className="mt-10 w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto p-8 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-6"
          >
            <div className="p-3 bg-red-100 rounded-2xl text-red-600">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">{t.analysisFailed}</h3>
              <p className="text-red-700 leading-relaxed">{error}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                {t.tryAgain}
              </button>
            </div>
          </motion.div>
        )}

        {status === 'success' && result && (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {/* Bento Grid Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Health Score Large Card */}
              <div className="md:col-span-2 md:row-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Overall Health Score</h3>
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <motion.circle 
                      className="text-indigo-600" 
                      strokeWidth="8" 
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * 82) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" cx="50" cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900">82</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Great</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm max-w-xs">Your site is performing better than 82% of websites in your niche.</p>
              </div>

              {/* Metric Cards */}
              {[
                { label: t.uxDesign, value: t.professional, icon: <Layout />, color: "bg-blue-50 text-blue-600", score: 85 },
                { label: t.seoScore, value: t.optimized, icon: <SearchCode />, color: "bg-green-50 text-green-600", score: 92 },
                { label: t.performance, value: t.fast, icon: <Zap />, color: "bg-amber-50 text-amber-600", score: 78 },
                { label: t.conversion, value: t.highPotential, icon: <Target />, color: "bg-purple-50 text-purple-600", score: 65 }
              ].map((metric, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${metric.color}`}>{metric.icon}</div>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{metric.score}%</span>
                  </div>
                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{metric.label}</h4>
                  <div className="text-xl font-black text-slate-900">{metric.value}</div>
                  
                  {/* Mini Progress Bar */}
                  <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${metric.color.split(' ')[1].replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-slate-900">{t.scoresTitle}</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <div className="w-3 h-3 rounded-full bg-indigo-200"></div>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                      <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="#4f46e5"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-slate-900">Traffic Potential</h3>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">+24% Growth</span>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="A" fill="#4f46e5" radius={[10, 10, 10, 10]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Report */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{t.resultsTitle}</h2>
                    <p className="text-sm text-slate-400 font-medium">{t.generatedOn} {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Download PDF
                </button>
              </div>
              <div className="p-10 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-img:rounded-[32px] prose-img:shadow-2xl">
                <Markdown>{result}</Markdown>
              </div>
            </div>

            {/* Action Plan CTA */}
            <div className="relative bg-indigo-600 rounded-[40px] p-12 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="text-center lg:text-left max-w-2xl">
                  <h3 className="text-4xl font-black mb-4 leading-tight">{t.readyToImplement}</h3>
                  <p className="text-xl text-indigo-100 font-medium">{t.expertsHelp}</p>
                </div>
                <button className="px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 hover:scale-105 active:scale-95">
                  {t.getStarted}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderPricing = () => (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">{t.plansTitle}</h2>
        <p className="text-slate-600 text-lg">{(t as any).featuresTitle}</p>
        
        {/* Billing Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>{(t as any).billingMonthly}</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors hover:bg-slate-300"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
              className="w-6 h-6 bg-white rounded-full shadow-sm"
            />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'annual' ? 'text-indigo-600' : 'text-slate-400'}`}>
            {(t as any).billingAnnual}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          { name: t.free, price: 0, features: ["3 Audits/mo", "Basic SEO", "Mobile Check"], color: "slate" },
          { name: t.pro, price: 29, features: ["Unlimited Audits", "Full UX Report", "Priority Support", "PDF Export"], color: "indigo", popular: true },
          { name: t.enterprise, price: 99, features: ["Custom Solutions", "API Access", "Team Accounts", "Dedicated Manager"], color: "slate" }
        ].map((plan) => {
          const basePrice = plan.price;
          const finalPrice = billingCycle === 'annual' ? basePrice * 0.9 : basePrice;
          
          return (
            <div key={plan.name} className={`bg-white p-10 rounded-[40px] border-2 ${plan.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100'} relative flex flex-col`}>
              {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</span>}
              <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-slate-900">${finalPrice.toFixed(0)}</span>
                <span className="text-slate-400 font-bold">{billingCycle === 'monthly' ? t.monthly : '/yr'}</span>
              </div>
              
              {billingCycle === 'annual' && plan.price > 0 && (
                <div className="mb-6 px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full inline-block self-start">
                  {(t as any).annualDiscount}
                </div>
              )}

              <ul className="space-y-5 mb-10 flex-grow">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                      <CheckCircle2 size={12} />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => !user && setView('auth')}
                className={`w-full py-5 rounded-3xl font-black text-lg transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                {user ? t.selectPlan : (t as any).signUp}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">{t.aboutTitle}</h2>
      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-600 mb-6">{t.aboutText}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Our Mission</h4>
            <p className="text-slate-600">To democratize professional-grade website analysis for everyone.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Our Vision</h4>
            <p className="text-slate-600">A web where every site is optimized for its users and search engines.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="max-w-xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.contactTitle}</h2>
        <p className="text-slate-600">{t.contactSubtitle}</p>
      </div>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.nameLabel}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input type="text" className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.emailLabel}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input type="email" className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.messageLabel}</label>
          <div className="relative">
            <div className="absolute top-3 left-4 pointer-events-none text-slate-400">
              <MessageSquare size={18} />
            </div>
            <textarea rows={4} className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
        </div>
        <button type="button" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {t.sendBtn}
        </button>
      </form>
    </div>
  );

  const renderAuth = () => (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {authMode === 'signIn' ? (t as any).welcomeBack : (t as any).createAccount}
          </h2>
          <p className="text-slate-500 font-medium">
            {authMode === 'signIn' ? (t as any).dontHaveAccount : (t as any).alreadyHaveAccount}{' '}
            <button 
              onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
              className="text-indigo-600 font-bold hover:underline"
            >
              {authMode === 'signIn' ? (t as any).signUp : (t as any).signIn}
            </button>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => handleOAuth('google')}
            className="w-full py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {(t as any).googleSignIn}
          </button>
          <button 
            onClick={() => handleOAuth('github')}
            className="w-full py-4 px-6 bg-slate-900 border-2 border-slate-900 rounded-2xl font-bold text-white flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors"
          >
            <Github size={20} />
            {(t as any).githubSignIn}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{(t as any).emailLabel}</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder={(t as any).emailPlaceholder}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{(t as any).passwordPlaceholder}</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder={(t as any).passwordPlaceholder}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium" 
            />
          </div>
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
            {authMode === 'signIn' ? (t as any).signIn : (t as any).signUp}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BarChart3 size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">{t.appName.split('Pro')[0]}<span className="text-indigo-600">Pro</span></span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
            <button onClick={() => setView('home')} className={`hover:text-indigo-600 transition-colors ${view === 'home' ? 'text-indigo-600' : ''}`}>{t.home}</button>
            <button onClick={() => setView('pricing')} className={`hover:text-indigo-600 transition-colors ${view === 'pricing' ? 'text-indigo-600' : ''}`}>{t.pricing}</button>
            <button onClick={() => setView('about')} className={`hover:text-indigo-600 transition-colors ${view === 'about' ? 'text-indigo-600' : ''}`}>{t.about}</button>
            <button onClick={() => setView('contact')} className={`hover:text-indigo-600 transition-colors ${view === 'contact' ? 'text-indigo-600' : ''}`}>{t.contact}</button>
            
            <div className="h-4 w-px bg-slate-200"></div>
            
            <button 
              onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
            >
              <Languages size={18} />
              <span className="uppercase">{lang}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900">{user.name}</div>
                  <button onClick={handleLogout} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest">{(t as any).signOut}</button>
                </div>
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-2xl border-2 border-white shadow-md" alt={user.name} />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => { setAuthMode('signIn'); setView('auth'); }} className="hover:text-indigo-600 transition-colors">{(t as any).signIn}</button>
                <button onClick={() => { setAuthMode('signUp'); setView('auth'); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  {(t as any).signUp}
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600">{t.home}</button>
                <button onClick={() => { setView('pricing'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600">{t.pricing}</button>
                <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600">{t.about}</button>
                <button onClick={() => { setView('contact'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-slate-600">{t.contact}</button>
                <button 
                  onClick={() => { setLang(lang === 'en' ? 'pt' : 'en'); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 font-medium text-indigo-600"
                >
                  <Languages size={18} />
                  <span className="uppercase">{lang === 'en' ? 'Português' : 'English'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && renderHome()}
            {view === 'pricing' && renderPricing()}
            {view === 'about' && renderAbout()}
            {view === 'contact' && renderContact()}
            {view === 'auth' && renderAuth()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
                <BarChart3 size={14} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">{t.appName}</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">{t.privacyPolicy}</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">{t.termsOfService}</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">{t.contactUs}</a>
            </div>
            <div className="text-sm text-slate-400">
              © 2026 {t.appName}. {t.allRightsReserved}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckCircle2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
