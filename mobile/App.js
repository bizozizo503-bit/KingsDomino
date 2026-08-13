import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GAMES = [
  ['domino','🀄','دومينو كلاسيك','2-4 لاعبين'],
  ['battle','⚔️','معركة الدومينو','فرق وتحديات'],
  ['tournament','🏆','البطولة الملكية','بطولات يومية'],
  ['treasure','💎','كنوز الملوك','اجمع الجواهر'],
  ['cards','👑','الكروت الملكية','جولات سريعة'],
  ['arcade','🎮','أركيد راش','حقق رقمك القياسي'],
  ['arena','🔥','الساحة','تحدي النخبة'],
  ['dice','🎲','نرد الملوك','لعبة سريعة'],
];

const START_HAND = [[6,6],[6,3],[5,3],[2,5],[1,4],[4,4],[2,6]];

function Tile({ tile, small=false, disabled=false, onPress }) {
  const content = <View style={[s.tile, small && s.tileSmall, disabled && s.tileDisabled]}>
    <Text style={[s.pip, small && s.pipSmall]}>{tile[0]}</Text>
    <View style={s.tileLine}/>
    <Text style={[s.pip, small && s.pipSmall]}>{tile[1]}</Text>
  </View>;
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity> : content;
}

export default function App() {
  const [screen,setScreen] = useState('home');
  const [coins,setCoins] = useState(12500);
  const [points,setPoints] = useState(250);

  const reward = () => { setCoins(v=>v+500); setPoints(v=>v+25); };
  const back = () => setScreen('home');

  if (screen === 'domino' || screen === 'battle') return <Domino type={screen} back={back} onReward={v=>setCoins(c=>c+v)}/>;
  if (screen === 'store') return <Store coins={coins} points={points} setCoins={setCoins} setPoints={setPoints} back={back}/>;
  if (screen !== 'home') return <Game name={GAMES.find(x=>x[0]===screen)?.[2] || 'لعبة الملوك'} icon={GAMES.find(x=>x[0]===screen)?.[1] || '👑'} back={back} reward={reward}/>;

  return <SafeAreaView style={s.safe}>
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>م</Text></View>
        <View style={{flex:1}}><Text style={s.brand}>KINGSDOMINO</Text><Text style={s.brandAr}>ملوك الدومينو</Text></View>
        <Text style={s.bell}>🔔</Text>
      </View>

      <View style={s.hero}>
        <Text style={s.season}>♛ الموسم الملكي 01</Text>
        <Text style={s.heroTitle}>العرش ينتظرك</Text>
        <Text style={s.heroText}>ادخل عالم الملوك والعب الدومينو وتحديات الألعاب في تجربة أصلية للموبايل.</Text>
        <TouchableOpacity style={s.goldButton} onPress={()=>setScreen('domino')}><Text style={s.goldText}>ابدأ اللعب  ▶</Text></TouchableOpacity>
      </View>

      <View style={s.wallet}>
        <View><Text style={s.label}>محفظة الملوك</Text><Text style={s.balance}>{coins.toLocaleString()} ◈</Text><Text style={s.points}>{points} ⭐ نقاط</Text></View>
        <View style={s.walletButtons}><TouchableOpacity style={s.smallButton} onPress={reward}><Text>🎁 هدية</Text></TouchableOpacity><TouchableOpacity style={s.smallButton} onPress={()=>setScreen('store')}><Text>🛒 المتجر</Text></TouchableOpacity></View>
      </View>

      <View style={s.quick}><TouchableOpacity style={s.quickCard} onPress={reward}><Text style={s.quickIcon}>🎁</Text><View><Text style={s.quickTitle}>هدية يومية</Text><Text style={s.muted}>+500 عملة</Text></View></TouchableOpacity><TouchableOpacity style={s.quickCard} onPress={()=>setScreen('tournament')}><Text style={s.quickIcon}>🏆</Text><View><Text style={s.quickTitle}>البطولة</Text><Text style={s.muted}>متاحة الآن</Text></View></TouchableOpacity></View>

      <View style={s.section}><Text style={s.sectionTitle}>ألعاب الملوك</Text><Text style={s.muted}>{GAMES.length} ألعاب</Text></View>
      <View style={s.grid}>{GAMES.map(g=><TouchableOpacity key={g[0]} style={s.card} onPress={()=>setScreen(g[0])} activeOpacity={0.82}><View style={s.cardIcon}><Text>{g[1]}</Text></View><Text style={s.cardTitle}>{g[2]}</Text><Text style={s.muted}>{g[3]}</Text><View style={s.play}><Text style={s.playText}>العب</Text><Text>‹</Text></View></TouchableOpacity>)}</View>

      <View style={s.footer}><Text style={s.footerTitle}>ملوك الدومينو</Text><Text style={s.muted}>ألعاب أصلية • عملات افتراضية • تطوير محمد العربي</Text></View>
    </ScrollView>
    <View style={s.nav}><Nav active icon="⌂" title="الرئيسية" onPress={back}/><Nav icon="🎮" title="الألعاب" onPress={()=>setScreen('domino')}/><Nav icon="🏆" title="البطولة" onPress={()=>setScreen('tournament')}/><Nav icon="🛒" title="المتجر" onPress={()=>setScreen('store')}/></View>
  </SafeAreaView>;
}

