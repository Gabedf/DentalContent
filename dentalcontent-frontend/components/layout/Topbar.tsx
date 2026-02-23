import Link from 'next/link'
import Button from '@/components/ui/Button'

interface TopbarProps {
  title: string
  action?: { label: string; href: string }
}

export default function Topbar({ title, action }: TopbarProps) {
  return (
    <div className="h-14 border-b border-border flex items-center px-8 gap-4 bg-surface sticky top-0 z-40">
      <h1 className="font-playfair font-semibold text-[19px] tracking-tight text-ink flex-1">{title}</h1>
      {action && (
        <Link href={action.href}>
          <Button variant="primary" size="sm">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
