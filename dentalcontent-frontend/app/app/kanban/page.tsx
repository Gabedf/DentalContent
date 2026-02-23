'use client'
import { useState } from 'react'
import Link from 'next/link'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { useContents, useUpdateStatus } from '@/hooks/useContents'
import { Content, ContentStatus, STATUS_LABELS, STATUS_COLORS, CONTENT_TYPE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

const COLUMNS: ContentStatus[] = ['idea', 'generated', 'approved', 'scheduled', 'published']

const COL_COLORS: Record<ContentStatus, string> = {
  idea: '#999990',
  generated: '#9A6700',
  approved: '#2D6A4F',
  scheduled: '#6D28D9',
  published: '#555550',
}

function ContentModal({ content, onClose }: { content: Content; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-7 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex flex-col gap-2">
            <TypeBadge type={content.content_type} />
            <h3 className="font-playfair font-bold text-xl text-ink leading-snug">{content.theme}</h3>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors ml-4 text-lg">✕</button>
        </div>

        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
          <StatusBadge status={content.status} />
          {content.scheduled_date && <span className="text-[12px] text-ink-muted">📅 {formatDate(content.scheduled_date)}</span>}
        </div>

        {content.headlines?.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[1px] mb-2">Headlines</p>
            <div className="flex flex-col gap-1.5">
              {content.headlines.map((h, i) => (
                <div key={i} className="bg-surface2 rounded-lg px-3 py-2.5 text-[13px] text-ink-mid flex gap-2.5">
                  <span className="text-ink-faint text-[11px] font-bold">0{i+1}</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.caption && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[1px] mb-2">Legenda</p>
            <pre className="text-[12px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-3 border border-border font-instrument max-h-40 overflow-y-auto">
              {content.caption}
            </pre>
          </div>
        )}

        {content.hashtags?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[1px] mb-2">Hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {content.hashtags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-green-light border border-green/20 rounded-full text-[11px] text-green">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCard({ content, isDragging, onClick }: { content: Content; isDragging?: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: content.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes}
      className={`bg-surface border border-border rounded-xl p-4 transition-all hover:shadow-card-hover hover:border-border-strong ${content.status === 'published' ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <TypeBadge type={content.content_type} />
        <span {...listeners} className="text-ink-faint hover:text-ink-muted cursor-grab active:cursor-grabbing text-base px-1" title="Arrastar">⠿</span>
      </div>
      <p className="text-[13px] text-ink leading-snug mb-3 cursor-pointer hover:text-green transition-colors" onClick={onClick}>
        {content.theme}
      </p>
      <div className="flex items-center justify-between text-[11px] text-ink-muted">
        <span className="font-medium">{content.subniche === 'estetico' ? 'Estético' : 'Implante'}</span>
        <div className="flex items-center gap-2">
          {content.scheduled_date && <span>{formatDate(content.scheduled_date)}</span>}
          <button onClick={onClick} className="text-ink-faint hover:text-green transition-colors" title="Ver detalhes">↗</button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { data: contents, isLoading } = useContents()
  const updateStatus = useUpdateStatus()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const byStatus = (s: ContentStatus) => contents?.filter((c) => c.status === s) || []
  const activeContent = contents?.find((c) => c.id === activeId)

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const targetStatus = COLUMNS.includes(over.id as ContentStatus)
      ? (over.id as ContentStatus)
      : contents?.find((c) => c.id === over.id)?.status
    if (!targetStatus) return
    const src = contents?.find((c) => c.id === active.id)
    if (!src || src.status === targetStatus) return
    updateStatus.mutate({ id: active.id as string, status: targetStatus })
  }

  return (
    <div>
      <Topbar title="Kanban" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-surface border border-border rounded-lg p-1 gap-0.5 shadow-card">
            <span className="px-3 py-1.5 rounded-md bg-surface2 border border-border text-[13px] font-medium text-ink">Kanban</span>
            <Link href="/app/calendar">
              <button className="px-3 py-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors">Calendário</button>
            </Link>
          </div>
          <Link href="/app/generate">
            <Button variant="outline" size="sm">Novo conteúdo</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-border border-t-green rounded-full animate-spin" />
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map((status) => {
                const items = byStatus(status)
                return (
                  <div key={status} className="min-w-[240px] w-[240px] flex-shrink-0">
                    <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-t-xl border-b-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COL_COLORS[status] }} />
                        <span className="text-[13px] font-semibold text-ink">{STATUS_LABELS[status]}</span>
                      </div>
                      <span className="text-[11px] font-bold bg-surface2 px-2 py-0.5 rounded-md text-ink-muted border border-border">{items.length}</span>
                    </div>
                    <SortableContext id={status} items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                      <div className="bg-surface2 border border-border rounded-b-xl p-2.5 min-h-[480px] flex flex-col gap-2">
                        {items.map((content) => (
                          <KanbanCard key={content.id} content={content} isDragging={activeId === content.id} onClick={() => setSelectedContent(content)} />
                        ))}
                        {items.length === 0 && (
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-[12px] text-ink-faint text-center">Arraste um card aqui</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                )
              })}
            </div>
            <DragOverlay>
              {activeContent && <KanbanCard content={activeContent} onClick={() => {}} />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
      {selectedContent && <ContentModal content={selectedContent} onClose={() => setSelectedContent(null)} />}
    </div>
  )
}
