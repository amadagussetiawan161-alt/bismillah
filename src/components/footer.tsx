import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="font-bold text-white text-xs">S</span>
              </div>
              <span className="font-medium text-slate-900">SaaS Platform</span>
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SaaS Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
