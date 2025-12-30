import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { User } from '@/pages/Index';

type Message = {
  id: number;
  text: string;
  sender_id: number;
  username: string;
  first_name: string;
  avatar_url?: string;
  created_at: string;
};

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('spektr_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (chatId && user) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, user]);

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      const response = await api.getMessages(Number(chatId));
      if (response.messages) {
        setMessages(response.messages);
        if (response.messages.length > 0 && user) {
          const other = response.messages.find((m: Message) => m.sender_id !== user.id);
          if (other) {
            setOtherUser({
              id: other.sender_id,
              username: other.username,
              first_name: other.first_name,
              avatar_url: other.avatar_url,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId || !user) return;
    
    setLoading(true);
    try {
      const response = await api.sendMessage(Number(chatId), user.id, messageText);
      if (response.id) {
        setMessageText('');
        loadMessages();
      }
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user || !otherUser) return;
    
    try {
      await api.blockUser(user.id, otherUser.id);
      toast.success('Пользователь заблокирован');
      navigate('/');
    } catch (error) {
      toast.error('Ошибка блокировки');
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        {otherUser && (
          <>
            <Avatar className="w-10 h-10 bg-primary">
              {otherUser.avatar_url ? <AvatarImage src={otherUser.avatar_url} /> : null}
              <AvatarFallback>{otherUser.first_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">{otherUser.first_name}</h2>
              <p className="text-sm text-muted-foreground">{otherUser.username}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleBlock}>
              <Icon name="Ban" size={20} />
            </Button>
          </>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender_id === user.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </span>
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
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={loading} size="icon">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
