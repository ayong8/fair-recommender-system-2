// App.jsx or CategoryView.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Sample data structure
const categoryData = [
  { id: 1, category: 'Technology', proportion: 0.35, color: '#2563eb', items: 350 },
  { id: 2, category: 'Sports', proportion: 0.25, color: '#3b82f6', items: 250 },
  { id: 3, category: 'Music', proportion: 0.20, color: '#60a5fa', items: 200 },
  { id: 4, category: 'Movies', proportion: 0.12, color: '#93c5fd', items: 120 },
  { id: 5, category: 'Books', proportion: 0.08, color: '#bfdbfe', items: 80 }
];

export default function StackedCategories() {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const totalHeight = 600;

  const adjustSize = (id, delta) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: Math.max(0.5, Math.min(3, (prev[id] || 1) + delta))
    }));
  };

  const getExpandedFactor = (categoryId) => expandedCategories[categoryId] || 1;
  
  const totalExpansionFactor = categoryData.reduce((sum, cat) => 
    sum + (cat.proportion * getExpandedFactor(cat.id)), 0
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm">
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {categoryData.map((category) => {
          const baseHeight = (category.proportion * totalHeight) / totalExpansionFactor;
          const height = baseHeight * getExpandedFactor(category.id);
          const expansionFactor = getExpandedFactor(category.id);
          
          return (
            <div
              key={category.id}
              className="relative w-full transition-all duration-500 ease-in-out group"
              style={{
                height: `${height}px`,
                backgroundColor: category.color
              }}
            >
              {/* Category label */}
              <div className="absolute inset-x-0 top-2 px-4 text-white">
                <div className="font-medium">{category.category}</div>
                <div className="text-sm opacity-90">
                  {category.items} items {expansionFactor !== 1 && `(${expansionFactor.toFixed(1)}x)`}
                </div>
              </div>

              {/* Compact menu */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 
                            opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300
                            flex bg-black bg-opacity-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => adjustSize(category.id, -0.5)}
                  disabled={expansionFactor <= 0.5}
                  className="p-2 hover:bg-white hover:bg-opacity-20 
                           transition-colors disabled:opacity-50
                           disabled:hover:bg-transparent"
                >
                  <ChevronDown size={18} className="text-white" />
                </button>
                <div className="w-px bg-white bg-opacity-20" />
                <button
                  onClick={() => adjustSize(category.id, 0.5)}
                  disabled={expansionFactor >= 3}
                  className="p-2 hover:bg-white hover:bg-opacity-20 
                           transition-colors disabled:opacity-50
                           disabled:hover:bg-transparent"
                >
                  <ChevronUp size={18} className="text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// CSS (if not using Tailwind, add these styles)
/*
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
*/
