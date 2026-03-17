// Meta Pixel tracking helper functions

export const trackEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData)
    console.log(`📊 Meta Pixel Event: ${eventName}`, eventData)
  }
}

export const trackFormSubmit = (formType, data = {}) => {
  trackEvent('Lead', {
    content_name: formType,
    ...data
  })
}

export const trackWhatsAppClick = (source) => {
  trackEvent('Contact', {
    content_name: 'WhatsApp',
    source: source
  })
}

export const trackCTAClick = (ctaText, location) => {
  trackEvent('Lead', {
    content_name: 'CTA Click',
    cta_text: ctaText,
    location: location
  })
}

export const trackPackageView = (packageName) => {
  trackEvent('ViewContent', {
    content_name: packageName,
    content_type: 'package'
  })
}

export const trackPurchaseIntent = (packageName, price) => {
  trackEvent('InitiateCheckout', {
    content_name: packageName,
    value: price,
    currency: 'TRY'
  })
}

// WhatsApp helper
export const openWhatsApp = (phone, message, source = 'button') => {
  trackWhatsAppClick(source)
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/${phone}?text=${encodedMessage}`
  window.open(url, '_blank')
}
