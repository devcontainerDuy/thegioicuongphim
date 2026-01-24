import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-card dark:bg-zinc-950 text-muted-foreground py-12 px-4 md:px-12 text-sm border-t border-border">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <ul className="space-y-3">
                    <li>
                        <Link to="/" className="hover:underline">
                            FAQ
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Investor Relations
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Privacy
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Speed Test
                        </Link>
                    </li>
                </ul>
                <ul className="space-y-3">
                    <li>
                        <Link to="/" className="hover:underline">
                            Help Center
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Jobs
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Cookie Preferences
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Legal Notices
                        </Link>
                    </li>
                </ul>
                <ul className="space-y-3">
                    <li>
                        <Link to="/" className="hover:underline">
                            Account
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Ways to Watch
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Corporate Information
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Only on Cuong Phim
                        </Link>
                    </li>
                </ul>
                <ul className="space-y-3">
                    <li>
                        <Link to="/" className="hover:underline">
                            Media Center
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Terms of Use
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="hover:underline">
                            Contact Us
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                <div className="flex justify-center mb-4">
                    <p>© {new Date().getFullYear()} Thế Giới Cuồng Phim. All rights reserved.</p>
                </div>
                <small className="block max-w-4xl mx-auto leading-relaxed">
                    Tất cả nội dung của trang web này được thu thập từ các trang web video chính thống trên Internet và không cung cấp phát trực tuyến chính hãng. Nếu quyền lợi của bạn bị vi phạm, vui lòng thông báo cho chúng tôi, chúng tôi sẽ xóa nội dung vi phạm kịp thời, cảm ơn sự hợp tác của bạn!
                </small>
            </div>
        </footer>
    );
};

export default Footer;
