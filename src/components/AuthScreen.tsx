import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { User } from '@/pages/Index';

type AuthScreenProps = {
  onAuth: (user: User) => void;
};

type AuthMode = 'login' | 'register';

const AuthScreen = ({ onAuth }: AuthScreenProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Добро пожаловать в Spektr!');
        onAuth(response.user);
      }
    } catch (error) {
      toast.error('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username || !firstName) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.register(username, email, password, firstName, lastName);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Регистрация успешна!');
        onAuth(response.user);
      }
    } catch (error) {
      toast.error('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="https://cdn.poehali.dev/files/20251231_125751.png" 
              alt="Spektr"
              className="w-32 h-auto"
            />
          </div>
          <CardTitle className="text-3xl">Spektr</CardTitle>
          <CardDescription>
            {mode === 'register' ? 'Создайте аккаунт' : 'Войдите в аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'register' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Почта *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleRegister} disabled={loading} className="w-full" size="lg">
                {loading ? 'Загрузка...' : 'Зарегистрироваться'}
              </Button>
              <Button onClick={() => setMode('login')} variant="ghost" className="w-full">
                Уже есть аккаунт? Войти
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Почта</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Пароль</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full" size="lg">
                {loading ? 'Загрузка...' : 'Войти'}
              </Button>
              <Button onClick={() => setMode('register')} variant="ghost" className="w-full">
                Нет аккаунта? Зарегистрироваться
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
