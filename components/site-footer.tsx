import { MapPin, Phone, Mail } from "lucide-react"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="bg-[#1B2531] border-t border-[#2a3744] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/m-e1711971991323-2mknykSFdtXqO6wehmSaNc7AzcqsYO.png"
              alt="Neo Wave"
              width={200}
              height={80}
              className="mb-4"
            />
          </div>
          <div>
            <h3 className="text-xl text-white font-medium mb-6">Useful Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-[#40C4FF] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-[#40C4FF] transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/news-and-event" className="text-gray-300 hover:text-[#40C4FF] transition-colors">
                  News & events
                </a>
              </li>
              <li>
                <a href="/contact-us" className="text-gray-300 hover:text-[#40C4FF] transition-colors">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl text-white font-medium mb-6">Contact us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-[#40C4FF] flex-shrink-0 mt-1" />
                <span>8 The Green A, Dover, DE 19901, United States</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-[#40C4FF]" />
                <a href="tel:+13025251275" className="hover:text-[#40C4FF] transition-colors">
                  +1 (302) 525-1275
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-[#40C4FF]" />
                <a href="mailto:info@neowave.tech" className="hover:text-[#40C4FF] transition-colors">
                  info@neowave.tech
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#2a3744] text-center">
          <p className="text-gray-400">Copyright © 2024 Neo Wave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

