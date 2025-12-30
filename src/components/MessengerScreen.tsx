import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { User } from '@/pages/Index';
import { toast } from 'sonner';

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
};

type Chat = {
  id: string;
  user: User;
  messages: Message[];
  lastMessage?: string;
  unread?: number;
};

type MessengerScreenProps = {
  user: User;
  onLogout: () => void;
};

const MessengerScreen = ({ user, onLogout }: MessengerScreenProps) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [editedUser, setEditedUser] = useState(user);
  
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      user: { username: '@anna_k', firstName: 'Анна', lastName: 'Ковалёва', email: 'anna@example.com' },
      messages: [
        { id: '1', text: 'Привет! Как дела?', sender: '@anna_k', time: '14:23' },
        { id: '2', text: 'Всё отлично, спасибо!', sender: user.username, time: '14:25' },
      ],
      lastMessage: 'Всё отлично, спасибо!',
      unread: 0,
    },
    {
      id: '2',
      user: { username: '@dmitry', firstName: 'Дмитрий', email: 'dmitry@example.com' },
      messages: [
        { id: '1', text: 'Когда встречаемся?', sender: '@dmitry', time: '12:45' },
      ],
      lastMessage: 'Когда встречаемся?',
      unread: 2,
    },
  ]);

  const currentChat = chats.find((c) => c.id === activeChat);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success('Сообщение отправлено');
    setMessageText('');
  };

  const handleSaveProfile = () => {
    toast.success('Профиль обновлён');
  };

  const filteredChats = chats.filter((chat) =>
    chat.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-full md:w-96 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-xl font-bold">Spektr</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="User" size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Профиль</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="flex justify-center">
                  <Avatar className="w-24 h-24 bg-primary text-3xl">
                    <AvatarFallback>{editedUser.firstName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={editedUser.username} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input
                    value={editedUser.lastName || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Почта</Label>
                  <Input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  Сохранить
                </Button>
                <Button onClick={onLogout} variant="destructive" className="w-full">
                  Выйти
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по @username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                  activeChat === chat.id ? 'bg-muted' : ''
                }`}
              >
                <Avatar className="w-12 h-12 bg-primary">
                  <AvatarFallback>{chat.user.firstName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{chat.user.firstName}</span>
                    {chat.unread ? (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar className="w-10 h-10 bg-primary cursor-pointer" onClick={() => {
                toast.info(`${currentChat.user.firstName} ${currentChat.user.lastName || ''}\n${currentChat.user.username}`);
              }}>
                <AvatarFallback>{currentChat.user.firstName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{currentChat.user.firstName} {currentChat.user.lastName}</h2>
                <p className="text-sm text-muted-foreground">{currentChat.user.username}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === user.username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender === user.username
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Написать сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="MessageCircle" size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">Выберите чат, чтобы начать общение</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerScreen;
