import { useState, useEffect } from 'react';

// type can be 'success' or 'warning'
function Alert({ type, message }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if(message)
            setVisible(true)
        const timeout = setTimeout(() => {
            setVisible(false)
        }, 5000)

        return () => clearTimeout(timeout);
    }, [type, message]);

    let textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    let bgColor = type === 'success' ? 'bg-green-400' : 'bg-red-300';

    const handleClose = () => {
        setVisible(false);
    };

    return (
        <>
            {visible && (
                <div className={`z-50 max-w-xl flex items-center p-4 mb-4 ${textColor} rounded-lg ${bgColor}`} role="alert">
                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className={`ms-3 text-sm font-medium ${textColor}`}>
                        {message}
                    </div>
                    <button type="button" className={`ms-auto -mx-1.5 -my-1.5 ${bgColor} rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-100 hover:opacity-75 inline-flex items-center justify-center h-8 w-8`} aria-label="Close" onClick={handleClose}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}

export default Alert;
