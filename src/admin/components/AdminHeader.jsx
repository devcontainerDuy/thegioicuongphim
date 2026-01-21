import React from 'react';

export const AdminHeader = ({ title, description, children }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 fade-in">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
                {description && <p className="text-zinc-400 text-sm mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-3">
                {children}
            </div>
        </div>
    );
};

export default AdminHeader;
