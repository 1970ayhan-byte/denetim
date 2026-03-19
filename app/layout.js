import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: {
    default: 'Anaokulu Denetim Hizmeti | MEB Denetim Hazırlık - Sarımeşe Danışmanlık',
    template: '%s | Anaokulu Denetim'
  },
  description: 'MEB anaokulu denetimine hazır mısınız? Kuruluş standartları, yangın güvenliği ve tarım denetimlerine profesyonel hazırlık. Eksikleri önceden tespit edin, ceza riskini azaltın. Türkiye geneli hizmet.',
  keywords: ['anaokulu denetimi', 'MEB denetim', 'kreş denetimi', 'okul öncesi denetim', 'kuruluş standartları', 'yangın denetimi', 'anaokulu danışmanlık', 'denetim hazırlık'],
  authors: [{ name: 'Sarımeşe Danışmanlık' }],
  creator: 'Sarımeşe Danışmanlık',
  publisher: 'Sarımeşe Danışmanlık',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.anaokuludenetim.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Anaokulu Denetim Hizmeti | MEB Denetim Hazırlık',
    description: 'MEB anaokulu denetimine hazır mısınız? Kuruluş standartları, yangın güvenliği denetimlerine profesyonel hazırlık. Eksikleri önceden tespit edin.',
    url: 'https://www.anaokuludenetim.com',
    siteName: 'Anaokulu Denetim',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Anaokulu Denetim Hizmeti - Sarımeşe Danışmanlık',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anaokulu Denetim Hizmeti | MEB Denetim Hazırlık',
    description: 'MEB anaokulu denetimine hazır mısınız? Kuruluş standartları, yangın güvenliği denetimlerine profesyonel hazırlık.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // TODO: Add actual verification code
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.anaokuludenetim.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1677573069219552');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}} 
            src="https://www.facebook.com/tr?id=1677573069219552&ev=PageView&noscript=1" 
          />
        </noscript>
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Sarımeşe Danışmanlık',
              description: 'Anaokulu MEB denetim hazırlık hizmeti',
              url: 'https://www.anaokuludenetim.com',
              logo: 'https://www.anaokuludenetim.com/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+90-555-000-0000',
                contactType: 'customer service',
                areaServed: 'TR',
                availableLanguage: 'Turkish'
              },
              sameAs: [
                'https://www.facebook.com/sarimesedanismanlik',
                'https://www.instagram.com/sarimesedanismanlik'
              ]
            })
          }}
        />
        
        {/* Structured Data - Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Anaokulu Denetim Hizmeti',
              description: 'MEB anaokulu denetim hazırlık danışmanlığı',
              url: 'https://www.anaokuludenetim.com',
              priceRange: '₺₺',
              areaServed: {
                '@type': 'Country',
                name: 'Turkey'
              },
              serviceType: ['Denetim Danışmanlığı', 'MEB Hazırlık', 'Kuruluş Standartları Kontrolü']
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}