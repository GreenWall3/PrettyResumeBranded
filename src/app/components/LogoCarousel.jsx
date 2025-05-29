'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LogoCarousel() {
  const companies = [
    { name: 'Company 1', logo: '/images/companies/1.png', invertColors: true },
    { name: 'Company 2', logo: '/images/companies/2.png', invertColors: false },
    { name: 'Company 3', logo: '/images/companies/3.png', invertColors: true },
    { name: 'Company 4', logo: '/images/companies/4.png', invertColors: false },
    { name: 'Company 5', logo: '/images/companies/5.png', invertColors: true },
    { name: 'Company 6', logo: '/images/companies/6.png', invertColors: true },
    { name: 'Company 7', logo: '/images/companies/7.png', invertColors: true },
    { name: 'Company 8', logo: '/images/companies/8.png', invertColors: false }
  ]

  return (
    <div className="flex overflow-hidden py-4">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex gap-8 items-center whitespace-nowrap"
      >
        {companies.concat(companies).map((company, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-24 h-10 relative hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={96}
              height={40}
              className={`object-contain w-full h-full ${company.invertColors ? 'invert' : ''}`}
              priority={index < 8}
              onError={(e) => {
                console.error(`Error loading image: ${company.logo}`)
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
} 