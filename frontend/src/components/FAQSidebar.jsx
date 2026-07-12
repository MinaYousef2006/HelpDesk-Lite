import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../utils/constants';

const FAQSidebar = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Common Issues</h3>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <div key={item.title} className="border border-slate-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {item.title}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-3 pb-3 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSidebar;
