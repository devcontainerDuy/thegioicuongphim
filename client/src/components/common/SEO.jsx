import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title, 
    description, 
    image, 
    url, 
    type = 'video.movie',
    schema = null 
}) => {
    const siteName = 'Thế Giới Cuồng Phim';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Xem phim HD online miễn phí, phim bộ, phim lẻ, anime mới nhất 2024 tại Thế Giới Cuồng Phim.';
    const finalDescription = description || defaultDescription;
    const finalImage = image || 'https://thegioicuongphim.com/logo512.png'; // Replace with actual default image
    const finalUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={finalDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={finalUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={finalDescription} />
            <meta property="twitter:image" content={finalImage} />

            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={finalUrl} />

            {/* JSON-LD Structured Data if provided */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
