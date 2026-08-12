import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GAMES = [
  { id: 'domino', icon: '🀄', title: 'دومينو كلاسيك', sub: '2-4 لاعبين', tone: 'gold' },
  { id: 'battle', icon: '⚔️', title: 'معركة الدومينو', sub: 'تحدي الفرق', tone: 'red' },
  { id: 'olympus', icon: '⚡', title: 'Kings Olympus', sub: 'جولة برق أصلية', tone: 'purple' },
  { id: 'treasure', icon: '💎', title: 'كنوز الملوك', sub: 'اجمع الجواهر', tone: 'blue' },
  { id: 'cards', icon: '👑', title: 'الكروت الملكية', sub: 'تكتيك سريع', tone: 'gold' },
  { id: 'arcade', icon: '🎮', title: 'أركيد راش', sub: 'حطّم رقمك', tone: 'green' },
  { id: 'tournament', icon: '🏆', title: 'البطولة الملكية', sub: 'تحديات يومية', tone: 'gold' },
  { id: 'arena', icon: '🔥', title: 'الساحة', sub: 'تحدي النخبة', tone: 'red' },
  { id: 'plinko', icon: '🔺', title: 'هرم الملوك', sub: 'مسار مهارة', tone: 'blue' },
  { id: 'crash', icon: '🚀', title: 'صاروخ الملوك', sub: 'توقيت ومهارة', tone: 'purple' },
  { id: 'dice', icon: '🎲', title: 'نرد الملوك', sub: 'جولة سريعة', tone: 'green' },
  { id: 'wheel', icon: '🎡', title: 'عجلة الملوك', sub: 'مكافأة يومية', tone: 'gold' },
];

const START_HAND = [
  [6, 6], [6, 3], [5, 3], [2, 5], [1, 4], [4, 4], [2, 6]
];
const OPEN_TILE = [6, 3];

