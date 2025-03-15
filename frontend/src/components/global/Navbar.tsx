"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface SimpleDropdownItem {
  title: string
  description: string
}

interface NavigationItem {
  title: string
  href: string
}

interface SectionDropdownItem {
  section: string
  items: NavigationItem[]
}

type DropdownItem = SimpleDropdownItem | SectionDropdownItem

interface NavItem {
  title: string
  dropdownItems: DropdownItem[]
}

const NavItems: NavItem[] = [
  {
    title: "Products",
    dropdownItems: [
      { title: "Product 1", description: "Description for product 1" },
      { title: "Product 2", description: "Description for product 2" },
    ],
  },
  {
    title: "Solutions",
    dropdownItems: [
      {
        section: "What We Do",
        items: [
          { title: "Set Up Your Skills Strategy", href: "/skills-strategy" },
          { title: "Showcase Your Tech Brand", href: "/tech-brand" },
          { title: "Optimize Your Hiring Process", href: "/hiring-process" },
          { title: "Mobilize Your Internal Talent", href: "/internal-talent" },
        ],
      },
      {
        section: "Use Cases",
        items: [
          { title: "Remote Hiring", href: "/remote-hiring" },
          { title: "University Hiring", href: "/university-hiring" },
        ],
      },
    ],
  },
  {
    title: "Resources",
    dropdownItems: [],
  },
  {
    title: "Pricing",
    dropdownItems: [],
  },
  {
    title: "For Developers",
    dropdownItems: [],
  },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if an item is a SimpleDropdownItem
  const isSimpleItem = (item: DropdownItem): item is SimpleDropdownItem => {
    return 'title' in item && 'description' in item
  }

  // Check if an item is a SectionDropdownItem
  const isSectionItem = (item: DropdownItem): item is SectionDropdownItem => {
    return 'section' in item && 'items' in item
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200" : ""
    }`}>
      <div className="max-w-[1300px] mx-auto">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <div className="flex-shrink-0 pr-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg?height=40&width=40"
                alt="Logo"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links with Dropdowns */}
          <div className="hidden md:flex items-center">
            {NavItems.map((item) => (
              <div key={item.title} className="relative group mx-2">
                {item.dropdownItems.length > 0 ? (
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                    {item.title}
                  </div>
                ) : (
                  <NavLink href={`/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.title}
                  </NavLink>
                )}
                
                {/* Dropdown Menu */}
                {item.dropdownItems.length > 0 && (
                  <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-3 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {/* Dropdown Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-200" />
                    <div className="max-h-[80vh] overflow-y-auto">
                      {item.dropdownItems.map((dropdownItem, idx) => (
                        <div key={idx}>
                          {isSimpleItem(dropdownItem) && (
                            <div className="px-4 py-2 hover:bg-gray-50">
                              <div className="font-medium text-gray-800">{dropdownItem.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{dropdownItem.description}</div>
                            </div>
                          )}
                          
                          {isSectionItem(dropdownItem) && (
                            <div className="pt-2 pb-1">
                              <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {dropdownItem.section}
                              </div>
                              <div>
                                {dropdownItem.items.map((link, linkIdx) => (
                                  <Link
                                    key={linkIdx}
                                    href={link.href}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    {link.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link 
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// NavLink component for consistent styling
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
    >
      {children}
    </Link>
  )
}