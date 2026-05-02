# Mobile Component Specs — React Native + Expo

> Passo 4B do StackAdapter. Stack: React Native + Expo (managed workflow) + TypeScript.
> Navegação: Expo Router (file-based, mesma filosofia do Next.js App Router).
> Todos os elementos interativos ≥ 44px de touch area (regra inegociável).

---

## Configuração base

### Tokens — `src/constants/tokens.ts`
```typescript
export const tokens = {
  // Cores
  colorPrimary:      '#1A6B74',
  colorPrimaryHover: '#145760',
  colorPrimaryMuted: '#E0F2F4',
  colorAccent:       '#D95F3B',
  colorAccentHover:  '#BA4E2F',
  colorAccentMuted:  '#FDEEE9',
  colorSuccess:      '#15803D',
  colorWarning:      '#B45309',
  colorError:        '#B91C1C',
  colorInfo:         '#1D4ED8',

  // Espaçamento
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 40,
  spacing2xl: 64,

  // Border radius
  radiusSm:   4,
  radiusMd:   6,
  radiusLg:   12,
  radiusXl:   20,
  radiusFull: 9999,

  // Tipografia
  fontHeading: 'PlusJakartaSans_700Bold',
  fontBody:    'DMSans_400Regular',
  fontMono:    'DMMono_400Regular',

  // Touch mínimo (nunca violar)
  touchMin: 44,

  // Springs (Reanimated)
  springSnappy: { damping: 20, stiffness: 300, mass: 0.8 },
  springModal:  { damping: 26, stiffness: 200, mass: 1 },
  springBounce: { damping: 12, stiffness: 180, mass: 1 },
  springMicro:  { damping: 30, stiffness: 400, mass: 0.5 },
} as const

export const tokensProfLight = {
  colorSurface:       '#F8FAFC',
  colorSurfaceRaised: '#F1F5F9',
  colorText:          '#0F172A',
  colorTextMuted:     '#64748B',
  colorBorder:        '#E2E8F0',
}

export const tokensProfDark = {
  colorSurface:        '#0D1117',
  colorSurfaceRaised:  '#161B22',
  colorSurfaceElevated:'#21262D',
  colorText:           '#E6EDF3',
  colorTextMuted:      '#8B949E',
  colorBorder:         '#30363D',
}

export const tokensPai = {
  colorSurface:       '#FFFBF5',
  colorSurfaceRaised: '#FFF8EE',
  colorText:          '#1C1917',
  colorTextMuted:     '#78716C',
  colorBorder:        '#E7E5E4',
  gradientCardMorning:   ['#FFF9F0', '#F0F9FF'] as const,
  gradientCardAfternoon: ['#FFF9F0', '#F5F0FF'] as const,
  gradientCardEvening:   ['#FFF5F0', '#FFF9F0'] as const,
  gradientCelebration:   ['#FDEEE9', '#E0F2F4'] as const,
}
```

### Estrutura de navegação — Expo Router
```
src/app/
  _layout.tsx                  → root layout, fonts, ThemeProvider
  (auth)/
    _layout.tsx                → Stack sem header
    splash.tsx                 → P1 / M1
    login.tsx                  → P3 / M4
    cadastro/
      _layout.tsx              → Stack
      step-1.tsx               → P2/M3 step 1
      step-2.tsx               → P2/M3 step 2
      step-3.tsx               → P2/M3 step 3
    lgpd.tsx                   → M5
    esqueci-senha.tsx          → P17 / M19
    convite/[token].tsx        → M2
  (professor)/
    _layout.tsx                → Tab navigator (Dashboard/Agenda/Config)
    index.tsx                  → P4 Dashboard
    aluno/[id].tsx             → P7 Perfil aluno
    historico/index.tsx        → P8 Histórico
    aula/[id].tsx              → P9 Detalhe aula
    configuracoes/index.tsx    → P11 Configurações
    perfil/editar.tsx          → P12 Editar perfil
    aluno/cadastrar.tsx        → P13 Cadastrar aluno
    aluno/[id]/editar.tsx      → P13 Editar aluno
  (pai)/
    _layout.tsx                → Tab navigator (Feed/Filho/Notificações/Perfil)
    index.tsx                  → M6 Feed
    filho/[id].tsx             → M8 Perfil filho
    aula/[id].tsx              → M7 Detalhe aula
    notificacoes/index.tsx     → M9 Notificações
    configuracoes/index.tsx    → M13 Configurações
    perfil/editar.tsx          → M14 Editar perfil
    assinatura/index.tsx       → M10 Paywall
    assinatura/cartao.tsx      → M11 Cartão
    assinatura/confirmacao.tsx → M12 Confirmação pagamento
```

