import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Student {
  id: string; name: string; gradeLevel: string; avatarUrl?: string;
  subject: { name: string };
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

export function StudentListItem({ student, onPress }: { student: Student; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <AvatarFallback name={student.name} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
        <Text style={styles.meta}>{student.gradeLevel} • {student.subject.name}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f4f5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarInitials: { fontSize: 14, fontWeight: '700', color: '#1A6B74' },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  meta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  chevron: { fontSize: 22, color: '#CBD5E1', fontWeight: '300' },
});
