import { useState, useEffect } from 'react';
import { Save, User, Users, Shield, Building, Settings as SettingsIcon, Brain, Mic, Mail, Bell, Database, FileText } from 'lucide-react';
import api from '../../lib/api';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'ai', label: 'AI Settings', icon: Brain },
  { id: 'discussion', label: 'Discussion', icon: Users },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'database', label: 'Database', icon: Database },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    general: {
      college_name: '',
      academic_year: '',
      timezone: '',
      language: ''
    },
    ai: {
      primary_model: '',
      features: {
        grammar_checking: true,
        pronunciation_analysis: true,
        vocabulary_analysis: true,
        confidence_analysis: true,
        enable_summary: true
      }
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralChange = (field: string, value: string) => {
    setSettings({
      ...settings,
      general: { ...settings.general, [field]: value }
    });
  };

  const handleAiChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      ai: { ...settings.ai, [field]: value }
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setSettings({
      ...settings,
      ai: {
        ...settings.ai,
        features: {
          ...settings.ai.features,
          [feature]: !settings.ai.features[feature as keyof typeof settings.ai.features]
        }
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
          <p className="text-slate-500">Manage global platform configurations and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 sticky top-6 shadow-sm">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            
            {activeTab === 'general' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">General Configuration</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">College Name</label>
                    <input 
                      type="text" 
                      value={settings.general.college_name} 
                      onChange={e => handleGeneralChange('college_name', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 outline-none focus:border-indigo-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Academic Year</label>
                    <input 
                      type="text" 
                      value={settings.general.academic_year} 
                      onChange={e => handleGeneralChange('academic_year', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 outline-none focus:border-indigo-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                    <select 
                      value={settings.general.timezone}
                      onChange={e => handleGeneralChange('timezone', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                    >
                      <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                    <select 
                      value={settings.general.language}
                      onChange={e => handleGeneralChange('language', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">AI Models & Analytics</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Inference Model (Ollama)</label>
                    <select 
                      value={settings.ai.primary_model}
                      onChange={e => handleAiChange('primary_model', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                    >
                      <option value="llama3.1:8b">llama3.1:8b</option>
                      <option value="qwen2.5:7b">qwen2.5:7b</option>
                      <option value="gemma3">gemma3</option>
                      <option value="mistral">mistral</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">Analysis Features</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'grammar_checking', label: 'Grammar Checking' },
                        { key: 'pronunciation_analysis', label: 'Pronunciation Analysis' },
                        { key: 'vocabulary_analysis', label: 'Vocabulary Analysis' },
                        { key: 'confidence_analysis', label: 'Confidence Analysis' },
                        { key: 'enable_summary', label: 'Enable AI Summary' }
                      ].map((feature, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.ai.features[feature.key as keyof typeof settings.ai.features] as boolean}
                            onChange={() => handleFeatureToggle(feature.key)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" 
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'ai' && (
              <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SettingsIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">{tabs.find(t => t.id === activeTab)?.label} Configuration</h3>
                <p className="text-slate-500 mt-2">These settings are coming soon or being wired to the backend.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
