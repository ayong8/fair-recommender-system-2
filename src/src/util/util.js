export const parseHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body;
};

export const adjustCategorySize = (delta, expandedFactor, setExpandedCategories, cat) => {
    setExpandedCategories(prev => {
        const currentFactor = expandedFactor || 0;
        const newFactor = currentFactor + delta * 15; // Allow negative values
        const changeInFactor = newFactor - currentFactor;
        const otherCategories = Object.keys(prev).filter(name => name !== cat.name);
        const adjustmentPerCategory = changeInFactor / otherCategories.length;

        return Object.fromEntries(
            Object.entries(prev).map(([name, factor]) => {
                if (name === cat.name) {
                    return [name, newFactor];
                } else {
                    const adjustedFactor = factor - adjustmentPerCategory;
                    return [name, Math.max(0, adjustedFactor)];
                }
            })
        );
    });
};