---

## Componentes Compartilhados

### `Button`
```typescript
// src/components/ui/Button.tsx
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'fab'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onPress: () => void
  children: React.ReactNode
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'none'  // default: 'light'
}

// Todos os botões: minHeight=44, minWidth=44 (touch mínimo)
// loading: ActivityIndicator branco no lugar do texto, botão não-interativo
// haptic: expo-haptics no onPress (iOS: ImpactFeedbackStyle, Android: HapticFeedbackTypes)
// FAB: position absolute, bottom=88 (acima da TabBar), right=20
//      shadow: { shadowColor: '#1A6B74', shadowOffset: {width:0,height:4}, shadowOpacity:0.4, shadowRadius:8 }
//      elevation: 8 (Android)
```

### `Input`
```typescript
// src/components/ui/Input.tsx
import { View, TextInput, Text, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

interface InputProps {
  label: string
  type?: 'default' | 'email-address' | 'password' | 'phone-pad' | 'numeric'
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number       // exibe contador se presente
  autoFocus?: boolean
  editable?: boolean
  returnKeyType?: 'next' | 'done' | 'send'
  onSubmitEditing?: () => void
  ref?: React.Ref<TextInput>
}

// Focus state: borderColor animado (withSpring modal) para colorBorderFocus
// Error state: borderColor colorError + mensagem abaixo text-caption
// Counter: Text right-aligned, cor: muted → warning → error conforme percentual
// iOS: secureTextEntry para password; Android: idem
// minHeight multiline: lines * 24 + padding
```

### `Card`
```typescript
// src/components/ui/Card.tsx
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'aula' | 'aula-gradient' | 'skeleton'
  gradientVariant?: 'morning' | 'afternoon' | 'evening' | 'celebration'
  radius?: 'lg' | 'xl'
  padding?: number
  children: React.ReactNode
  style?: object
}

// aula-gradient: usa LinearGradient com cores de tokensPai
// shadow (iOS): shadowColor + shadowOpacity + shadowRadius
// elevation (Android): elevation prop numérico
// default: elevation=1, elevated: elevation=4
```

### `BottomSheet` — componente principal do P5
```typescript
// src/components/BottomSheet.tsx
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Animated, { withSpring } from 'react-native-reanimated'

interface RegistrarAulaBottomSheetProps {
  visible: boolean
  onClose: () => void
  onSuccess: (result: AulaRegistrada) => void
}

// snapPoints: ['92%'] — abre direto no máximo
// animationConfigs: springModal (damping=26, stiffness=200, mass=1)
// KeyboardAvoidingView: behavior='padding' no iOS, 'height' no Android
// Chip scroll horizontal para alunos e matérias
// Chips de duração: 45min / 1h / 1h30 / 2h
// Auto-focus: textarea após duração selecionada (useRef + focus())
// Coreografia pós-envio: 4200ms sequenciado (ver spec P5)
```

### `Chip`
```typescript
// src/components/ui/Chip.tsx
import { Pressable, Text, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
  variant?: 'default' | 'accent'   // accent=cor D95F3B para aluno selecionado
  disabled?: boolean
}

// minHeight=36, minWidth=44 (touch mínimo satisfeito pela largura mínima)
// scale animation: withSpring(selected ? 0.95 : 1, springMicro) no press
// selected default: bg colorPrimaryMuted, border colorPrimary, text colorPrimary
// selected accent: bg colorAccentMuted, border colorAccent, text colorAccent
// deselected: bg surface, border border, text textMuted
```

