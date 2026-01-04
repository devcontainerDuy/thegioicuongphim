import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ErrorPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-black text-primary mb-4">404</h1>
            <p className="text-xl text-zinc-400 mb-8">Không tìm thấy trang bạn yêu cầu.</p>
            <Button asChild>
                <Link to="/">Trở về Trang chủ</Link>
            </Button>
        </div>
    );
};

export default ErrorPage;
