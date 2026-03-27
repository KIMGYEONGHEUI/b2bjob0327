/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MessageSquare, 
  HelpCircle, 
  Globe, 
  User, 
  Briefcase, 
  Star, 
  Clock, 
  DollarSign,
  Send,
  X,
  Mic,
  Camera,
  Phone,
  Video,
  ChevronRight,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { cn } from "./lib/utils";
import { translations, faqData } from "./data/content";
import { Expert, Project, MatchResult, Message } from "./types";

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("glass-panel rounded-2xl p-4 transition-all duration-300", className)}>
    {children}
  </div>
);

const LanguageSwitcher = ({ lang, setLang }: { lang: string; setLang: (l: string) => void }) => {
  const [open, setOpen] = useState(false);
  const languages = Object.keys(translations);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
      >
        <Globe size={16} />
        <span className="uppercase text-sm font-medium">{lang}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
          >
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors uppercase",
                  lang === l && "text-blue-400 font-bold"
                )}
              >
                {l}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatWidget = ({ lang }: { lang: string }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit("join_room", "general");

    socketRef.current.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      const msgData: Message = {
        room: "general",
        author: "User",
        message: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socketRef.current.emit("send_message", msgData);
      setInput("");
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.6)] z-40 text-white backdrop-blur-md border border-white/20"
      >
        <MessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-6 w-[calc(100%-3rem)] md:w-[400px] h-[500px] bg-[#0A192F] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 bg-primary/10 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <span className="font-bold text-[10px] uppercase tracking-widest">{translations[lang].chat}</span>
              </div>
              <button onClick={() => setOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.author === "User" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-2.5 rounded-xl text-[11px] leading-snug",
                    msg.author === "User" 
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                      : "bg-white/5 border border-white/10 text-white/80 rounded-tl-none"
                  )}>
                    {msg.message}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5 space-y-3">
              <div className="flex gap-4 justify-center opacity-40">
                <button className="hover:text-primary transition-colors"><Mic size={14} /></button>
                <button className="hover:text-primary transition-colors"><Camera size={14} /></button>
                <button className="hover:text-primary transition-colors"><Phone size={14} /></button>
                <button className="hover:text-primary transition-colors"><Video size={14} /></button>
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={translations[lang].placeholder}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-primary transition-all"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-primary p-2 rounded-lg hover:bg-accent transition-all shadow-lg shadow-primary/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FAQWidget = ({ lang }: { lang: string }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,140,0,0.6)] z-40 text-white backdrop-blur-md border border-white/20"
      >
        <HelpCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 w-[calc(100%-3rem)] md:w-[350px] max-h-[60vh] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 bg-orange-500/10 flex justify-between items-center backdrop-blur-md">
              <span className="font-bold flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <Sparkles size={14} className="text-orange-400" />
                {translations[lang].faq}
              </span>
              <button onClick={() => setOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {faqData.map((item, i) => (
                <div key={i} className="border-b border-white/5 last:border-0">
                  <button
                    onClick={() => setActive(active === i ? null : i)}
                    className="w-full text-left p-2.5 hover:bg-white/5 transition-all rounded-lg flex justify-between items-center group"
                  >
                    <span className="text-[11px] font-medium pr-4 leading-snug opacity-70 group-hover:opacity-100">{(item.q as any)[lang] || (item.q as any)['en']}</span>
                    <ChevronRight size={10} className={cn("transition-transform opacity-30", active === i && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {active === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 text-[10px] leading-relaxed opacity-50 bg-white/5 rounded-lg m-1 border border-white/5">
                          {(item.a as any)[lang] || (item.a as any)['en']}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState("ko");
  const [project, setProject] = useState<Project>({
    title: "",
    budget: 100,
    skills_required: [],
    duration_days: 30
  });
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const runMatch = async () => {
    if (project.skills_required.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project)
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !project.skills_required.includes(skillInput)) {
      setProject({ ...project, skills_required: [...project.skills_required, skillInput] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setProject({ ...project, skills_required: project.skills_required.filter(s => s !== skill) });
  };

  return (
    <div className="min-h-screen bg-bg-deep text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-30 bg-bg-deep/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">E</div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">ExpertMatch</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium opacity-70">
              <a href="#" className="hover:opacity-100 transition-opacity">{translations[lang].findExpert}</a>
              <a href="#" className="hover:opacity-100 transition-opacity">{translations[lang].registerProject}</a>
            </nav>
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-3"
          >
            <Sparkles size={12} />
            {translations[lang].heroSubtitle || "AI-Powered B2B Matching Platform"}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-tight"
          >
            {translations[lang].heroTitle || "Find the Right Expert. Instantly."}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs md:text-sm opacity-50 max-w-2xl mx-auto leading-relaxed"
          >
            {translations[lang].title} — {translations[lang].subtitle}
          </motion.p>
        </div>

        {/* Value Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <GlassCard className="p-4 h-full hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.2)] group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                  {i === 1 && <Sparkles size={20} />}
                  {i === 2 && <User size={20} />}
                  {i === 3 && <Briefcase size={20} />}
                </div>
                <h3 className="text-sm font-medium mb-1">{translations[lang][`value${i}Title`] || `Value ${i}`}</h3>
                <p className="text-[11px] opacity-50 leading-snug">{translations[lang][`value${i}Desc`] || `Description for value ${i}`}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left: Project Registration */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-4">
                <h2 className="text-base font-medium mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Briefcase size={16} />
                  </div>
                  {translations[lang].registerProject}
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1.5">{translations[lang].projectTitle}</label>
                    <input 
                      type="text"
                      value={project.title}
                      onChange={(e) => setProject({...project, title: e.target.value})}
                      placeholder={translations[lang].projectTitlePlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-all text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1.5">{translations[lang].budget} ($)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input 
                          type="number"
                          value={project.budget}
                          onChange={(e) => setProject({...project, budget: parseInt(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-primary transition-all text-[11px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1.5">{translations[lang].duration} (Days)</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input 
                          type="number"
                          value={project.duration_days}
                          onChange={(e) => setProject({...project, duration_days: parseInt(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-primary transition-all text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1.5">{translations[lang].skillsRequired}</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        placeholder={translations[lang].skillPlaceholder}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:border-primary transition-all"
                      />
                      <button 
                        onClick={addSkill}
                        className="bg-white/10 px-3 rounded-lg hover:bg-white/20 transition-colors border border-white/10 text-xs"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence>
                        {project.skills_required.map(skill => (
                          <motion.span 
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-semibold"
                          >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors"><X size={10} /></button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button 
                    onClick={runMatch}
                    disabled={loading || project.skills_required.length === 0}
                    className="btn-primary w-full text-white font-bold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        {translations[lang].runMatch}
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right: Match Results */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-end mb-1 px-1">
                <div>
                  <h2 className="text-lg font-medium">{translations[lang].topExperts}</h2>
                  <p className="text-[10px] opacity-40">{translations[lang].topExpertsDesc}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {results.length} {translations[lang].expertsFound}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {results.length > 0 ? (
                  results.map((res, i) => (
                    <motion.div
                      key={res.expert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                    >
                      <GlassCard className="p-3 hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.2)] cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex flex-col md:flex-row gap-3 relative z-10">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold shrink-0 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                              {res.expert.name.charAt(0)}
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-1 text-yellow-400">
                              <Star size={12} fill="currentColor" />
                              <span className="text-[10px] font-bold">{res.expert.rating}</span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="text-base font-medium group-hover:text-accent transition-colors leading-tight">{res.expert.name}</h3>
                                  <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[7px] font-bold uppercase tracking-widest">{translations[lang].verified}</span>
                                </div>
                                <p className="text-[11px] opacity-50 line-clamp-1 leading-tight">{res.expert.bio}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary tabular-nums leading-none">{(res.score * 100).toFixed(0)}%</div>
                                <div className="text-[8px] uppercase tracking-widest font-bold opacity-30 mt-0.5">{translations[lang].score}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-0.5">{translations[lang].experience}</div>
                                <div className="text-[11px] font-medium">{res.expert.experience} {translations[lang].years}</div>
                              </div>
                              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                                <div className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-0.5">{translations[lang].rate}</div>
                                <div className="text-[11px] font-medium text-accent">${res.expert.rate}/{translations[lang].perHour}</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {res.expert.skills.map(skill => (
                                <span key={skill} className={cn(
                                  "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all",
                                  project.skills_required.includes(skill) 
                                    ? "bg-primary/20 text-primary border border-primary/30" 
                                    : "bg-white/5 text-white/30 border border-white/5"
                                )}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="opacity-20" />
                    </div>
                    <p className="text-base font-medium opacity-40 mb-1">{translations[lang].readyToMatch}</p>
                    <p className="text-xs opacity-20 mb-6">{translations[lang].readyToMatchDesc}</p>
                    <button 
                      onClick={() => document.querySelector('input')?.focus()}
                      className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                      {translations[lang].getStarted}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Widgets */}
      <ChatWidget lang={lang} />
      <FAQWidget lang={lang} />

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center opacity-20 text-[10px] font-bold uppercase tracking-[0.2em]">
        <p>{translations[lang].footer}</p>
      </footer>
    </div>
  );
}
