"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
  defaultOpen?: string
}

export function Accordion({ items, className, defaultOpen }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen || null)

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => (
        <div key={item.id} className="glass rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="w-full flex items-center justify-between p-4 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            {item.title}
            <ChevronDown
              size={16}
              className={cn(
                "text-text-muted transition-transform duration-200",
                open === item.id && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {open === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 text-sm text-text-secondary">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
