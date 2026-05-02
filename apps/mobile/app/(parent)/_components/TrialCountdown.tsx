import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TrialCountdownProps {
  trialEndsAt: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calcTimeLeft(trialEndsAt: string): TimeLeft {
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  const totalMs = diff;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, totalMs };
}

export function TrialCountdown({ trialEndsAt }: TrialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(trialEndsAt));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(trialEndsAt));
    }, 1000);
    return () => clearInterval(id);
  }, [trialEndsAt]);

  const isUrgent = timeLeft.totalMs > 0 && timeLeft.totalMs < 48 * 3600000;
  const color = isUrgent ? '#D95F3B' : '#1A6B74';

  return (
    <Text style={[styles.countdown, { color }]}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s restantes
    </Text>
  );
}

const styles = StyleSheet.create({
  countdown: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
});
