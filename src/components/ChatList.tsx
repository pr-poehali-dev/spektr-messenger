import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { translations, type Language, type Theme } from '@/lib/i18n';
import type { User } from '@/pages/Index';
import { toast } from 'sonner';

type Chat = {
  chat_id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  last_message?: string;
};

type ChatListProps = {
  user: User;
  onLogout: () => void;
  onChatSelect: (chatId: number) => void;
  onUserUpdate: (user: User) => void;
};

const ChatList = ({ user, onLogout, onChatSelect, onUserUpdate }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const t = translations[user.language || 'ru'];

  useEffect(() => {
    loadChats();
  }, [user.id]);

  useEffect(() => {
    if (search.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [search]);

  const loadChats = async () => {
    try {
      const response = await api.getChats(user.id);
      if (response.chats) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    try {
      const response = await api.searchUsers(search, user.id);
      if (response.users) {
        setSearchResults(response.users);
        setShowSearch(true);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleUserClick = async (foundUser: any) => {
    try {
      const response = await api.createChat(user.id, foundUser.id);
      if (response.chatId) {
        onChatSelect(response.chatId);
      }
    } catch (error) {
      toast.error('Ошибка создания чата');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) return;
        
        const response = await api.uploadAvatar(base64, file.type);
        if (response.url) {
          setEditedUser({ ...editedUser, avatar_url: response.url });
          toast.success('Аватар загружен!');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Ошибка загрузки аватара');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updates: any = {};
      if (editedUser.username !== user.username) updates.username = editedUser.username;
      if (editedUser.first_name !== user.first_name) updates.firstName = editedUser.first_name;
      if (editedUser.last_name !== user.last_name) updates.lastName = editedUser.last_name;
      if (editedUser.email !== user.email) updates.email = editedUser.email;
      if (editedUser.avatar_url !== user.avatar_url) updates.avatarUrl = editedUser.avatar_url;
      if (editedUser.language !== user.language) updates.language = editedUser.language;
      if (editedUser.theme !== user.theme) updates.theme = editedUser.theme;
      
      const response = await api.updateUser(user.id, updates);
      if (response.user) {
        onUserUpdate(response.user);
        localStorage.setItem('spektr_user', JSON.stringify(response.user));
        document.documentElement.setAttribute('data-theme', response.user.theme);
        toast.success(t.save);
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://cdn.poehali.dev/files/20251231_125751.png" 
            alt="Spektr"
            className="w-10 h-10 object-contain"
          />
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
              <SheetTitle>{t.profile}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <Avatar className="w-24 h-24 bg-primary text-3xl">
                    {editedUser.avatar_url ? (
                      <AvatarImage src={editedUser.avatar_url} />
                    ) : null}
                    <AvatarFallback>{editedUser.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <label>
                  {t.uploadAvatar}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </Button>
              <div className="space-y-2">
                <Label>{t.username}</Label>
                <Input
                  value={editedUser.username}
                  onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.firstName}</Label>
                <Input
                  value={editedUser.first_name}
                  onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.lastName}</Label>
                <Input
                  value={editedUser.last_name || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.email}</Label>
                <Input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.theme}</Label>
                <Select value={editedUser.theme} onValueChange={(v) => setEditedUser({ ...editedUser, theme: v as Theme })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.themes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.language}</Label>
                <Select value={editedUser.language} onValueChange={(v) => setEditedUser({ ...editedUser, language: v as Language })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                {loading ? 'Загрузка...' : t.save}
              </Button>
              <Button onClick={onLogout} variant="destructive" className="w-full">
                {t.logout}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="p-4 border-b border-border">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {showSearch && searchResults.length > 0 ? (
            searchResults.map((foundUser) => (
              <button
                key={foundUser.id}
                onClick={() => handleUserClick(foundUser)}
                className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-12 h-12 bg-primary">
                  {foundUser.avatar_url ? <AvatarImage src={foundUser.avatar_url} /> : null}
                  <AvatarFallback>{foundUser.first_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{foundUser.first_name} {foundUser.last_name || ''}</div>
                  <p className="text-sm text-muted-foreground">{foundUser.username}</p>
                </div>
              </button>
            ))
          ) : showSearch ? (
            <p className="text-center text-muted-foreground p-4">Пользователи не найдены</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.chat_id}
                onClick={() => onChatSelect(chat.chat_id)}
                className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-12 h-12 bg-primary">
                  {chat.avatar_url ? <AvatarImage src={chat.avatar_url} /> : null}
                  <AvatarFallback>{chat.first_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{chat.first_name} {chat.last_name || ''}</div>
                  <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Нет сообщений'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
