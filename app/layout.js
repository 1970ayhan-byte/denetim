import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Sarımeşe Danışmanlık - Anaokulu Denetim Hizmeti',
  description: 'MEB, Yangın ve Tarım denetimlerine hazırlık. Anaokulunuzun eksiklerini önceden tespit edin, ceza riskini azaltın.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        
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
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}