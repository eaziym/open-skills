import React from 'react';

export default function SkillRow({ dataType, dataVal, currentUser }) {
    const keyValPairCss = "w-full my-2 flex flex-col justify-left"

    // Determine which user property to check against (opposite category)
    const compareType = dataType === 'skills' ? 'interests' : 'skills';

    // Extract names from dataVal (could be objects or strings)
    const items = Array.isArray(dataVal) 
        ? dataVal.map(item => item.name || item) 
        : [];

    // Extract names from current user's opposite category
    const userCompareItems = currentUser && Array.isArray(currentUser[compareType])
        ? currentUser[compareType].map(item => item.name || item)
        : [];

    return (
        <div className={keyValPairCss}>
            <label className='mb-3 text-sm text-gray-500'>{dataType}</label>
            <div className="flex flex-wrap">
                {items.map((item, key) => {
                    const highlightClass = userCompareItems.includes(item)
                    ? "rounded-full bg-green-600 text-white px-4 py-2 text-sm mr-2 mb-2 hover:bg-green-700"
                    : "rounded-full bg-blue-400 text-gray-900 px-4 py-2 text-sm mr-2 mb-2 hover:bg-blue-300";                    return <label key={key} className={highlightClass}>{item}</label>
                })}
            </div>
        </div>
    )
}