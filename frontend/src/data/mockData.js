export const currentUser = {
  id: 'me',
  name: 'Alex Kim',
  username: 'alexkim',
  avatar: null,
  initials: 'AK',
}

export const contacts = [
  { id: '1', name: 'Jordan Lee', username: 'jordanlee', initials: 'JL', color: 'from-violet-500 to-purple-600', online: true, lastSeen: 'now' },
  { id: '2', name: 'Sam Rivera', username: 'samrivera', initials: 'SR', color: 'from-pink-500 to-rose-600', online: true, lastSeen: 'now' },
  { id: '3', name: 'Taylor Morgan', username: 'taylorm', initials: 'TM', color: 'from-sky-500 to-blue-600', online: false, lastSeen: '2m ago' },
  { id: '4', name: 'Casey Quinn', username: 'caseyq', initials: 'CQ', color: 'from-emerald-500 to-teal-600', online: false, lastSeen: '1h ago' },
  { id: '5', name: 'Riley Park', username: 'rileyp', initials: 'RP', color: 'from-amber-500 to-orange-600', online: true, lastSeen: 'now' },
  { id: '6', name: 'Avery Chen', username: 'averyc', initials: 'AC', color: 'from-fuchsia-500 to-violet-600', online: false, lastSeen: '3h ago' },
]

export const friendRequests = [
  { id: 'r1', name: 'Morgan Blake', username: 'morganblake', initials: 'MB', color: 'from-indigo-500 to-violet-600', mutualFriends: 3, time: '2h ago' },
  { id: 'r2', name: 'Drew Hansen', username: 'drewhansen', initials: 'DH', color: 'from-rose-500 to-pink-600', mutualFriends: 1, time: '5h ago' },
  { id: 'r3', name: 'Skyler Wu', username: 'skylerwu', initials: 'SW', color: 'from-cyan-500 to-sky-600', mutualFriends: 0, time: '1d ago' },
]

export const conversations = [
  {
    id: '1',
    contactId: '1',
    messages: [
      { id: 'm1', from: '1', text: 'hey! you free tonight?', time: '6:40 PM', read: true },
      { id: 'm2', from: 'me', text: 'yeah what\'s up?', time: '6:41 PM', read: true },
      { id: 'm3', from: '1', text: 'thinking of grabbing dinner, wanna join?', time: '6:41 PM', read: true },
      { id: 'm4', from: 'me', text: 'sounds good! where?', time: '6:43 PM', read: true },
      { id: 'm5', from: '1', text: 'maybe that ramen place on 5th', time: '6:44 PM', read: false },
    ],
    unread: 1,
  },
  {
    id: '2',
    contactId: '2',
    messages: [
      { id: 'm1', from: 'me', text: 'did you finish the project?', time: '2:10 PM', read: true },
      { id: 'm2', from: '2', text: 'almost! just the last part', time: '2:15 PM', read: true },
      { id: 'm3', from: '2', text: 'should be done by tomorrow', time: '2:15 PM', read: true },
    ],
    unread: 0,
  },
  {
    id: '3',
    contactId: '3',
    messages: [
      { id: 'm1', from: '3', text: 'check this out 👀', time: 'Yesterday', read: true },
      { id: 'm2', from: 'me', text: 'oh wow that\'s cool', time: 'Yesterday', read: true },
    ],
    unread: 0,
  },
  {
    id: '4',
    contactId: '5',
    messages: [
      { id: 'm1', from: '5', text: 'yo', time: 'Mon', read: false },
      { id: 'm2', from: '5', text: 'you there?', time: 'Mon', read: false },
    ],
    unread: 2,
  },
]
