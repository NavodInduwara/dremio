import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Emotion = 'happy' | 'calm' | 'anxious' | 'mystery';

type Dream = {
  id: string;
  title: string;
  content: string;
  emotion: Emotion;
  date: string;
};

type User = {
  name: string;
  email: string;
  birthday: string;
  password: string;
};

const EMOTION_META: Record<Emotion, { icon: string; label: string; color: string }> = {
  happy: { icon: '🐶', label: 'Joyful energy', color: 'text-emerald-300' },
  calm: { icon: '🌙', label: 'Peaceful reflection', color: 'text-sky-300' },
  anxious: { icon: '⚡', label: 'Stress processing', color: 'text-amber-300' },
  mystery: { icon: '🔮', label: 'Unclear symbolism', color: 'text-violet-300' },
};

const seedDreams: Dream[] = [
  {
    id: '1',
    title: 'Flying over ocean',
    content: 'I was floating above a bright blue ocean and smiling the whole time.',
    emotion: 'happy',
    date: '2026-02-10',
  },
  {
    id: '2',
    title: 'Lost in hallway',
    content: 'I kept opening doors but every room looked the same and I felt nervous.',
    emotion: 'anxious',
    date: '2026-02-07',
  },
  {
    id: '3',
    title: 'Tea with grandmother',
    content: 'We sat together in a peaceful garden and watched birds in silence.',
    emotion: 'calm',
    date: '2026-02-05',
  },
];

const getDreamEmotion = (text: string): Emotion => {
  const value = text.toLowerCase();
  if (value.match(/smile|happy|dog|sun|flying|laugh/)) return 'happy';
  if (value.match(/peace|calm|water|moon|garden|rest/)) return 'calm';
  if (value.match(/fear|lost|chase|fall|panic|dark/)) return 'anxious';
  return 'mystery';
};

const buildInterpretation = (emotion: Emotion) => {
  switch (emotion) {
    case 'happy':
      return 'Your dream reflects optimism and emotional connection. The dog symbol points to loyalty, friendship, and playful confidence.';
    case 'calm':
      return 'Your mind is searching for balance. This dream suggests recovery, grounding, and trust in your own pace.';
    case 'anxious':
      return 'This dream may be processing unresolved pressure. Repetition and urgency symbols often appear when boundaries need attention.';
    default:
      return 'The dream uses abstract symbols. Journaling repeated details can reveal hidden patterns over time.';
  }
};

