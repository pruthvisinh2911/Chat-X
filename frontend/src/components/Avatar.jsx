export default function Avatar({ initials, color = 'from-violet-500 to-purple-600', size = 'md', online = false }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }

  const dotSizes = {
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-[1.5px]',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
  }

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-semibold text-white`}>
        {initials}
      </div>
      {online && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full bg-emerald-400 border-[#09090b]`} />
      )}
    </div>
  )
}
