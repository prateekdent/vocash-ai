import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onVoice: () => void;
  onManual: () => void;
};

type OptionProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function ChoiceRow({ icon, title, subtitle, onPress }: OptionProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.iconWrap}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function AddExpenseChooser({
  visible,
  onClose,
  onVoice,
  onManual,
}: Props): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable stops tap-through to backdrop */}
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Expense</Text>

          <ChoiceRow
            icon="🎙️"
            title="Add by voice"
            subtitle="Speak your expense in Hindi or English"
            onPress={onVoice}
          />

          <View style={styles.divider} />

          <ChoiceRow
            icon="✏️"
            title="Add manually"
            subtitle="Fill in the details yourself"
            onPress={onManual}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    gap: 4,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: { fontSize: 20 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  rowSub: { fontSize: 12, color: '#ADADB8' },
  chevron: { fontSize: 22, color: '#C0C0CC', fontWeight: '300' },

  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
});