const App = () => {
  const [view, setView] = useState<'signin' | 'signup' | 'analysis' | 'history' | 'profile'>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [dreams, setDreams] = useState<Dream[]>(seedDreams);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [authForm, setAuthForm] = useState({
    name: '',
    email: 'demo@email.com',
    password: '',
    birthday: '',
  });

  const [dreamInput, setDreamInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{ emotion: Emotion; text: string } | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');

  const selectedDreams = useMemo(() => dreams.filter((dream) => selectedIds.includes(dream.id)), [dreams, selectedIds]);

  const handleSignIn = () => {
    if (!authForm.email || !authForm.password) return;
    const nextUser: User = {
      name: authForm.name || 'Dreamer',
      email: authForm.email,
      birthday: authForm.birthday || '2000-01-01',
      password: authForm.password,
    };
    setUser(nextUser);
    setProfileName(nextUser.name);
    setView('analysis');
  };

  const handleSignUp = () => {
    if (!authForm.name || !authForm.email || !authForm.password || !authForm.birthday) return;
    handleSignIn();
  };

  const onAnalyzeDream = () => {
    if (!dreamInput.trim()) return;
    const emotion = getDreamEmotion(dreamInput);
    const newDream: Dream = {
      id: Date.now().toString(),
      title: `Dream #${dreams.length + 1}`,
      content: dreamInput,
      emotion,
      date: new Date().toISOString().slice(0, 10),
    };
    setDreams([newDream, ...dreams]);
    setAnalysisResult({ emotion, text: buildInterpretation(emotion) });
    setDreamInput('');
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const deleteDream = (id: string) => {
    setDreams((prev) => prev.filter((dream) => dream.id !== id));
    setSelectedIds((prev) => prev.filter((value) => value !== id));
  };

  const bulkSummary = useMemo(() => {
    if (!selectedDreams.length) return null;
    const emotions = selectedDreams.map((dream) => dream.emotion);
    const counts = emotions.reduce<Record<string, number>>((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Emotion;
    return {
      dominant,
      past: 'Past: recurring symbols indicate unresolved memories and relationship themes.',
      present: `Present: your dominant emotional pattern is ${EMOTION_META[dominant].label.toLowerCase()}.`,
      future: 'Future: with reflection and consistency, your dreams suggest emotional clarity ahead.',
    };
  }, [selectedDreams]);

  const saveProfile = () => {
    if (!user) return;
    setUser({ ...user, name: profileName || user.name, password: profilePassword || user.password });
    setProfilePassword('');
  };

  const AuthHeader = ({ title }: { title: string }) => (
    <View className="mb-8 mt-4 items-center">
      <Text className="text-4xl font-bold text-white">Dreamio</Text>
      <Text className="mt-2 text-base text-violet-200">{title}</Text>
    </View>
  );

  const Input = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
  }: {
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    secureTextEntry?: boolean;
  }) => (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#C4B5FD"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      className="mb-4 rounded-xl border border-violet-300/30 bg-violet-950/50 px-4 py-3 text-white"
    />
  );

  if (!user && (view === 'signin' || view === 'signup')) {
    return (
      <SafeAreaView className="flex-1 bg-[#110B2E]">
        <StatusBar barStyle="light-content" />
        <ScrollView className="flex-1 px-6">
          <AuthHeader title={view === 'signin' ? 'Welcome back' : 'Create your account'} />
          {view === 'signup' && (
            <Input
              placeholder="Name"
              value={authForm.name}
              onChangeText={(value) => setAuthForm((prev) => ({ ...prev, name: value }))}
            />
          )}
          <Input
            placeholder="Email"
            value={authForm.email}
            onChangeText={(value) => setAuthForm((prev) => ({ ...prev, email: value }))}
          />
          <Input
            placeholder="Password"
            value={authForm.password}
            secureTextEntry
            onChangeText={(value) => setAuthForm((prev) => ({ ...prev, password: value }))}
          />
          {view === 'signup' && (
            <Input
              placeholder="Birthday (YYYY-MM-DD)"
              value={authForm.birthday}
              onChangeText={(value) => setAuthForm((prev) => ({ ...prev, birthday: value }))}
            />
          )}

          <TouchableOpacity
            onPress={view === 'signin' ? handleSignIn : handleSignUp}
            className="mb-4 rounded-xl bg-violet-500 py-4"
          >
            <Text className="text-center text-base font-semibold text-white">
              {view === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="mb-3 rounded-xl border border-white/30 bg-white py-3">
            <Text className="text-center font-semibold text-slate-800">Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mb-8 rounded-xl border border-white/30 bg-white py-3">
            <Text className="text-center font-semibold text-slate-800">Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setView(view === 'signin' ? 'signup' : 'signin')}>
            <Text className="text-center text-violet-200">
              {view === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0E0A22]">
      <StatusBar barStyle="light-content" />
      <View className="flex-row items-center justify-around border-b border-violet-300/20 py-3">
        {['analysis', 'history', 'profile'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setView(tab as 'analysis' | 'history' | 'profile')}>
            <Text className={`font-semibold ${view === tab ? 'text-violet-300' : 'text-violet-100'}`}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'analysis' && (
        <ScrollView className="p-5">
          <Text className="mb-2 text-3xl font-bold text-white">Dream Analysis</Text>
          <Text className="mb-4 text-violet-200">Write your dream and get a symbolic interpretation.</Text>

          <TextInput
            multiline
            numberOfLines={6}
            value={dreamInput}
            onChangeText={setDreamInput}
            placeholder="Type your dream here..."
            placeholderTextColor="#C4B5FD"
            className="min-h-[140px] rounded-2xl border border-violet-300/30 bg-violet-950/40 p-4 align-top text-white"
          />

          <TouchableOpacity onPress={onAnalyzeDream} className="mt-4 rounded-xl bg-violet-500 py-4">
            <Text className="text-center text-base font-semibold text-white">Get Results</Text>
          </TouchableOpacity>

          {analysisResult && (
            <View className="mt-5 rounded-2xl border border-violet-300/25 bg-violet-900/40 p-4">
              <Text className="text-4xl">{EMOTION_META[analysisResult.emotion].icon}</Text>
              <Text className={`mt-2 text-xl font-semibold ${EMOTION_META[analysisResult.emotion].color}`}>
                {EMOTION_META[analysisResult.emotion].label}
              </Text>
              <Text className="mt-2 leading-6 text-violet-50">{analysisResult.text}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {view === 'history' && (
        <ScrollView className="p-5">
          <Text className="mb-2 text-3xl font-bold text-white">Dream History</Text>
          <Text className="mb-4 text-violet-200">Select multiple dreams to generate a pattern summary.</Text>

          {dreams.map((dream) => (
            <TouchableOpacity
              key={dream.id}
              onPress={() => toggleSelection(dream.id)}
              className={`mb-3 rounded-2xl border p-4 ${
                selectedIds.includes(dream.id)
                  ? 'border-violet-300 bg-violet-700/40'
                  : 'border-violet-300/25 bg-violet-900/30'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="text-lg font-semibold text-white">{dream.title}</Text>
                  <Text className="mb-1 text-violet-200">{dream.date}</Text>
                  <Text className="text-violet-50">{dream.content}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-2xl">{EMOTION_META[dream.emotion].icon}</Text>
                  <TouchableOpacity onPress={() => deleteDream(dream.id)}>
                    <Text className="mt-3 text-xs font-semibold text-rose-300">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {bulkSummary && (
            <View className="mt-2 rounded-2xl border border-violet-300/25 bg-violet-800/40 p-4">
              <Text className="text-xl font-bold text-white">Bulk Analysis Summary</Text>
              <Text className="mt-2 text-violet-100">Dominant emotion: {EMOTION_META[bulkSummary.dominant].label}</Text>
              <Text className="mt-2 text-violet-50">{bulkSummary.past}</Text>
              <Text className="mt-2 text-violet-50">{bulkSummary.present}</Text>
              <Text className="mt-2 text-violet-50">{bulkSummary.future}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {view === 'profile' && (
        <ScrollView className="p-5">
          <Text className="mb-2 text-3xl font-bold text-white">Profile</Text>
          <Text className="mb-4 text-violet-200">Update your account details securely.</Text>

          <Input placeholder="Name" value={profileName} onChangeText={setProfileName} />
          <Input placeholder="Email" value={user?.email ?? ''} onChangeText={() => {}} />
          <Input placeholder="Birthday" value={user?.birthday ?? ''} onChangeText={() => {}} />
          <Input
            placeholder="New Password"
            value={profilePassword}
            secureTextEntry
            onChangeText={setProfilePassword}
          />

          <TouchableOpacity onPress={saveProfile} className="rounded-xl bg-violet-500 py-4">
            <Text className="text-center text-base font-semibold text-white">Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default App;
