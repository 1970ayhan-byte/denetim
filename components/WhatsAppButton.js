'use client'

import { MessageCircle } from 'lucide-react'
import { openWhatsApp } from '@/lib/tracking'

export default function WhatsAppButton() {
  const handleClick = () => {
    openWhatsApp(
      '905549584320',
      'Merhaba, anaokulum için denetim öncesi eksiklerimi öğrenmek istiyorum.',
      'floating_button'
    )
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center gap-2 group"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden group-hover:inline-block whitespace-nowrap pr-2 font-semibold">
        WhatsApp ile Sor
      </span>
    </button>
  )
}
