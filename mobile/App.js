import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const games = [
  ['Domino Classic', '🀄', 'دومينو كلاسيك'],
  ['Domino Battle', '⚔️', 'معركة الدومينو'],
  ['Olympus Gates', '⚡', 'أولمبس'],
  ['Treasure Spin', '💎', 'كنوز'],
  ['Royal Cards', '👑', 'كروت ملكية'],
  ['Arcade Rush', '🎮', 'أركيد'],
  ['Tournament', '🏆', 'بطولات'],
  ['Lucky Arena', '🔥', 'الساحة'],
];

export default function App() {
  return (
    <LinearGradient colors={['#070912', '#10162a', '#090b12']} style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>KINGSDOMINO</Text>
              <Text style={styles.title}>ملوك الدومينو</Text>
              <Text style={styles.subtitle}>عالم الألعاب الملكي</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#f5d37b" />
            </TouchableOpacity>
          </View>

          <LinearGradient colors={['#2a2031', '#151a2a']} style={styles.hero}>
            <View style={styles.heroGlow} />
            <Text style={styles.heroSmall}>★ PREMIUM ARENA ★</Text>
            <Text style={styles.heroTitle}>العب. نافس. اصنع مجدك.</Text>
            <Text style={styles.heroText}>دومينو تنافسي وألعاب أصلية بتجربة سريعة ومؤثرات ملكية.</Text>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryText}>ابدأ اللعب الآن</Text>
              <Ionicons name="play" size={18} color="#111" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.wallet}>
            <View><Text style={styles.label}>رصيدك</Text><Text style={styles.balance}>12,500 💎</Text></View>
            <TouchableOpacity style={styles.addButton}><Text style={styles.addText}>+ شحن</Text></TouchableOpacity>
          </View>

          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>الألعاب</Text><Text style={styles.more}>الكل</Text></View>
          <View style={styles.grid}>
            {games.map(([en, icon, ar]) => (
              <TouchableOpacity key={en} style={styles.card} activeOpacity={0.82}>
                <LinearGradient colors={['#1b2135', '#101522']} style={styles.cardInner}>
                  <Text style={styles.gameIcon}>{icon}</Text>
                  <Text style={styles.gameTitle}>{ar}</Text>
                  <Text style={styles.gameSub}>{en}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}><Text style={styles.footerText}>تطوير محمد العربي • KingsDomino</Text></View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070912' },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  kicker: { color: '#f5d37b', fontSize: 12, fontWeight: '900', letterSpacing: 3, textAlign: 'right' },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  subtitle: { color: '#8d96ad', fontSize: 13, textAlign: 'right', marginTop: 3 },
  iconButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#141a2b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2b334b' },
  hero: { minHeight: 225, borderRadius: 28, padding: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#3b3441', justifyContent: 'flex-end' },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -55, top: -55, backgroundColor: '#a96c2b', opacity: 0.22 },
  heroSmall: { color: '#f5d37b', fontSize: 11, fontWeight: '900', marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900', textAlign: 'right' },
  heroText: { color: '#aab1c3', fontSize: 13, lineHeight: 21, textAlign: 'right', marginTop: 7 },
  primaryButton: { marginTop: 16, alignSelf: 'flex-end', backgroundColor: '#f5d37b', borderRadius: 15, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  primaryText: { color: '#111', fontWeight: '900', fontSize: 14 },
  wallet: { marginTop: 16, backgroundColor: '#111726', borderRadius: 20, padding: 17, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#252e45' },
  label: { color: '#858ea3', fontSize: 12, textAlign: 'right' },
  balance: { color: '#f5d37b', fontSize: 20, fontWeight: '900', marginTop: 3 },
  addButton: { backgroundColor: '#252e45', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 },
  addText: { color: '#fff', fontWeight: '800' },
  sectionHead: { marginTop: 24, marginBottom: 12, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  more: { color: '#f5d37b', fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, justifyContent: 'space-between' },
  card: { width: '48%', minHeight: 125, borderRadius: 20, overflow: 'hidden' },
  cardInner: { flex: 1, padding: 15, borderWidth: 1, borderColor: '#252e45', borderRadius: 20, justifyContent: 'space-between' },
  gameIcon: { fontSize: 31, textAlign: 'right' },
  gameTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  gameSub: { color: '#727d96', fontSize: 9, textAlign: 'right' },
  footer: { paddingTop: 30, alignItems: 'center' },
  footerText: { color: '#5f687d', fontSize: 11 },
});