function Nav({icon,title,active,onPress}){return <TouchableOpacity style={s.navItem} onPress={onPress}><Text style={[s.navIcon,active&&s.active]}>{icon}</Text><Text style={[s.navText,active&&s.active]}>{title}</Text></TouchableOpacity>}

function Store({coins,points,setCoins,setPoints,back}){return <Page title="متجر الملوك" icon="🛒" back={back}><View style={s.storeBalance}><Text style={s.label}>رصيدك</Text><Text style={s.balance}>{coins.toLocaleString()} ◈</Text><Text style={s.points}>{points} ⭐ نقاط</Text></View><Shop title="تحويل النقاط" icon="🔄" text="100 نقطة = 1,000 عملة افتراضية" button="تحويل" onPress={()=>{if(points>=100){setPoints(v=>v-100);setCoins(v=>v+1000)}}}/><Shop title="مظهر ملكي" icon="👑" text="إطار ملكي للملف الشخصي" button="تجربة" onPress={()=>setCoins(v=>v+250)}/><Shop title="مؤثرات الطاولة" icon="✨" text="تجربة مؤثرات بصرية أصلية" button="تجربة" onPress={()=>setCoins(v=>v+250)}/></Page>}
function Shop({title,icon,text,button,onPress}){return <View style={s.shop}><Text style={s.shopIcon}>{icon}</Text><Text style={s.shopTitle}>{title}</Text><Text style={s.muted}>{text}</Text><TouchableOpacity style={s.goldButton} onPress={onPress}><Text style={s.goldText}>{button}</Text></TouchableOpacity></View>}

function Page({title,icon,back,children}){return <SafeAreaView style={s.safe}><ScrollView style={s.root} contentContainerStyle={s.page}><TouchableOpacity style={s.back} onPress={back}><Text style={s.backText}>→ العودة</Text></TouchableOpacity><Text style={s.bigIcon}>{icon}</Text><Text style={s.pageTitle}>{title}</Text>{children}</ScrollView></SafeAreaView>}

function Game({name,icon,back,reward}){return <Page title={name} icon={icon} back={back}><View style={s.gamePanel}><Text style={s.gameBig}>{icon}</Text><Text style={s.pageTitle}>وضع تجريبي أصلي</Text><Text style={s.muted}>هذه اللعبة مصممة كترفيه بعملات افتراضية فقط.</Text><TouchableOpacity style={s.goldButton} onPress={()=>{reward();}}><Text style={s.goldText}>العب الجولة +500 ◈</Text></TouchableOpacity></View></Page>}