function Tile({ a, b, small = false, disabled = false, onPress }) {
  const body = (
    <View style={[s.tile, small && s.tileSmall, disabled && s.tileDisabled]}>
      <Text style={[s.pip, small && s.pipSmall]}>{a}</Text>
      <View style={s.tileLine} />
      <Text style={[s.pip, small && s.pipSmall]}>{b}</Text>
    </View>
  );
  return onPress ? <TouchableOpacity activeOpacity={0.82} onPress={onPress}>{body}</TouchableOpacity> : body;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [coins, setCoins] = useState(12500);
  const [points, setPoints] = useState(250);
  const [best, setBest] = useState(0);

  const reward = () => { setCoins(v => v + 500); setPoints(v => v + 25); };
  const convert = () => { if (points >= 100) { setPoints(v => v - 100); setCoins(v => v + 1000); } };
  const play = id => setScreen(id);

  if (screen === 'store') return <Store coins={coins} setCoins={setCoins} points={points} convert={convert} back={() => setScreen('home')} />;
  if (screen !== 'home') return <GameScreen type={screen} back={() => setScreen('home')} onWin={value => { setCoins(v => v + value); setBest(v => Math.max(v, value)); }} />;

  return (
    <LinearGradient colors={['#060811', '#0b1020', '#080a12']} style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.topbar}>
            <View style={s.avatar}><Text style={s.avatarText}>م</Text></View>
            <View style={s.brand}><Text style={s.brandMini}>KINGSDOMINO</Text><Text style={s.brandTitle}>ملوك الدومينو</Text></View>
            <TouchableOpacity style={s.iconButton}><Ionicons name="notifications-outline" size={22} color="#f5d37b" /></TouchableOpacity>
          </View>

          <LinearGradient colors={['#3b2944', '#171b2b', '#101522']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
            <View style={s.heroGlow} />
            <Text style={s.heroBadge}>♛ ROYAL SEASON 01</Text>
            <Text style={s.heroTitle}>العرش ينتظرك</Text>
            <Text style={s.heroText}>دومينو أصلي وتجارب ألعاب سريعة، مصممة للموبايل من البداية.</Text>
            <View style={s.heroRow}>
              <TouchableOpacity style={s.primary} onPress={() => play('domino')}><Ionicons name="play" size={17} color="#0b0b0d" /><Text style={s.primaryText}>ابدأ اللعب</Text></TouchableOpacity>
              <View style={s.season}><Text style={s.seasonLabel}>موسم</Text><Text style={s.seasonValue}>01</Text></View>
            </View>
          </LinearGradient>

          <View style={s.wallet}>
            <View style={s.walletMain}><Text style={s.walletLabel}>محفظة الملوك</Text><Text style={s.balance}>{coins.toLocaleString('en-US')} <Text style={s.coin}>◈</Text></Text><Text style={s.points}>{points} ⭐ نقاط</Text></View>
            <View style={s.walletActions}>
              <TouchableOpacity style={s.walletButton} onPress={reward}><Text style={s.walletButtonText}>🎁 مكافأة</Text></TouchableOpacity>
              <TouchableOpacity style={s.walletButton} onPress={() => setScreen('store')}><Text style={s.walletButtonText}>المتجر</Text></TouchableOpacity>
            </View>
          </View>

          <View style={s.quickRow}>
            <TouchableOpacity style={s.quickCard} onPress={reward}><Text style={s.quickIcon}>🎁</Text><View><Text style={s.quickTitle}>هدية اليوم</Text><Text style={s.quickSub}>+500 ◈</Text></View></TouchableOpacity>
            <TouchableOpacity style={s.quickCard} onPress={() => setScreen('tournament')}><Text style={s.quickIcon}>🏆</Text><View><Text style={s.quickTitle}>البطولة</Text><Text style={s.quickSub}>متاح الآن</Text></View></TouchableOpacity>
          </View>

          <View style={s.sectionHead}><Text style={s.sectionTitle}>ألعاب الملوك</Text><Text style={s.sectionCount}>{GAMES.length} لعبة</Text></View>
          <View style={s.grid}>
            {GAMES.map(game => (
              <TouchableOpacity key={game.id} style={s.gameCard} activeOpacity={0.86} onPress={() => play(game.id)}>
                <LinearGradient colors={game.tone === 'gold' ? ['#252033','#141621'] : game.tone === 'red' ? ['#2b1b27','#141521'] : game.tone === 'purple' ? ['#25203a','#121522'] : game.tone === 'blue' ? ['#18253b','#101522'] : ['#172a29','#101522']} style={s.gameInner}>
                  <View style={s.gameTop}><Text style={s.gameIcon}>{game.icon}</Text><View style={s.liveDot} /></View>
                  <Text style={s.gameTitle}>{game.title}</Text>
                  <Text style={s.gameSub}>{game.sub}</Text>
                  <View style={s.playPill}><Text style={s.playPillText}>العب</Text><Ionicons name="chevron-back" size={13} color="#f5d37b" /></View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.footerBox}><Text style={s.footerTitle}>ملوك الدومينو</Text><Text style={s.footerText}>Free-to-play • ألعاب أصلية • نقاط وعملات افتراضية</Text><Text style={s.developer}>تطوير محمد العربي</Text></View>
        </ScrollView>
        <View style={s.nav}>
          <Nav icon="home" title="الرئيسية" active onPress={() => setScreen('home')} />
          <Nav icon="game-controller-outline" title="الألعاب" onPress={() => setScreen('domino')} />
          <Nav icon="trophy-outline" title="البطولة" onPress={() => setScreen('tournament')} />
          <Nav icon="storefront-outline" title="المتجر" onPress={() => setScreen('store')} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Nav({ icon, title, active, onPress }) { return <TouchableOpacity style={s.navItem} onPress={onPress}><Ionicons name={icon} size={22} color={active ? '#f5d37b' : '#70798d'} /><Text style={[s.navText, active && s.navActive]}>{title}</Text></TouchableOpacity>; }

function Store({ coins, setCoins, points, convert, back }) {
  return <Page back={back} icon="🛒" title="متجر الملوك" sub="محتوى افتراضي تجريبي — بدون أموال حقيقية">
    <View style={s.storeBalance}><Text style={s.walletLabel}>رصيدك الحالي</Text><Text style={s.storeCoins}>{coins.toLocaleString('en-US')} ◈</Text><Text style={s.points}>{points} ⭐ نقاط</Text></View>
    <View style={s.shopCard}><Text style={s.shopTitle}>🔄 تحويل النقاط</Text><Text style={s.hint}>100 نقطة = 1,000 عملة افتراضية</Text><TouchableOpacity style={s.primary} onPress={convert}><Text style={s.primaryText}>تحويل الآن</Text></TouchableOpacity></View>
    {[['👑','مظهر ملكي','إطار ذهبي للملف الشخصي'],['✨','Royal Effects','مؤثرات بصرية للملف'],['🎨','لوحة فاخرة','ثيم جديد للطاولة']].map(item => <View style={s.shopCard} key={item[1]}><Text style={s.shopIcon}>{item[0]}</Text><Text style={s.shopTitle}>{item[1]}</Text><Text style={s.hint}>{item[2]}</Text><TouchableOpacity style={s.secondary} onPress={() => setCoins(v => v + 250)}><Text style={s.secondaryText}>تجربة مجانية</Text></TouchableOpacity></View>)}
  </Page>;
}

function Page({ back, icon, title, sub, children }) { return <LinearGradient colors={['#060811','#0d1322']} style={s.root}><StatusBar style="light"/><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}><TouchableOpacity style={s.back} onPress={back}><Ionicons name="arrow-forward" size={21} color="#f5d37b"/><Text style={s.backText}>العودة</Text></TouchableOpacity><Text style={s.pageIcon}>{icon}</Text><Text style={s.pageTitle}>{title}</Text><Text style={s.pageSub}>{sub}</Text>{children}</ScrollView></SafeAreaView></LinearGradient>; }

function GameScreen({ type, back, onWin }) {
  if (type === 'domino' || type === 'battle') return <DominoGame battle={type === 'battle'} back={back} onWin={onWin} />;
  const game = GAMES.find(g => g.id === type) || GAMES[0];
  return <Page back={back} icon={game.icon} title={game.title} sub={game.sub}><MiniGame game={game} onWin={onWin} /></Page>;
}

function DominoGame({ battle, back, onWin }) {
  const [hand, setHand] = useState(START_HAND);
  const [left, setLeft] = useState(6);
  const [right, setRight] = useState(3);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('اختر قطعة مطابقة للطرف المفتوح');
  const playable = useMemo(() => hand.map(([a,b]) => a === left || b === left || a === right || b === right), [hand,left,right]);
  const playTile = (tile, index) => {
    const [a,b] = tile;
    if (!playable[index]) { setMessage('هذه القطعة لا تطابق الطرف المفتوح'); return; }
    const newLeft = a === left || b === left ? (a === left ? b : a) : left;
    const newRight = a === right || b === right ? (a === right ? b : a) : right;
    setLeft(newLeft); setRight(newRight); setScore(v => v + 10); setMessage('حركة ممتازة! +10'); setHand(h => h.filter((_,i) => i !== index));
    if (hand.length === 1) { onWin(250); setMessage('♛ فوز ملكي! +250 عملة تجريبية'); }
  };
  return <LinearGradient colors={['#07100d','#101a16']} style={s.root}><StatusBar style="light"/><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <TouchableOpacity style={s.back} onPress={back}><Ionicons name="arrow-forward" size={21} color="#f5d37b"/><Text style={s.backText}>العودة</Text></TouchableOpacity>
    <View style={s.matchTop}><View><Text style={s.matchLabel}>{battle ? '2 ضد 2' : 'مباراة كلاسيك'}</Text><Text style={s.matchScore}>{score} نقطة</Text></View><Text style={s.pageIcon}>🀄</Text></View>
    <View style={s.table}><Text style={s.tableCaption}>الطاولة الملكية</Text><View style={s.chain}><Tile a={left} b={right} /></View><View style={s.tableDivider}><View style={s.turnDot}/><Text style={s.turnText}>{message}</Text></View></View>
    <View style={s.opponent}><Text style={s.opponentText}>الخصم • {battle ? 'الفريق الأحمر' : 'الذكاء الملكي'}</Text><View style={s.hiddenTiles}>{[1,2,3,4].map(i => <View key={i} style={s.hiddenTile}><Text>♛</Text></View>)}</View></View>
    <Text style={s.handTitle}>قطعك <Text style={s.handCount}>{hand.length}</Text></Text>
    <View style={s.hand}>{hand.map((tile,index) => <Tile key={`${tile[0]}-${tile[1]}-${index}`} a={tile[0]} b={tile[1]} small disabled={!playable[index]} onPress={() => playTile(tile,index)} />)}</View>
    <TouchableOpacity style={s.secondaryWide} onPress={() => {setHand(START_HAND);setLeft(6);setRight(3);setScore(0);setMessage('اختر قطعة مطابقة للطرف المفتوح')}}><Text style={s.secondaryText}>مباراة جديدة</Text></TouchableOpacity>
  </ScrollView></SafeAreaView></LinearGradient>;
}

function MiniGame({ game, onWin }) {
  const [score, setScore] = useState(0);
  const [result, setResult] = useState('جاهز؟');
  const [choices, setChoices] = useState([0,1,2]);
  const tap = () => { const value = 10 + Math.floor(Math.random()*41); setScore(v => v + value); setResult(`ممتاز! +${value}`); onWin(value); };
  const roll = () => { const value = 1 + Math.floor(Math.random()*6); setScore(v => v + value*5); setResult(`🎲 النتيجة ${value}`); onWin(value*5); };
  const card = () => { const value = choices[Math.floor(Math.random()*choices.length)] + 1; setResult(['ختم الماس','تاج ذهبي','درع الملوك'][value-1] || 'تاج ذهبي'); setScore(v => v + value*10); onWin(value*10); };
  const action = game.id === 'dice' ? roll : game.id === 'cards' ? card : tap;
  return <View style={s.miniWrap}><View style={s.miniScore}><Text style={s.walletLabel}>نتيجة الجولة</Text><Text style={s.bigScore}>{score}</Text><Text style={s.result}>{result}</Text></View><TouchableOpacity activeOpacity={0.86} style={s.powerButton} onPress={action}><LinearGradient colors={['#f5d37b','#b87927']} style={s.powerButtonInner}><Text style={s.powerIcon}>{game.icon}</Text><Text style={s.powerText}>اضغط للعب</Text></LinearGradient></TouchableOpacity><Text style={s.hint}>مهارة وتجربة افتراضية فقط — لا أموال حقيقية</Text></View>;
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#060811'},safe:{flex:1},content:{padding:17,paddingBottom:115},topbar:{flexDirection:'row-reverse',alignItems:'center',gap:10,marginBottom:16},brand:{flex:1},brandMini:{color:'#f5d37b',fontSize:10,fontWeight:'900',letterSpacing:2,textAlign:'right'},brandTitle:{color:'#fff',fontSize:25,fontWeight:'900',textAlign:'right',marginTop:2},avatar:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:'#8d6b31',backgroundColor:'#1a1d2c',alignItems:'center',justifyContent:'center'},avatarText:{color:'#f5d37b',fontSize:20,fontWeight:'900'},iconButton:{width:42,height:42,borderRadius:14,backgroundColor:'#111726',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#252e45'},hero:{minHeight:250,borderRadius:28,padding:21,overflow:'hidden',borderWidth:1,borderColor:'#463b50'},heroGlow:{position:'absolute',width:210,height:210,borderRadius:105,backgroundColor:'#6f4b86',opacity:.16,right:-80,top:-70},heroBadge:{color:'#f5d37b',fontSize:10,fontWeight:'900',letterSpacing:1,textAlign:'right'},heroTitle:{color:'#fff',fontSize:34,fontWeight:'900',textAlign:'right',marginTop:10},heroText:{color:'#aeb5c7',fontSize:13,lineHeight:21,textAlign:'right',marginTop:7},heroRow:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between',marginTop:20},primary:{backgroundColor:'#f5d37b',borderRadius:15,paddingHorizontal:19,paddingVertical:13,flexDirection:'row',alignItems:'center',gap:8},primaryText:{color:'#101116',fontWeight:'900',fontSize:14},season:{alignItems:'center'},seasonLabel:{color:'#777f93',fontSize:10},seasonValue:{color:'#f5d37b',fontSize:18,fontWeight:'900'},wallet:{marginTop:14,backgroundColor:'#101625',borderRadius:22,padding:16,flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:'#252e45'},walletMain:{alignItems:'flex-end'},walletLabel:{color:'#7f899f',fontSize:11},balance:{color:'#fff',fontSize:25,fontWeight:'900',marginTop:3},coin:{color:'#f5d37b'},points:{color:'#aeb6c6',fontSize:12,marginTop:2},walletActions:{gap:7},walletButton:{backgroundColor:'#202a3f',paddingHorizontal:12,paddingVertical:9,borderRadius:11},walletButtonText:{color:'#fff',fontSize:11,fontWeight:'900'},quickRow:{flexDirection:'row-reverse',gap:10,marginTop:11},quickCard:{flex:1,backgroundColor:'#111726',borderRadius:16,padding:12,flexDirection:'row-reverse',alignItems:'center',gap:9,borderWidth:1,borderColor:'#252e45'},quickIcon:{fontSize:25},quickTitle:{color:'#fff',fontSize:12,fontWeight:'900',textAlign:'right'},quickSub:{color:'#f5d37b',fontSize:10,textAlign:'right',marginTop:2},sectionHead:{marginTop:23,marginBottom:12,flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},sectionTitle:{color:'#fff',fontSize:21,fontWeight:'900'},sectionCount:{color:'#f5d37b',fontSize:11,fontWeight:'800'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10,justifyContent:'space-between'},gameCard:{width:'48%',height:158,borderRadius:20,overflow:'hidden'},gameInner:{flex:1,padding:13,borderRadius:20,borderWidth:1,borderColor:'#283148',justifyContent:'space-between'},gameTop:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},gameIcon:{fontSize:32},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:'#58d39b'},gameTitle:{color:'#fff',fontSize:15,fontWeight:'900',textAlign:'right'},gameSub:{color:'#7d879c',fontSize:10,textAlign:'right'},playPill:{alignSelf:'flex-end',flexDirection:'row',alignItems:'center',gap:3},playPillText:{color:'#f5d37b',fontSize:11,fontWeight:'900'},footerBox:{marginTop:24,alignItems:'center',padding:18,borderTopWidth:1,borderTopColor:'#1c2435'},footerTitle:{color:'#f5d37b',fontSize:15,fontWeight:'900'},footerText:{color:'#687288',fontSize:10,marginTop:5,textAlign:'center'},developer:{color:'#8e96a8',fontSize:10,marginTop:8},nav:{position:'absolute',bottom:0,left:0,right:0,height:73,backgroundColor:'#0b0f1a',borderTopWidth:1,borderTopColor:'#222b3e',flexDirection:'row-reverse',justifyContent:'space-around',paddingTop:8},navItem:{alignItems:'center',minWidth:70},navText:{color:'#697287',fontSize:9,fontWeight:'800',marginTop:3},navActive:{color:'#f5d37b'},page:{padding:18,paddingBottom:45,alignItems:'center'},back:{alignSelf:'stretch',flexDirection:'row-reverse',alignItems:'center',gap:7,marginBottom:10},backText:{color:'#f5d37b',fontWeight:'800'},pageIcon:{fontSize:58,marginTop:8},pageTitle:{color:'#fff',fontSize:28,fontWeight:'900',marginTop:8,textAlign:'center'},pageSub:{color:'#7f899f',fontSize:12,marginTop:5,textAlign:'center'},storeBalance:{width:'100%',marginTop:20,backgroundColor:'#111726',borderRadius:20,padding:20,alignItems:'center',borderWidth:1,borderColor:'#252e45'},storeCoins:{color:'#f5d37b',fontSize:30,fontWeight:'900',marginTop:5},shopCard:{width:'100%',backgroundColor:'#111726',borderRadius:20,padding:17,marginTop:12,borderWidth:1,borderColor:'#252e45'},shopIcon:{fontSize:34,textAlign:'right'},shopTitle:{color:'#fff',fontSize:17,fontWeight:'900',textAlign:'right',marginTop:5},hint:{color:'#758097',fontSize:11,textAlign:'center',marginTop:10},secondary:{alignSelf:'flex-end',backgroundColor:'#222c42',borderRadius:11,paddingHorizontal:15,paddingVertical:10,marginTop:12},secondaryText:{color:'#fff',fontWeight:'900',fontSize:12},secondaryWide:{width:'100%',alignItems:'center',backgroundColor:'#222c42',borderRadius:14,paddingVertical:14,marginTop:16},matchTop:{width:'100%',flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},matchLabel:{color:'#7f899f',fontSize:11,textAlign:'right'},matchScore:{color:'#f5d37b',fontSize:18,fontWeight:'900',textAlign:'right',marginTop:3},table:{width:'100%',minHeight:245,backgroundColor:'#0b2118',borderRadius:26,borderWidth:1,borderColor:'#38533d',padding:17,marginTop:8,justifyContent:'center'},tableCaption:{color:'#8aa08f',fontSize:11,textAlign:'center'},chain:{alignItems:'center',justifyContent:'center',marginTop:16},tile:{width:54,height:98,backgroundColor:'#f0e6c7',borderRadius:9,alignItems:'center',justifyContent:'space-around',borderWidth:1,borderColor:'#b9aa83',shadowColor:'#000',shadowOpacity:.35,shadowRadius:5,shadowOffset:{width:0,height:3},elevation:5},tileSmall:{width:49,height:88},tileDisabled:{opacity:.38},pip:{color:'#161616',fontSize:24,fontWeight:'900'},pipSmall:{fontSize:20},tileLine:{height:1,width:'72%',backgroundColor:'#91876d'},tableDivider:{alignItems:'center',marginTop:16},turnDot:{width:8,height:8,borderRadius:4,backgroundColor:'#f5d37b'},turnText:{color:'#b4c0b5',fontSize:11,textAlign:'center',marginTop:6},opponent:{width:'100%',marginTop:15,backgroundColor:'#111726',borderRadius:18,padding:12,borderWidth:1,borderColor:'#252e45'},opponentText:{color:'#8993a7',fontSize:10,textAlign:'right'},hiddenTiles:{flexDirection:'row',justifyContent:'center',gap:7,marginTop:9},hiddenTile:{width:34,height:48,borderRadius:6,backgroundColor:'#222d43',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#384663'},hiddenTileText:{color:'#f5d37b'},handTitle:{alignSelf:'stretch',color:'#fff',fontSize:17,fontWeight:'900',textAlign:'right',marginTop:20},handCount:{color:'#f5d37b'},hand:{width:'100%',flexDirection:'row-reverse',justifyContent:'center',gap:7,flexWrap:'wrap',marginTop:10},miniWrap:{width:'100%',alignItems:'center',marginTop:22},miniScore:{width:'100%',backgroundColor:'#111726',borderRadius:22,padding:20,alignItems:'center',borderWidth:1,borderColor:'#252e45'},bigScore:{color:'#f5d37b',fontSize:42,fontWeight:'900',marginTop:2},result:{color:'#fff',fontSize:15,fontWeight:'800',marginTop:4},powerButton:{marginTop:30,width:190,height:190,borderRadius:95,overflow:'hidden',borderWidth:3,borderColor:'#5f4721',elevation:8},powerButtonInner:{flex:1,alignItems:'center',justifyContent:'center'},powerIcon:{fontSize:58},powerText:{color:'#15120c',fontSize:14,fontWeight:'900',marginTop:7}
});
