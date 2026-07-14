import { useState } from 'react';
import { LifeBuoy, Search, BookOpen, MessageCircle, FileText, ChevronDown, ChevronUp, Mail } from 'lucide-react';

const faqs = [
  {
    question: "How do I create a new Discussion Room?",
    answer: "Navigate to 'Practice Rooms' in the sidebar, click the 'Create Room' button in the top right, fill out the room details including topic and schedule, and click Save. Students will then see the room in their dashboard."
  },
  {
    question: "Can I export student performance data?",
    answer: "Yes. Go to 'Data Operations' under System, and click 'Export CSV' under the AI Analytics & Scores section. This will download a spreadsheet of all session scores."
  },
  {
    question: "The AI agent is not responding during a session. What do I do?",
    answer: "First, check the 'System Logs' to ensure the LLM service (Ollama) is running and hasn't timed out. If there's an error, you may need to restart the inference engine from the terminal. If the problem persists, contact technical support."
  },
  {
    question: "How do I reset a student's password?",
    answer: "Go to the 'Students' directory, search for the student, click the three-dot menu next to their name, and select 'Reset Password'. A temporary password will be generated for them."
  },
  {
    question: "How are the gamification badges awarded?",
    answer: "Badges are awarded automatically by the AI based on performance criteria. For example, maintaining a 90+ score across 3 consecutive sessions awards a 'Consistency' badge. You can view all awarded badges in the 'Achievements' tab."
  }
];

export default function AdminHelp() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(search.toLowerCase()) || 
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Help & Support
          </h1>
          <p className="text-slate-500 mt-1">Platform documentation, FAQs, and technical support access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Search FAQs..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors shadow-sm" 
              />
            </div>

            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No matching questions found.</p>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 transition-colors text-left"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="p-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Need Technical Help?</h2>
            <p className="text-indigo-100 text-sm mb-6">
              If you're experiencing bugs, server crashes, or need advanced configurations, our engineering team is here to assist you.
            </p>
            <button className="w-full py-2.5 bg-white text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Support Team
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-md text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Admin Manual</div>
                  <div className="text-xs text-slate-500">Comprehensive PDF guide</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">API Documentation</div>
                  <div className="text-xs text-slate-500">Endpoints and integration</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-md text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Community Forum</div>
                  <div className="text-xs text-slate-500">Discuss with other admins</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