### `Toast`
```typescript
// src/components/ui/Toast.tsx
// Usa react-native-toast-message configurado no _layout.tsx raiz
// Posição: top (iOS) / bottom (Android) — convenção de cada plataforma
// Variantes: success (🟢) / error (🔴) / warning (🟡) / info (🔵)
// Auto-dismiss: 4000ms success, 6000ms error
// Configurar no _layout: <Toast config={toastConfig} />
```

### `StreakBadge`
```typescript
// src/components/StreakBadge.tsx
import Animated, { useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated'

interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  shouldPulse?: boolean   // true: dispara pulse animation uma vez
}

// Não renderiza se days < 2
// shouldPulse: scale 1→1.2→1 via withSpring bounce, disparado em t=800ms após POST /aulas
// sm: height=20 text-caption, md: height=28 text-body, lg: height=36 text-body-lg
// Ícone: 🔥 + days + " dias"
// bg: colorAccentMuted, border: colorAccent, text: colorAccent
```

### `CelebrationOverlay`
```typescript
// src/components/CelebrationOverlay.tsx
import { Modal, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import ConfettiCannon from 'react-native-confetti-cannon'  // ou expo-confetti

interface CelebrationOverlayProps {
  visible: boolean
  trigger: 'firstLesson' | 'tenthLesson' | 'firstParent'
  onDismiss: () => void
}

// Modal fullscreen com gradientCelebration + confetti
// Dispara confetti apenas nas 3 triggers explícitas (AP-11: sem gamification infantil)
// Auto-dismiss: 3500ms
// Haptic: expo-haptics notificationSuccess no mount
```

### `Avatar`
```typescript
// src/components/ui/Avatar.tsx
import { Image, View, Text, StyleSheet } from 'react-native'

interface AvatarProps {
  uri?: string
  name: string         // para inicial fallback
  role: 'professor' | 'pai' | 'filho' | 'placeholder'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }
// Se uri: Image com borderRadius=size/2
// Se sem uri: View com bg colorPrimaryMuted + Text inicial (nome[0].toUpperCase())
// Todos elementos touchables ao redor: minSize=44 (pad restante no container)
```

### `ProgressBar`
```typescript
// src/components/ui/ProgressBar.tsx
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface ProgressBarProps {
  progress: number      // 0–1
  variant?: 'default' | 'semanal' | 'por-materia'
  height?: number       // default: 6
  color?: string        // default: colorPrimary
  showLabel?: boolean
}

// Anima largura via withTiming(progress * maxWidth, { duration: 600 })
// Dispara animação no mount e quando progress muda
```

---

## Diferenças iOS vs Android por componente

| Componente | iOS | Android |
|---|---|---|
| Button loading | ActivityIndicator white | ActivityIndicator white |
| Button haptic | `ImpactFeedbackStyle.Light` | `HapticFeedbackTypes.impactLight` |
| BottomSheet drag | Smooth, nativo | `android_keyboardInputMode='adjustResize'` |
| Toast posição | Top (status bar aware) | Bottom (acima da nav bar) |
| Input focus | Keyboard avoids `padding` | Keyboard avoids `height` |
| StatusBar | `barStyle='dark-content'` (light bg) | `translucent={true}` |
| Safe Area | `useSafeAreaInsets()` top+bottom | Idem + nav bar extra |
| Haptic celebração | `ImpactFeedbackStyle.Heavy` | `HapticFeedbackTypes.notificationSuccess` |
| Push notification tap | `expo-notifications` foreground handler | Idem + `getLastNotificationResponseAsync` |
| Back button | Não existe | `useBackHandler` para fechar BottomSheet |

---

## Safe Area — Padrão obrigatório

```typescript
// Toda tela nova deve usar este padrão:
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function MyScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* conteúdo */}
    </View>
  )
}

// TabBar: paddingBottom = insets.bottom (nunca fixo)
// FAB: bottom = 88 + insets.bottom (acima da TabBar + safe area)
// BottomSheet: contentContainerStyle paddingBottom = insets.bottom + 24
```

---

## Push Notifications — Expo + FCM

