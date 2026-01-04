import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, color, subtext }) => {
    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900/80 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-zinc-950 border border-zinc-800", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-md", 
                        trend > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                        {trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <h4 className="text-zinc-400 text-sm font-medium">{title}</h4>
                <p className="text-2xl font-bold text-zinc-100 mt-1">{value?.toLocaleString() || 0}</p>
                {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatCard;
