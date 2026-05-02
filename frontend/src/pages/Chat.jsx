import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Send, Phone, Video, MoreHorizontal,
  Smile, Paperclip, Zap, MessageSquare, Users, Settings, Search, UserPlus
} from 'lucide-react'
import Avatar from '../components/Avatar'
import { contacts, conversations, friendRequests, currentUser } from '../data/mockData'


function DesktopSidebar() {
  const navigate = useNavigate()
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
            onClick={() => navigate('/home')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative
              ${id === 'chats' ? 'bg-violet-600/20 text-violet-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
            <Icon size={18} />
            {id === 'requests' && friendRequests.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500" />
            )}
          </button>
        ))}
      </div>
      <Avatar initials={currentUser.initials} size="sm" />
    </aside>
  )
}


function DesktopChatList({ selectedId }) {
  const navigate = useNavigate()

  const enriched = conversations.map(c => ({
    ...c,
    contact: contacts.find(x => x.id === c.contactId),
    lastMsg: c.messages[c.messages.length - 1],
  }))

  return (
    <div className="hidden lg:flex flex-col w-72 border-r border-zinc-800/60 bg-[#0d0d10] shrink-0 min-h-0">
      <div className="px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-base font-semibold text-white mb-3">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {enriched.map(conv => (
          <button
            key={conv.id}
            onClick={() => navigate(`/chat/${conv.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-0.5 text-left
              ${selectedId === conv.id ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/40'}`}
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


function MessageBubble({ msg, contact, isMe, showAvatar }) {
  return (
    <div className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <div className={`w-6 shrink-0 ${showAvatar ? '' : 'invisible'}`}>
          <Avatar initials={contact.initials} color={contact.color} size="sm" />
        </div>
      )}
      <div className={`max-w-[78%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isMe
              ? 'bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-br-sm'
              : 'bg-zinc-800/80 text-zinc-100 rounded-bl-sm'
            }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-zinc-600 mt-1 mx-1">{msg.time}</span>
      </div>
    </div>
  )
}


export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState(null)
  const bottomRef = useRef(null)

  const conv = conversations.find(c => c.id === id)
  const contact = conv ? contacts.find(c => c.id === conv.contactId) : null

  useEffect(() => {
    if (conv) setMsgs([...conv.messages])
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg = {
      id: `m${Date.now()}`,
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
    setMsgs(prev => [...prev, newMsg])
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!conv || !contact) return null

  return (
    <div className="h-screen flex bg-[#09090b] overflow-hidden">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Desktop chat list */}
      <DesktopChatList selectedId={id} />

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 md:px-6 py-3 md:py-4 border-b border-zinc-800/60 bg-[#0d0d10] shrink-0">
          {/* Back button — mobile only */}
          <button
            onClick={() => navigate('/home')}
            className="md:hidden w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 flex items-center justify-center transition-all shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <Avatar initials={contact.initials} color={contact.color} size="md" online={contact.online} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
            <p className="text-xs text-zinc-500">
              {contact.online
                ? <span className="text-emerald-400">● Online</span>
                : `Last seen ${contact.lastSeen}`}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button className="w-9 h-9 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 flex items-center justify-center transition-all">
              <Phone size={17} />
            </button>
            <button className="hidden sm:flex w-9 h-9 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 items-center justify-center transition-all">
              <Video size={17} />
            </button>
            <button className="w-9 h-9 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 flex items-center justify-center transition-all">
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-5 space-y-0.5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-800/60" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Today</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {msgs && msgs.map((msg, i) => {
            const isMe = msg.from === 'me'
            const nextMsg = msgs[i + 1]
            const showAvatar = !nextMsg || nextMsg.from !== msg.from
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                contact={contact}
                isMe={isMe}
                showAvatar={showAvatar}
              />
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-zinc-800/60 bg-[#0d0d10] shrink-0">
          <div className="flex items-center gap-2 md:gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 md:px-4 py-2.5 md:py-3 focus-within:border-violet-500/50 transition-all">
            <button className="hidden sm:block text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
              <Paperclip size={17} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message ${contact.name.split(' ')[0]}...`}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none min-w-0"
            />
            <button className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
              <Smile size={17} />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                ${input.trim()
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/20'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
            >
              <Send size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