```typescript
// src/lib/notifications.ts
import * as Notifications from 'expo-notifications'

// Configurar handler no _layout.tsx raiz:
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Registrar device token e enviar para API:
export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null
  const token = (await Notifications.getExpoPushTokenAsync()).data
  await fetch('/api/professor/push-token', { method: 'POST', body: JSON.stringify({ token }) })
  return token
}

// Deep link ao tocar na notificação:
// data.aula_id → router.push(`/(pai)/aula/${aula_id}`)
// Registrar listener no _layout: Notifications.addNotificationResponseReceivedListener
```

---

## Offline (Professor Mobile — expo-sqlite)

```typescript
// src/lib/offlineQueue.ts
import * as SQLite from 'expo-sqlite'
import * as TaskManager from 'expo-task-manager'

const db = SQLite.openDatabaseSync('liveaula.db')

// Schema:
// CREATE TABLE IF NOT EXISTS aulas_pendentes (
//   id TEXT PRIMARY KEY,
//   payload TEXT,  -- JSON stringify da aula
//   criado_em INTEGER,
//   tentativas INTEGER DEFAULT 0
// )

export async function saveAulaOffline(payload: AulaPayload): Promise<void>
export async function getPendingAulas(): Promise<AulaPendente[]>
export async function syncPendingAulas(): Promise<void>
  // Tenta POST /aulas para cada pendente, remove se 201, incrementa tentativas se erro

// Background sync:
TaskManager.defineTask('SYNC_AULAS', async () => {
  await syncPendingAulas()
  return TaskManager.BackgroundFetchResult.NewData
})

// Registrar no _layout: BackgroundFetch.registerTaskAsync('SYNC_AULAS', { minimumInterval: 300 })
```

---

## Telas com peculiaridades de implementação

### P5 — BottomSheet Registrar Aula — Coreografia completa
```typescript
// Após POST /aulas retornar 201:
const executeChoreografia = async (result: AulaRegistrada) => {
  // t=0: botão loading (já está)
  // t=200ms: haptic success
  await new Promise(r => setTimeout(r, 200))
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

  // t=300ms: fechar BottomSheet
  await new Promise(r => setTimeout(r, 100))
  bottomSheetRef.current?.close()

  // t=550ms: Toast
  await new Promise(r => setTimeout(r, 250))
  Toast.show({ type: 'success', text1: 'Aula registrada ✓' })

  // t=600ms: NotificationPreview
  await new Promise(r => setTimeout(r, 50))
  setShowNotificationPreview(true)

  // t=800ms: StreakBadge pulse + CelebrationOverlay
  await new Promise(r => setTimeout(r, 200))
  setStreakShouldPulse(true)
  if (result.is_first_lesson) setShowCelebration(true)

  // t=4200ms: auto-dismiss preview
  await new Promise(r => setTimeout(r, 3400))
  setShowNotificationPreview(false)
}
```

### M5 — LGPD Scroll Obrigatório
```typescript
// ScrollView com onScroll para detectar se chegou ao fim:
const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
  const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
  if (isAtBottom) setCanAccept(true)
}
// Checkbox: disabled={!canAccept}
// Botão Concordar: disabled={!canAccept || !checkboxChecked}
```

### M10 — Paywall (verificação antes de abrir Feed)
```typescript
// src/app/(pai)/_layout.tsx — verifica assinatura antes de qualquer tela pai
// Se status === 'expirado' → não redireciona (mostra paywall overlay sobre a tela atual)
// Se status === 'trial' e dias <= 3 → Banner no topo do Feed (não bloqueia)
// Implementação: Context de assinatura + hook useAssinatura()
```

---

## Componentes adicionados na v1.2 (telas Should-have)

> Adicionados em 2026-04-30 para cobrir P14, P15 (sem novo), M15, M16, M17.
> Mantêm convenções dos componentes v1.1: StyleSheet, sem libs novas, touch ≥44px, tokens via `tokens.ts`.

### `CalendarMonthGrid` — usado em P14

```typescript
// src/components/CalendarMonthGrid.tsx
type DayCell = { date: string; lessonCount: number };

interface CalendarMonthGridProps {
  monthDate: Date;            // primeiro dia do mês exibido
  daysWithLessons: DayCell[]; // só dias que tiveram aulas
  selectedDate: string | null;
  onSelectDay: (isoDate: string) => void;
  onChangeMonth: (direction: 'prev' | 'next') => void;
}
```