function Domino({type,back,onReward}){
  const [hand,setHand]=useState(START_HAND);
  const [left,setLeft]=useState(6); const [right,setRight]=useState(3); const [score,setScore]=useState(0); const [msg,setMsg]=useState('اختر قطعة تطابق أحد الطرفين');
  const playable=useMemo(()=>hand.map(t=>t[0]===left||t[1]===left||t[0]===right||t[1]===right),[hand,left,right]);
  const play=(tile,i)=>{
    if(!playable[i]){setMsg('❌ القطعة لا تطابق الطرف المفتوح');return;}
    const [a,b]=tile; let nl=left,nr=right;
    if(a===left||b===left) nl=a===left?b:a;
    if(a===right||b===right) nr=a===right?b:a;
    setLeft(nl);setRight(nr);setScore(v=>v+10);setMsg('حركة صحيحة! +10');setHand(h=>h.filter((_,x)=>x!==i));
    if(hand.length===1){onReward(250);setMsg('♛ فوز ملكي! +250 ◈');}
  };
  return <SafeAreaView style={s.safe}><ScrollView style={s.root} contentContainerStyle={s.page}><TouchableOpacity style={s.back} onPress={back}><Text style={s.backText}>→ العودة</Text></TouchableOpacity><View style={s.matchHeader}><View><Text style={s.label}>{type==='battle'?'معركة 2 ضد 2':'دومينو كلاسيك'}</Text><Text style={s.matchScore}>{score} نقطة</Text></View><Text style={s.bigIcon}>🀄</Text></View><View style={s.table}><Text style={s.tableTitle}>الطاولة الملكية</Text><View style={s.chain}><Tile tile={[left,right]}/></View><Text style={s.turn}>{msg}</Text></View><Text style={s.handTitle}>قطعك ({hand.length})</Text><View style={s.hand}>{hand.map((t,i)=><Tile key={i} tile={t} disabled={!playable[i]} onPress={()=>play(t,i)}/>)}</View><View style={s.opponent}><Text style={s.label}>الخصم • الذكاء الملكي</Text><View style={s.hidden}>{[1,2,3,4].map(i=><View key={i} style={s.hiddenTile}><Text>♛</Text></View>)}</View></View></ScrollView></SafeAreaView>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#070912'},root:{flex:1,backgroundColor:'#070912'},content:{padding:16,paddingBottom:100},page:{padding:16,paddingBottom:40},header:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16},avatar:{width:46,height:46,borderRadius:23,backgroundColor:'#d6a94d',alignItems:'center',justifyContent:'center'},avatarText:{fontSize:24,fontWeight:'900',color:'#101010'},brand:{fontSize:12,color:'#d6a94d',fontWeight:'900'},brandAr:{fontSize:19,color:'#fff',fontWeight:'900'},bell:{fontSize:23},hero:{backgroundColor:'#1d1829',borderRadius:24,padding:22,borderWidth:1,borderColor:'#5b4730',marginBottom:14},season:{color:'#d6a94d',fontSize:12,fontWeight:'900',marginBottom:8},heroTitle:{color:'#fff',fontSize:31,fontWeight:'900',marginBottom:8},heroText:{color:'#b9bdca',fontSize:14,lineHeight:22,marginBottom:16},goldButton:{backgroundColor:'#d6a94d',borderRadius:14,paddingVertical:13,paddingHorizontal:18,alignSelf:'flex-start',marginTop:12},goldText:{color:'#111',fontWeight:'900',fontSize:14},wallet:{backgroundColor:'#101521',borderRadius:20,padding:16,flexDirection:'row',justifyContent:'space-between',borderWidth:1,borderColor:'#252b3a',marginBottom:14},label:{color:'#7f8798',fontSize:12},balance:{color:'#fff',fontSize:25,fontWeight:'900',marginTop:3},points:{color:'#d6a94d',fontSize:12,marginTop:3},walletButtons:{justifyContent:'center',gap:8},smallButton:{backgroundColor:'#1b2130',padding:9,borderRadius:10},quick:{flexDirection:'row',gap:10,marginBottom:18},quickCard:{flex:1,backgroundColor:'#101521',borderRadius:16,padding:14,flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:'#252b3a'},quickIcon:{fontSize:25},quickTitle:{color:'#fff',fontWeight:'800'},muted:{color:'#7f8798',fontSize:12,marginTop:4},section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},sectionTitle:{color:'#fff',fontSize:20,fontWeight:'900'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},card:{width:'48%',minHeight:160,backgroundColor:'#111725',borderRadius:18,padding:14,borderWidth:1,borderColor:'#252b3a'},cardIcon:{width:48,height:48,borderRadius:14,backgroundColor:'#1d2433',alignItems:'center',justifyContent:'center',marginBottom:10},cardIconText:{fontSize:26},cardTitle:{color:'#fff',fontSize:15,fontWeight:'900'},play:{marginTop:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},playText:{color:'#d6a94d',fontWeight:'900'},footer:{marginTop:20,padding:18,backgroundColor:'#0e131e',borderRadius:18,alignItems:'center'},footerTitle:{color:'#d6a94d',fontSize:18,fontWeight:'900'},nav:{position:'absolute',bottom:0,left:0,right:0,height:72,backgroundColor:'#0d111b',borderTopWidth:1,borderTopColor:'#252b3a',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',minWidth:70},navIcon:{fontSize:21,color:'#6d7485'},navText:{fontSize:10,color:'#6d7485',marginTop:3},active:{color:'#d6a94d'},back:{marginBottom:18,paddingVertical:8},backText:{color:'#d6a94d',fontWeight:'900',fontSize:15},bigIcon:{fontSize:54,marginBottom:8},pageTitle:{color:'#fff',fontSize:28,fontWeight:'900',marginBottom:8},storeBalance:{backgroundColor:'#111725',borderRadius:18,padding:18,marginBottom:12},shop:{backgroundColor:'#111725',borderRadius:18,padding:18,marginBottom:12,borderWidth:1,borderColor:'#252b3a'},shopIcon:{fontSize:34},shopTitle:{color:'#fff',fontSize:18,fontWeight:'900',marginTop:8},gamePanel:{backgroundColor:'#111725',borderRadius:22,padding:24,alignItems:'center',marginTop:12},gameBig:{fontSize:90,marginBottom:10},matchHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},matchScore:{color:'#fff',fontSize:24,fontWeight:'900',marginTop:3},table:{backgroundColor:'#143d2d',borderRadius:24,minHeight:260,padding:18,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#6d542a'},tableTitle:{color:'#d6a94d',fontWeight:'900',marginBottom:20},chain:{flexDirection:'row',alignItems:'center',justifyContent:'center',minHeight:100},turn:{color:'#dfe7df',textAlign:'center',marginTop:20,fontWeight:'700'},handTitle:{color:'#fff',fontSize:19,fontWeight:'900',marginTop:18,marginBottom:10},hand:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:8},tile:{width:58,height:104,borderRadius:9,backgroundColor:'#f1e9d5',borderWidth:2,borderColor:'#bcae91',alignItems:'center',justifyContent:'space-around',paddingVertical:6},tileSmall:{width:42,height:72},tileDisabled:{opacity:0.35},pip:{fontSize:25,fontWeight:'900',color:'#171717'},pipSmall:{fontSize:17},tileLine:{height:2,width:'70%',backgroundColor:'#bcae91'},opponent:{backgroundColor:'#101521',borderRadius:16,padding:15,marginTop:18},hidden:{flexDirection:'row',gap:8,marginTop:10},hiddenTile:{width:45,height:64,borderRadius:8,backgroundColor:'#242a3a',alignItems:'center',justifyContent:'center'},hiddenTileText:{color:'#d6a94d',fontSize:20}
});
