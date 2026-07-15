import React, { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { SiteContent } from '../lib/useCms';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Trash2, LayoutDashboard, Type, Image as ImageIcon, Users, Briefcase, FileText, CheckCircle, Target, Award, PanelTop, PanelBottom, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'header', label: 'Header', icon: PanelTop },
  { id: 'hero', label: 'Hero', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: FileText },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
  { id: 'milestone', label: 'Milestones', icon: Award },
  { id: 'whyUs', label: 'Why Us', icon: Target },
  { id: 'keyPeople', label: 'Key People', icon: Users },
  { id: 'workflow', label: 'Workflow', icon: CheckCircle },
  { id: 'about', label: 'About', icon: Type },
  { id: 'footer', label: 'Footer', icon: PanelBottom },
];

export function AdminDashboard() {
  const { user, loginWithId, logout, error, content, updateContent } = useAdmin();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [localContent, setLocalContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && content) {
      setLocalContent(content);
    }
  }, [user, content]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithId(adminId, password);
  };

  const handleSave = async () => {
    if (localContent) {
      setIsSaving(true);
      await updateContent(localContent);
      setTimeout(() => setIsSaving(false), 800); // Fake delay for UI feedback
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen flex items-center justify-center">
           <div className="w-[800px] h-[800px] rounded-full border-[1px] border-[#7d39eb]/30 blur-3xl animate-spin-slow" style={{ animationDuration: '40s' }} />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative z-10"
        >
          <div className="mb-8 text-center">
             <div className="w-16 h-16 bg-[#7d39eb]/20 rounded-2xl mx-auto flex items-center justify-center border border-[#7d39eb]/50 mb-4 shadow-[0_0_20px_rgba(125,57,235,0.3)]">
               <LayoutDashboard className="text-[#7d39eb]" size={32} />
             </div>
             <h2 className="text-3xl font-display font-bold tracking-tight">Access Portal</h2>
             <p className="text-zinc-400 mt-2 text-sm">Enter your credentials to manage content.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-2">Admin ID</label>
              <input 
                type="text" 
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#7d39eb] focus:ring-1 focus:ring-[#7d39eb] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#7d39eb] focus:ring-1 focus:ring-[#7d39eb] transition-all"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-[#7d39eb] hover:bg-[#6c2bd9] text-white px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(125,57,235,0.4)] transition-all hover:scale-[1.02] mt-2 active:scale-95"
            >
              Authenticate
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-xs text-zinc-500 hover:text-white transition-colors">
              &larr; Return to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!localContent) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[#7d39eb]"><div className="w-8 h-8 border-4 border-[#7d39eb]/30 border-t-[#7d39eb] rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white pb-20">
      
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-[#7d39eb] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(125,57,235,0.5)]">
               <LayoutDashboard className="text-white" size={20} />
             </div>
             <div>
               <h1 className="text-lg font-display font-bold tracking-tight">VirAshelle CMS</h1>
               <div className="flex items-center gap-2 text-xs text-zinc-400">
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                 Live Connection
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={() => navigate('/')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block">
              View Website
            </button>
            <div className="w-px h-5 bg-white/20 hidden md:block"></div>
            <button onClick={logout} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Logout
            </button>
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all hover:bg-zinc-200 active:scale-95 ${isSaving ? 'opacity-80' : ''}`}
            >
              {isSaving ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8 lg:sticky lg:top-28">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-4 px-2">Global Settings</h3>
            <div className="space-y-1">
              {[TABS[0], TABS[TABS.length-1]].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#7d39eb]/10 text-[#7d39eb] border border-[#7d39eb]/30 shadow-[0_0_15px_rgba(125,57,235,0.15)]' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-4 px-2">Page Sections</h3>
            <div className="space-y-1">
              {TABS.slice(1, TABS.length-1).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#7d39eb]/10 text-[#7d39eb] border border-[#7d39eb]/30 shadow-[0_0_15px_rgba(125,57,235,0.15)]' 
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="border-b border-white/10 pb-6 mb-8 flex items-center gap-3">
                 {(() => {
                   const tab = TABS.find(t => t.id === activeTab);
                   if (tab) {
                     return (
                       <>
                         <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                           <tab.icon size={20} className="text-[#7d39eb]" />
                         </div>
                         <div>
                           <h2 className="text-2xl font-display font-bold">{tab.label} Editor</h2>
                           <p className="text-sm text-zinc-400">Make changes to the {tab.label.toLowerCase()} section.</p>
                         </div>
                       </>
                     );
                   }
                 })()}
              </div>
              
              {/* === SECTION CONTROLS === */}

              {activeTab === 'header' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Established Text</label>
                    <input 
                      type="text"
                      value={localContent.header?.established || ""}
                      onChange={(e) => setLocalContent({...localContent, header: {...localContent.header, established: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                    <p className="text-xs text-zinc-500 mt-2">Displayed on the far right of the top navigation bar.</p>
                  </div>
                </div>
              )}

              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title (HTML allowed)</label>
                    <textarea 
                      value={localContent.hero.title}
                      onChange={(e) => setLocalContent({...localContent, hero: {...localContent.hero, title: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb] font-mono"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Subtitle</label>
                    <textarea 
                      value={localContent.hero.subtitle}
                      onChange={(e) => setLocalContent({...localContent, hero: {...localContent.hero, subtitle: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Button Text</label>
                    <input 
                      type="text"
                      value={localContent.hero.buttonText}
                      onChange={(e) => setLocalContent({...localContent, hero: {...localContent.hero, buttonText: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                    <input 
                      type="text"
                      value={localContent.about.title}
                      onChange={(e) => setLocalContent({...localContent, about: {...localContent.about, title: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Content (HTML allowed)</label>
                    <textarea 
                      value={localContent.about.content}
                      onChange={(e) => setLocalContent({...localContent, about: {...localContent.about, content: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb] font-mono"
                      rows={10}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                      <input 
                        type="text"
                        value={localContent.services?.title || ""}
                        onChange={(e) => setLocalContent({...localContent, services: {...localContent.services, title: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Description</label>
                      <input 
                        type="text"
                        value={localContent.services?.description || ""}
                        onChange={(e) => setLocalContent({...localContent, services: {...localContent.services, description: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Service Items</label>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.services?.items?.map((item, index) => (
                        <div key={index} className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all">
                          <button 
                            onClick={() => {
                              const newItems = localContent.services.items.filter((_, i) => i !== index);
                              setLocalContent({...localContent, services: {...localContent.services, items: newItems}});
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Item {index + 1}</div>
                          
                          <input 
                            type="text"
                            placeholder="Service Title"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...(localContent.services?.items || [])];
                              newItems[index] = { ...newItems[index], title: e.target.value };
                              setLocalContent({...localContent, services: {...localContent.services, items: newItems}});
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                          />
                          <textarea 
                            placeholder="Detailed Description"
                            value={item.desc}
                            onChange={(e) => {
                              const newItems = [...(localContent.services?.items || [])];
                              newItems[index] = { ...newItems[index], desc: e.target.value };
                              setLocalContent({...localContent, services: {...localContent.services, items: newItems}});
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newItems = [...(localContent.services?.items || []), { title: "New Service", desc: "Service description" }];
                        setLocalContent({...localContent, services: {...localContent.services, items: newItems}});
                      }}
                      className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                    >
                      <Plus size={18} className="mr-2" /> Add New Service
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'whyUs' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                    <input 
                      type="text"
                      value={localContent.whyUs?.title || ""}
                      onChange={(e) => setLocalContent({...localContent, whyUs: {...localContent.whyUs, title: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Description</label>
                    <textarea 
                      value={localContent.whyUs?.description || ""}
                      onChange={(e) => setLocalContent({...localContent, whyUs: {...localContent.whyUs, description: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-8">
                  <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                    <input 
                      type="text"
                      value={localContent.workflow?.title || ""}
                      onChange={(e) => setLocalContent({...localContent, workflow: {...localContent.workflow, title: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Workflow Steps</label>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.workflow?.items?.map((item, index) => (
                        <div key={index} className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all">
                          <button 
                            onClick={() => {
                              const newItems = localContent.workflow.items.filter((_, i) => i !== index);
                              setLocalContent({...localContent, workflow: {...localContent.workflow, items: newItems}});
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                            title="Remove Step"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Step {index + 1}</div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Number Marker</label>
                              <input 
                                type="text"
                                placeholder="e.g. 01"
                                value={item.number}
                                onChange={(e) => {
                                  const newItems = [...(localContent.workflow?.items || [])];
                                  newItems[index] = { ...newItems[index], number: e.target.value };
                                  setLocalContent({...localContent, workflow: {...localContent.workflow, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Phase Title</label>
                              <input 
                                type="text"
                                placeholder="Phase Title"
                                value={item.title}
                                onChange={(e) => {
                                  const newItems = [...(localContent.workflow?.items || [])];
                                  newItems[index] = { ...newItems[index], title: e.target.value };
                                  setLocalContent({...localContent, workflow: {...localContent.workflow, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Description</label>
                            <textarea 
                              placeholder="Phase Description"
                              value={item.desc}
                              onChange={(e) => {
                                const newItems = [...(localContent.workflow?.items || [])];
                                newItems[index] = { ...newItems[index], desc: e.target.value };
                                setLocalContent({...localContent, workflow: {...localContent.workflow, items: newItems}});
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newNumber = ("0" + ((localContent.workflow?.items?.length || 0) + 1)).slice(-2);
                        const newItems = [...(localContent.workflow?.items || []), { number: newNumber, title: "New Step", desc: "Description" }];
                        setLocalContent({...localContent, workflow: {...localContent.workflow, items: newItems}});
                      }}
                      className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                    >
                      <Plus size={18} className="mr-2" /> Add Workflow Step
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                      <input 
                        type="text"
                        value={localContent.portfolio?.title || ""}
                        onChange={(e) => setLocalContent({...localContent, portfolio: {...localContent.portfolio, title: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Description</label>
                      <input 
                        type="text"
                        value={localContent.portfolio?.description || ""}
                        onChange={(e) => setLocalContent({...localContent, portfolio: {...localContent.portfolio, description: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Portfolio Gallery</label>
                    <div className="grid grid-cols-1 gap-6">
                      {localContent.portfolio?.items?.map((item, index) => (
                        <div key={index} className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all flex flex-col md:flex-row gap-6">
                          <button 
                            onClick={() => {
                              const newItems = localContent.portfolio.items.filter((_, i) => i !== index);
                              setLocalContent({...localContent, portfolio: {...localContent.portfolio, items: newItems}});
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="w-full md:w-1/3 shrink-0">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Media File (Image)</label>
                            <ImageUpload 
                              path="portfolio" 
                              currentUrl={item.src} 
                              onUploadSuccess={(url) => {
                                const newItems = [...(localContent.portfolio?.items || [])];
                                newItems[index] = { ...newItems[index], src: url };
                                setLocalContent({...localContent, portfolio: {...localContent.portfolio, items: newItems}});
                              }} 
                            />
                          </div>
                          
                          <div className="flex-1 space-y-4 pt-2">
                            <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Item {index + 1}</div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                              <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const newItems = [...(localContent.portfolio?.items || [])];
                                  newItems[index] = { ...newItems[index], title: e.target.value };
                                  setLocalContent({...localContent, portfolio: {...localContent.portfolio, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Category</label>
                              <input 
                                type="text"
                                value={item.category}
                                onChange={(e) => {
                                  const newItems = [...(localContent.portfolio?.items || [])];
                                  newItems[index] = { ...newItems[index], category: e.target.value };
                                  setLocalContent({...localContent, portfolio: {...localContent.portfolio, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => {
                        const newItems = [...(localContent.portfolio?.items || []), { id: Date.now().toString(), title: "New Item", category: "Uncategorized", type: "image" as 'image', src: "" }];
                        setLocalContent({...localContent, portfolio: {...localContent.portfolio, items: newItems}});
                      }}
                      className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                    >
                      <Plus size={18} className="mr-2" /> Add Portfolio Item
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'milestone' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                      <input 
                        type="text"
                        value={localContent.milestone?.title || ""}
                        onChange={(e) => setLocalContent({...localContent, milestone: {...localContent.milestone, title: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Subtitle</label>
                      <input 
                        type="text"
                        value={localContent.milestone?.subtitle || ""}
                        onChange={(e) => setLocalContent({...localContent, milestone: {...localContent.milestone, subtitle: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Milestone Items</label>
                    <div className="grid grid-cols-1 gap-4">
                      {localContent.milestone?.items?.map((item, index) => (
                        <div key={index} className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all">
                          <button 
                            onClick={() => {
                              const newItems = localContent.milestone.items.filter((_, i) => i !== index);
                              setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                            }}
                            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Milestone {index + 1}</div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Status Title</label>
                              <input 
                                type="text"
                                placeholder="Status"
                                value={item.status}
                                onChange={(e) => {
                                  const newItems = [...(localContent.milestone?.items || [])];
                                  newItems[index] = { ...newItems[index], status: e.target.value };
                                  setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Count Value</label>
                              <input 
                                type="text"
                                placeholder="e.g. 45+"
                                value={item.count}
                                onChange={(e) => {
                                  const newItems = [...(localContent.milestone?.items || [])];
                                  newItems[index] = { ...newItems[index], count: e.target.value };
                                  setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Theme Color</label>
                              <input 
                                type="text"
                                placeholder="e.g. border-[#7d39eb]"
                                value={item.color}
                                onChange={(e) => {
                                  const newItems = [...(localContent.milestone?.items || [])];
                                  newItems[index] = { ...newItems[index], color: e.target.value };
                                  setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Description</label>
                            <textarea 
                              placeholder="Description"
                              value={item.desc}
                              onChange={(e) => {
                                const newItems = [...(localContent.milestone?.items || [])];
                                newItems[index] = { ...newItems[index], desc: e.target.value };
                                setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newItems = [...(localContent.milestone?.items || []), { status: "New Milestone", count: "0", desc: "Description", color: "border-white/20" }];
                        setLocalContent({...localContent, milestone: {...localContent.milestone, items: newItems}});
                      }}
                      className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                    >
                      <Plus size={18} className="mr-2" /> Add Milestone
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'keyPeople' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {localContent.keyPeople?.map((person, index) => (
                      <div key={index} className="bg-zinc-950 p-6 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all flex flex-col md:flex-row gap-6">
                        <button 
                          onClick={() => {
                            const newPeople = localContent.keyPeople.filter((_, i) => i !== index);
                            setLocalContent({...localContent, keyPeople: newPeople});
                          }}
                          className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="w-full md:w-1/3 shrink-0">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Member Photo</label>
                          <ImageUpload 
                            path="team" 
                            currentUrl={person.imageUrl} 
                            onUploadSuccess={(url) => {
                              const newPeople = [...(localContent.keyPeople || [])];
                              newPeople[index] = { ...newPeople[index], imageUrl: url };
                              setLocalContent({...localContent, keyPeople: newPeople});
                            }} 
                          />
                        </div>
                        
                        <div className="flex-1 space-y-4 pt-2">
                          <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Team Member {index + 1}</div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Name</label>
                              <input 
                                type="text"
                                value={person.name}
                                onChange={(e) => {
                                  const newPeople = [...(localContent.keyPeople || [])];
                                  newPeople[index] = { ...newPeople[index], name: e.target.value };
                                  setLocalContent({...localContent, keyPeople: newPeople});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Role</label>
                              <input 
                                type="text"
                                value={person.role}
                                onChange={(e) => {
                                  const newPeople = [...(localContent.keyPeople || [])];
                                  newPeople[index] = { ...newPeople[index], role: e.target.value };
                                  setLocalContent({...localContent, keyPeople: newPeople});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Biography</label>
                            <textarea 
                              value={person.desc}
                              onChange={(e) => {
                                const newPeople = [...(localContent.keyPeople || [])];
                                newPeople[index] = { ...newPeople[index], desc: e.target.value };
                                setLocalContent({...localContent, keyPeople: newPeople});
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                      const newPeople = [...(localContent.keyPeople || []), { name: "New Member", role: "Role", desc: "Description", imageUrl: "" }];
                      setLocalContent({...localContent, keyPeople: newPeople});
                    }}
                    className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                  >
                    <Plus size={18} className="mr-2" /> Add Team Member
                  </button>
                </div>
              )}
              
              {activeTab === 'clients' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Title</label>
                      <input 
                        type="text"
                        value={localContent.clients?.title || ""}
                        onChange={(e) => setLocalContent({...localContent, clients: {...localContent.clients, title: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Subtitle</label>
                      <input 
                        type="text"
                        value={localContent.clients?.subtitle || ""}
                        onChange={(e) => setLocalContent({...localContent, clients: {...localContent.clients, subtitle: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Client Directory</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(localContent.clients?.items || []).map((item: any, index: number) => {
                        // Support both old string format and new object format
                        const client = typeof item === 'string' ? { name: item, logoUrl: '' } : item;
                        return (
                          <div key={index} className="bg-zinc-950 p-5 rounded-2xl border border-white/5 space-y-4 relative group hover:border-[#7d39eb]/30 transition-all">
                            <button 
                              onClick={() => {
                                const newItems = localContent.clients.items.filter((_: any, i: number) => i !== index);
                                setLocalContent({...localContent, clients: {...localContent.clients, items: newItems}});
                              }}
                              className="absolute top-3 right-3 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 z-10"
                              title="Remove Client"
                            >
                              <Trash2 size={14} />
                            </button>
                            
                            <div className="text-[10px] font-bold uppercase text-[#7d39eb] tracking-[0.1em]">Client {index + 1}</div>
                            
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Client Name</label>
                              <input 
                                type="text"
                                value={client.name}
                                onChange={(e) => {
                                  const newItems = [...(localContent.clients?.items || [])];
                                  newItems[index] = { ...client, name: e.target.value };
                                  setLocalContent({...localContent, clients: {...localContent.clients, items: newItems}});
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Client Logo</label>
                              <ImageUpload 
                                path="clients" 
                                currentUrl={client.logoUrl || ""} 
                                onUploadSuccess={(url) => {
                                  const newItems = [...(localContent.clients?.items || [])];
                                  newItems[index] = { ...client, logoUrl: url };
                                  setLocalContent({...localContent, clients: {...localContent.clients, items: newItems}});
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => {
                        const newItems = [...(localContent.clients?.items || []), { name: "New Client", logoUrl: "" }];
                        setLocalContent({...localContent, clients: {...localContent.clients, items: newItems}});
                      }}
                      className="flex items-center justify-center w-full bg-zinc-900 hover:bg-zinc-800 border border-dashed border-white/20 rounded-2xl p-6 transition-all text-sm font-medium hover:border-[#7d39eb]"
                    >
                      <Plus size={18} className="mr-2" /> Add Client
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'footer' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Footer Headline (HTML Allowed)</label>
                    <input 
                      type="text"
                      value={localContent.footer?.title || ""}
                      onChange={(e) => setLocalContent({...localContent, footer: {...localContent.footer, title: e.target.value}})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Email Address</label>
                      <input 
                        type="text"
                        value={localContent.footer?.email || ""}
                        onChange={(e) => setLocalContent({...localContent, footer: {...localContent.footer, email: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Office Address</label>
                      <input 
                        type="text"
                        value={localContent.footer?.address || ""}
                        onChange={(e) => setLocalContent({...localContent, footer: {...localContent.footer, address: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2">Phone Numbers</label>
                    <div className="space-y-2">
                      {localContent.footer?.phones?.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text"
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...(localContent.footer?.phones || [])];
                              newPhones[index] = e.target.value;
                              setLocalContent({...localContent, footer: {...localContent.footer, phones: newPhones}});
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
                          />
                          <button 
                            onClick={() => {
                              const newPhones = localContent.footer.phones.filter((_, i) => i !== index);
                              setLocalContent({...localContent, footer: {...localContent.footer, phones: newPhones}});
                            }}
                            className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newPhones = [...(localContent.footer?.phones || []), "+62"];
                          setLocalContent({...localContent, footer: {...localContent.footer, phones: newPhones}});
                        }}
                        className="flex items-center text-[#7d39eb] hover:text-[#6c2bd9] text-sm font-bold mt-2"
                      >
                        <Plus size={16} className="mr-1" /> Add Phone
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