- Layout: 7 colunas × 5–6 linhas. Cada célula 44×44px (toque mínimo). Padding interno 4px.
- Dia com aula(s): renderiza dot inferior (4px ⌀, color-primary).
- Dia selecionado: círculo filled color-primary com texto color-primary-text. Spring.smooth 200ms.
- Header navigation: chevrons left/right com hit-slop +8px. Label "Abril 2026" text-h2 600.
- Pan gesture: swipe horizontal sobre o grid → onChangeMonth (threshold 60px).
- Sem dependência de lib de calendário (`react-native-calendars` evitada — peso 250KB+).
- Acessibilidade: cada cell `accessibilityLabel="3 de abril, 2 aulas"`.

### `FilterBar` — usado em M15

```typescript
interface FilterBarProps {
  visible: boolean;
  onDismiss: () => void;
  initialFilters: { period: '7d' | '30d' | '90d' | 'custom'; from?: string; to?: string; subjectIds: string[] };
  availableSubjects: { id: string; name: string }[];
  onApply: (filters: FilterBarProps['initialFilters']) => void;
  resultCount: number;        // calculado externamente conforme filters mudam
}
```

- Renderizada como `BottomSheet` (snapPoints `['65%']`). Reutiliza component existente.
- Período: row de Chip single-select (presets) + botão "Custom" abre date picker nativo (iOS `DatePickerIOS`, Android `DateTimePickerAndroid`).
- Matérias: row Chip multi-select com scroll horizontal se >5.
- Botão "Aplicar (N)" sticky inferior; N reativo aos filtros, atualiza com debounce 200ms.
- Estado interno (rascunho) — só comita ao tap "Aplicar". Tap no backdrop ou swipe-down descarta sem aplicar.

### `MiniBarChart` — usado em M16

```typescript
interface MiniBarChartProps {
  bars: { label: string; value: number; color?: string }[];
  maxValue?: number;          // se omitido, usa Math.max(values)
  unit?: string;              // " aulas", default vazio
}
```

- Implementação: cada barra é um `<View>` com `width: (value/max)*100%`, h=8px, `backgroundColor: tokens.colorPrimary`, radius=4.
- Container da barra: View track h=8px, color-border, radius=4 (fundo cinza por trás).
- Label superior (text-body-lg 500), valor à direita do bar (text-caption color-text-muted).
- Sem animação de entrada agressiva: spring.smooth one-shot com delay escalonado de 50ms entre barras (sem celebração).
- **Não usa** `react-native-svg` (evita peso) — mas se a equipe decidir adicionar gráficos mais ricos no futuro, esse é o ponto de extensão.
- Acessibilidade: `accessibilityLabel="${label}: ${value} ${unit}"`.

### `ChildSwitcher` — usado em M17 (e injetado em M6, M8, M9, M16)

```typescript
interface ChildSwitcherProps {
  children: { studentId: string; name: string; gradeLevel: string; lessonCount30d: number; avatarUrl?: string }[];
  selectedChildId: string;
  onSelect: (studentId: string) => void;
  onAddChild: () => void;     // navega para tela "Adicionar filho"
}
```

- Não renderiza se `children.length < 2`.
- ScrollView horizontal, `showsHorizontalScrollIndicator={false}`. snapToInterval = card width + gap.
- Card child: w=160, h=72. Border 2px color-primary se selecionado, 1px color-border senão.
- Card "+" final: w=64, h=72, ícone `Ionicons name="add"` 24px, color-primary.
- Tap card → onSelect + Haptic.selection (`expo-haptics`).
- Persistência: o caller deve usar `expo-secure-store` chave `selected-child-id`. O componente é stateless quanto a persistência.
- Estado global recomendado: React Context `<SelectedChildProvider>` envolvendo o segmento `(parent)` do Expo Router.

---

## Fonts — Expo Google Fonts

```typescript
// src/app/_layout.tsx
import { useFonts } from 'expo-font'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans'
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMMono_400Regular,
  })

  if (!fontsLoaded) return <SplashScreen />
  // ...
}
```
