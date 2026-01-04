import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const Maintenance = () => {
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate(); // Unused for now
  const [bypassToken, setBypassToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-check token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      handleBypass(tokenFromUrl);
    }
  }, [searchParams]);

  const handleBypass = (token) => {
    setIsLoading(true);
    // Determine api base url - hardcoded for simplicty or env
    // For now assuming we just verify by trying to hit home page or just saving key
    // Better practice: Save key to localStorage/Cookie then redirect
    
    // Save to Cookie (standard way our MaintenanceGuard checks? No, guard checks Header/Query)
    // So we need to ensure our apiClient attaches this token from storage.
    localStorage.setItem('maintenance_token', token);
    document.cookie = `maintenance_token=${token}; path=/; max-age=86400`; // Backup cookie

    // Simulate delay for effect
    setTimeout(() => {
        setIsLoading(false);
        toast.success('Token được chấp nhận! Đang chuyển hướng...');
        window.location.href = '/'; // Reload to clear 503 state
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Icon / Illustration */}
        <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-16 h-16 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Hệ thống đang bảo trì</h1>
          <p className="text-zinc-400">
            Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. 
            <br />Vui lòng quay lại sau ít phút.
          </p>
        </div>

        {/* Developer Bypass */}
        <div className="pt-8 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest">Dành cho Nhà phát triển</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Nhập mã truy cập..." 
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    value={bypassToken}
                    onChange={(e) => setBypassToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBypass(bypassToken)}
                />
                <button 
                    onClick={() => handleBypass(bypassToken)}
                    disabled={isLoading}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Đang check...' : 'Truy cập'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Maintenance;
