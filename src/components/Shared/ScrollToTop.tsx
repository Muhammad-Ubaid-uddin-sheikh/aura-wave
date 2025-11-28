"use client"
import { Button } from '@/components/ui/button'
import { siteConfig } from "@/constants/siteConfig";
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  const handleScroll = () => {
    setIsVisible(window.scrollY > 300)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {isVisible && (
        <div className='fixed bottom-0 right-0 p-4 flex flex-col items-center gap-2'>
          {/* Whatsapp Button */}
          {/* <Link href={`https://wa.me/${siteConfig.socials.whatsapp}`} target="_blank" rel="noopener noreferrer">
          <button
            className="p-2 flex justify-center items-center rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg z-50 w-14 h-14"
          >
            <FaWhatsapp className="w-8 h-8" />
          </button>
          </Link> */}

          {/* Scroll to Top Button */}
          <Button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg z-50"
            size="icon"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>

      )}
    </>
  )
}

export default ScrollToTop