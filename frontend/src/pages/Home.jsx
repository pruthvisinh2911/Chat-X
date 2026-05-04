import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, UserPlus, Bell, Settings, MessageSquare,
  Zap, Users, ChevronRight, X, Check
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { contacts, conversations, friendRequests as initialRequests, currentUser } from '../data/mockData'


function DesktopSidebar({ active, setActive }) {
  const nav = [
    { id: 'chats', icon: MessageSquare },
    { id: 'requests', icon: Users },
    { id: 'settings', icon: Settings },
  ]
  return (
    <aside className="hidden md:flex w-14 flex-col items-center py-5 gap-2 bg-zinc-950 border-r border-zinc-800/60 shrink-0">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20 shrink-0">
        <Zap size={17} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        {nav.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative
              ${active === id ? 'bg-violet-600/20 text-violet-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
            <Icon size={18} />
            {id === 'requests' && initialRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500" />
            )}
          </button>
        ))}
      </div>
      <Avatar initials={currentUser.initials} size="sm" />
    </aside>
  )
}


function MobileTabBar({ active, setActive }) {
  const tabs = [
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'requests', icon: Users, label: 'People' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]
  return (
    <nav className="md:hidden flex items-center border-t border-zinc-800/60 bg-zinc-950 shrink-0">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative
            ${active === id ? 'text-violet-400' : 'text-zinc-600'}`}
        >
          <div className="relative">
            <Icon size={20} />
            {id === 'requests' && initialRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500" />
            )}
          </div>
          <span className="text-[10px] font-medium">{label}</span>
          {active === id && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500" />
          )}
        </button>
      ))}
    </nav>
  )
}

/* ─── Chat list panel ─────────────────────────────────────────────── */
function ChatListPanel({ onSelectChat }) {
  const [search, setSearch] = useState('')

  const enriched = conversations.map(c => ({
    ...c,
    contact: contacts.find(x => x.id === c.contactId),
    lastMsg: c.messages[c.messages.length - 1],
  }))

  const filtered = enriched.filter(c =>
    c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col flex-1 lg:flex-none lg:w-72 lg:border-r lg:border-zinc-800/60 bg-[#0d0d10] min-h-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          {/* Logo visible only on mobile */}
          <div className="flex items-center gap-2.5">
            <div className="md:hidden w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-base font-semibold text-white">Messages</h2>
          </div>
          <button className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
            <UserPlus size={15} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
      </div>

      {/* Online strip */}
      <div className="px-4 mb-3 shrink-0">
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2.5">Online now</p>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {contacts.filter(c => c.online).map(c => (
            <div key={c.id} className="flex flex-col items-center gap-1 shrink-0">
              <Avatar initials={c.initials} color={c.color} size="md" online />
              <span className="text-[10px] text-zinc-500 truncate w-10 text-center">{c.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-2 shrink-0">
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Recent</p>
      </div>

      {/* Chat rows */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelectChat(conv.id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800/40 active:bg-zinc-800/60 transition-all mb-0.5 text-left"
          >
            <Avatar initials={conv.contact.initials} color={conv.contact.color} size="md" online={conv.contact.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-white truncate">{conv.contact.name}</span>
                <span className="text-[10px] text-zinc-600 shrink-0 ml-1">{conv.lastMsg.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate ${conv.unread > 0 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {conv.lastMsg.from === 'me' && <span className="text-zinc-600">You: </span>}
                  {conv.lastMsg.text}
                </p>
                {conv.unread > 0 && (
                  <span className="ml-2 shrink-0 w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-medium">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Empty/placeholder right panel (desktop only) ──────────────── */
function EmptyState() {
  return (
    <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#09090b]">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <MessageSquare size={24} className="text-zinc-600" />
      </div>
      <p className="text-zinc-400 font-medium text-sm">Select a conversation</p>
      <p className="text-zinc-600 text-xs mt-1">Choose a chat from the list</p>
    </div>
  )
}

/* ─── Friend requests panel ──────────────────────────────────────── */
function RequestsPanel() {
  const [requests, setRequests] = useState(initialRequests)
  const accept = (id) => setRequests(r => r.filter(x => x.id !== id))
  const reject = (id) => setRequests(r => r.filter(x => x.id !== id))

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-h-0">
      <div className="px-4 md:px-8 pt-5 md:pt-8 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="md:hidden w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-base md:text-lg font-semibold text-white">Friend Requests</h2>
        </div>
        <p className="text-sm text-zinc-500">{requests.length} pending</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-5 space-y-3">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Users size={22} className="text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium text-sm">All caught up</p>
            <p className="text-zinc-600 text-xs mt-1">No pending requests</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="flex items-center gap-3 md:gap-4 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4 max-w-lg">
              <Avatar initials={req.initials} color={req.color} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{req.name}</p>
                <p className="text-xs text-zinc-500">@{req.username}</p>
                {req.mutualFriends > 0 && (
                  <p className="text-xs text-zinc-600 mt-0.5">{req.mutualFriends} mutual {req.mutualFriends === 1 ? 'friend' : 'friends'}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => reject(req.id)}
                  className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-xl md:rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center"
                >
                  <span className="hidden md:inline">Decline</span>
                  <X size={15} className="md:hidden" />
                </button>
                <button
                  onClick={() => accept(req.id)}
                  className="w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-xl md:rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all flex items-center justify-center"
                >
                  <span className="hidden md:inline">Accept</span>
                  <Check size={15} className="md:hidden" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Settings panel ─────────────────────────────────────────────── */
function SettingsPanel() {
  return (
    <div className="flex-1 flex flex-col bg-[#09090b] min-h-0">
      <div className="px-4 md:px-8 pt-5 md:pt-8 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="md:hidden w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-base md:text-lg font-semibold text-white">Settings</h2>
        </div>
        <p className="text-sm text-zinc-500">Manage your account</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-6">
        <div className="max-w-md">
          <div className="flex items-center gap-4 mb-8 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4">
            <Avatar initials="AK" size="xl" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold">Alex Kim</p>
              <p className="text-zinc-500 text-sm">@alexkim</p>
            </div>
            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors shrink-0">Edit</button>
          </div>

          {[
            { label: 'Notifications', desc: 'Manage push notifications' },
            { label: 'Privacy', desc: 'Who can send you requests' },
            { label: 'Blocked users', desc: 'Manage blocked accounts' },
            { label: 'Sign out', desc: 'Log out of your account', danger: true },
          ].map(item => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between py-4 border-b border-zinc-800/60 text-left group"
            >
              <div>
                <p className={`text-sm font-medium ${item.danger ? 'text-rose-400' : 'text-white'}`}>{item.label}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Home ──────────────────────────────────────────────────── */
export default function Home() {
  const [activeSection, setActiveSection] = useState('chats')
  const navigate = useNavigate()

  const handleSelectChat = (id) => navigate(`/chat/${id}`)

  return (
    <div className="h-screen flex flex-col bg-[#09090b] overflow-hidden">
      {/* Main row */}
      <div className="flex flex-1 min-h-0">
        <DesktopSidebar active={activeSection} setActive={setActiveSection} />

        {/* Content area */}
        <div className="flex flex-1 min-w-0 min-h-0">
          {activeSection === 'chats' && (
            <>
              <ChatListPanel onSelectChat={handleSelectChat} />
              <EmptyState />
            </>
          )}
          {activeSection === 'requests' && <RequestsPanel />}
          {activeSection === 'settings' && <SettingsPanel />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileTabBar active={activeSection} setActive={setActiveSection} />
    </div>
  )
}
