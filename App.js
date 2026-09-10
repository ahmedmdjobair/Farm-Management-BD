
import React, {useMemo, useState} from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, Image, Alert, Switch
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";

const GREEN = "#078B43";
const LIGHT = "#F3FFF7";
const BLUE = "#2376D8";
const RED = "#D92D3A";
const GOLD = "#B77900";

const T = {
  bn: {
    app:"ফার্ম ম্যানেজমেন্ট বিডি", tagline:"আপনার ফার্ম, আপনার হিসাব",
    newFarm:"নতুন ফার্ম", joinFarm:"ফার্মে যোগ দিন", language:"ভাষা",
    farms:"আমার ফার্মসমূহ", addFarm:"নতুন ফার্ম যোগ করুন", farmName:"ফার্মের নাম",
    create:"তৈরি করুন", dashboard:"ড্যাশবোর্ড", live:"জীবিত মুরগি",
    dead:"মৃত মুরগি", expense:"মোট খরচ", addChicken:"মুরগি যোগ করুন",
    feed:"ফিড যোগ করুন", medicine:"ওষুধ যোগ করুন", other:"অন্যান্য খরচ",
    death:"মৃত মুরগি যোগ করুন", sales:"বিক্রি", history:"ইতিহাস",
    qty:"পরিমাণ / পিস", price:"প্রতি পিস/বস্তার দাম", total:"মোট",
    name:"নাম", save:"সংরক্ষণ করুন", more:"আরও যোগ করুন",
    piecesSold:"বিক্রি করা মুরগির সংখ্যা", totalKg:"মোট ওজন (কেজি)",
    perKg:"প্রতি কেজির দাম", totalSales:"মোট বিক্রি", profitLoss:"লাভ / লস",
    date:"তারিখ", photo:"ছবি তুলুন", note:"মন্তব্য (ঐচ্ছিক)",
    currentBatch:"বর্তমান ব্যাচের লেনদেন", empty:"এখনও কোনো লেনদেন নেই",
    selectFarm:"একটি ফার্ম নির্বাচন করুন", back:"ফিরে যান", home:"হোম",
    loginInfo:"একই ফার্মের তথ্য অন্য মোবাইলে দেখতে একই অ্যাকাউন্টে যোগ দিন",
    email:"মোবাইল / ইমেইল", password:"পাসওয়ার্ড", login:"লগইন করুন",
    batchEnded:"বর্তমান ব্যাচ শেষ", startBatch:"নতুন ব্যাচ শুরু করুন",
    cameraProof:"প্রমাণের ছবি", searchDate:"তারিখ দিয়ে খুঁজুন",
    all:"সব", settings:"সেটিংস", bangla:"বাংলা", english:"English"
  },
  en: {
    app:"Farm Management BD", tagline:"Your farm, your accounts",
    newFarm:"New Farm", joinFarm:"Join Farm", language:"Language",
    farms:"My Farms", addFarm:"Add New Farm", farmName:"Farm name",
    create:"Create", dashboard:"Dashboard", live:"Live Chicken",
    dead:"Dead Chicken", expense:"Total Expense", addChicken:"Add Chicken",
    feed:"Add Feed", medicine:"Add Medicine", other:"Other Expense",
    death:"Add Dead Chicken", sales:"Sales", history:"History",
    qty:"Quantity / pieces", price:"Price per piece/bag", total:"Total",
    name:"Name", save:"Save", more:"Add More",
    piecesSold:"Chicken pieces sold", totalKg:"Total weight (kg)",
    perKg:"Price per kg", totalSales:"Total Sales", profitLoss:"Profit / Loss",
    date:"Date", photo:"Take Photo", note:"Note (optional)",
    currentBatch:"Current Batch Transactions", empty:"No transactions yet",
    selectFarm:"Select a farm", back:"Back", home:"Home",
    loginInfo:"Join the same account to see the same farm data on another phone",
    email:"Mobile / Email", password:"Password", login:"Login",
    batchEnded:"Current batch ended", startBatch:"Start New Batch",
    cameraProof:"Proof photo", searchDate:"Search by date",
    all:"All", settings:"Settings", bangla:"বাংলা", english:"English"
  }
};

const money = n => `৳ ${Number(n || 0).toLocaleString()}`;
const nowText = () => new Date().toLocaleString();

export default function App() {
  const [lang, setLang] = useState("bn");
  const t = T[lang];
  const [screen, setScreen] = useState("welcome");
  const [farms, setFarms] = useState([]);
  const [farmName, setFarmName] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({name:"", qty:"", price:"", kg:"", photo:null, note:""});
  const [historyFilter, setHistoryFilter] = useState("");

  const active = farms.find(f => f.id === activeId);
  const updateActive = fn => setFarms(prev => prev.map(f => f.id === activeId ? fn(f) : f));

  const addFarm = () => {
    if (!farmName.trim()) return;
    const f = {id:String(Date.now()), name:farmName.trim(), live:0, dead:0, expense:0, sales:0, tx:[], batch:1};
    setFarms(v => [...v, f]); setFarmName(""); setActiveId(f.id); setScreen("dashboard");
  };

  const addTx = (type) => {
    if (!active) return;
    const qty = Number(form.qty || 0), price = Number(form.price || 0), kg = Number(form.kg || 0);
    let amount = 0, liveDelta = 0, deadDelta = 0, expenseDelta = 0, salesDelta = 0;
    if (type === "chicken") { amount = qty * price; liveDelta = qty; expenseDelta = amount; }
    if (type === "feed" || type === "medicine") { amount = qty * price; expenseDelta = amount; }
    if (type === "other") { amount = price; expenseDelta = amount; }
    if (type === "death") { deadDelta = qty; liveDelta = -qty; }
    if (type === "sale") { amount = kg * price; liveDelta = -qty; salesDelta = amount; }

    const tx = {id:String(Date.now()), type, name:form.name, qty, price, kg, amount, photo:form.photo, note:form.note, at:nowText(), day:new Date().toISOString().slice(0,10)};
    updateActive(f => ({
      ...f,
      live: Math.max(0, f.live + liveDelta),
      dead: f.dead + deadDelta,
      expense: f.expense + expenseDelta,
      sales: f.sales + salesDelta,
      tx: [tx, ...f.tx]
    }));
    setForm({name:"", qty:"", price:"", kg:"", photo:null, note:""});
    setScreen("dashboard");
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission required");
    const r = await ImagePicker.launchCameraAsync({quality:0.7});
    if (!r.canceled) setForm(v => ({...v, photo:r.assets[0].uri}));
  };

  const typeLabel = type => ({
    chicken:t.addChicken, feed:t.feed, medicine:t.medicine,
    other:t.other, death:t.death, sale:t.sales
  }[type]);

  const Card = ({children, style}) => <View style={[s.card, style]}>{children}</View>;
  const Btn = ({title,onPress,blue=false,outline=false}) => (
    <TouchableOpacity onPress={onPress} style={[s.btn, blue&&{backgroundColor:BLUE}, outline&&s.outlineBtn]}>
      <Text style={[s.btnText, outline&&{color:GREEN}]}>{title}</Text>
    </TouchableOpacity>
  );

  const Header = ({title, back=true}) => (
    <View style={s.header}>
      {back ? <TouchableOpacity onPress={()=>setScreen(active?"dashboard":"farms")}><Text style={s.headerIcon}>‹</Text></TouchableOpacity> : <Text style={s.headerIcon}>☰</Text>}
      <Text style={s.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={()=>setLang(lang==="bn"?"en":"bn")}><Text style={s.langMini}>{lang==="bn"?"EN":"বাং"}</Text></TouchableOpacity>
    </View>
  );

  if (screen === "welcome") return (
    <SafeAreaView style={s.safe}><StatusBar style="dark"/>
      <ScrollView contentContainerStyle={s.welcome}>
        <Image source={require("./assets/logo.png")} style={s.logo}/>
        <Text style={s.appTitle}>{t.app}</Text><Text style={s.tag}>{t.tagline}</Text>
        <View style={s.langRow}><Text style={s.label}>{t.language}</Text><Switch value={lang==="en"} onValueChange={v=>setLang(v?"en":"bn")}/><Text>{lang==="bn"?t.bangla:t.english}</Text></View>
        <Btn title={`＋  ${t.newFarm}`} onPress={()=>setScreen("newFarm")}/>
        <Btn title={`👥  ${t.joinFarm}`} blue onPress={()=>setScreen("join")}/>
      </ScrollView>
    </SafeAreaView>
  );

  if (screen === "newFarm") return (
    <SafeAreaView style={s.safe}><Header title={t.newFarm}/>
      <View style={s.pad}><Text style={s.section}>{t.farmName}</Text>
        <TextInput style={s.input} value={farmName} onChangeText={setFarmName} placeholder={t.farmName}/>
        <Btn title={t.create} onPress={addFarm}/>
      </View>
    </SafeAreaView>
  );

  if (screen === "join") return (
    <SafeAreaView style={s.safe}><Header title={t.joinFarm}/>
      <View style={s.pad}><Text style={s.help}>{t.loginInfo}</Text>
        <TextInput style={s.input} placeholder={t.email}/><TextInput style={s.input} placeholder={t.password} secureTextEntry/>
        <Btn title={t.login} blue onPress={()=>Alert.alert("Cloud sync", "Backend account connection will be added in the sync stage.")}/>
      </View>
    </SafeAreaView>
  );

  if (screen === "farms") return (
    <SafeAreaView style={s.safe}><Header title={t.farms} back={false}/>
      <ScrollView contentContainerStyle={s.pad}>
        {farms.map(f=><TouchableOpacity key={f.id} onPress={()=>{setActiveId(f.id);setScreen("dashboard")}}>
          <Card><Text style={s.farmTitle}>🏡 {f.name}</Text><Text>{t.live}: {f.live}</Text></Card>
        </TouchableOpacity>)}
        <Btn title={`＋ ${t.addFarm}`} onPress={()=>setScreen("newFarm")}/>
      </ScrollView>
    </SafeAreaView>
  );

  if (!active) { setTimeout(()=>setScreen("welcome"),0); return null; }

  if (screen === "dashboard") return (
    <SafeAreaView style={s.safe}><Header title={active.name} back={false}/>
      <ScrollView contentContainerStyle={s.pad}>
        <View style={s.stats}>
          <Card style={[s.stat,{backgroundColor:"#E8FAEC"}]}><Text style={s.statIcon}>🐔</Text><Text style={s.statLabel}>{t.live}</Text><Text style={s.statNum}>{active.live}</Text></Card>
          <Card style={[s.stat,{backgroundColor:"#FFECEE"}]}><Text style={s.statIcon}>☠️</Text><Text style={[s.statLabel,{color:RED}]}>{t.dead}</Text><Text style={s.statNum}>{active.dead}</Text></Card>
          <Card style={[s.stat,{backgroundColor:"#EAF4FF"}]}><Text style={s.statIcon}>৳</Text><Text style={[s.statLabel,{color:BLUE}]}>{t.expense}</Text><Text style={s.statNum}>{money(active.expense)}</Text></Card>
        </View>
        <View style={s.grid}>
          {[
            ["chicken",t.addChicken,"🐥"],["feed",t.feed,"🧺"],["medicine",t.medicine,"💊"],
            ["other",t.other,"🧾"],["death",t.death,"☠️"],["sale",t.sales,"🛒"]
          ].map(([k,l,i])=><TouchableOpacity key={k} style={s.action} onPress={()=>setScreen(k)}><Text style={s.actionIcon}>{i}</Text><Text style={s.actionText}>{l}</Text></TouchableOpacity>)}
        </View>
        <Text style={s.section}>{t.currentBatch}</Text>
        {active.tx.length===0 ? <Text style={s.empty}>{t.empty}</Text> : active.tx.slice(0,30).map(tx=>
          <Card key={tx.id}><Text style={s.txTitle}>{typeLabel(tx.type)}</Text>
            <Text>{tx.at}</Text>
            {tx.qty>0 && <Text>{t.qty}: {tx.qty}</Text>}
            {tx.amount>0 && <Text>{t.total}: {money(tx.amount)}</Text>}
            {tx.photo && <Image source={{uri:tx.photo}} style={s.thumb}/>}
          </Card>)}
        <View style={s.bottomGap}/>
      </ScrollView>
      <View style={s.bottomNav}>
        <TouchableOpacity onPress={()=>setScreen("dashboard")}><Text style={s.navOn}>⌂{"\n"}{t.dashboard}</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen("history")}><Text style={s.nav}>◷{"\n"}{t.history}</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>setScreen("farms")}><Text style={s.nav}>▦{"\n"}{t.farms}</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (screen === "history") {
    const shown = historyFilter ? active.tx.filter(x=>x.day===historyFilter) : active.tx;
    return <SafeAreaView style={s.safe}><Header title={t.history}/>
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.label}>{t.searchDate}</Text>
        <TextInput style={s.input} placeholder="2026-09-10" value={historyFilter} onChangeText={setHistoryFilter}/>
        {shown.map(tx=><Card key={tx.id}><Text style={s.txTitle}>{typeLabel(tx.type)}</Text><Text>{tx.at}</Text>
          {tx.name ? <Text>{t.name}: {tx.name}</Text>:null}
          {tx.qty>0 ? <Text>{t.qty}: {tx.qty}</Text>:null}
          {tx.kg>0 ? <Text>{t.totalKg}: {tx.kg}</Text>:null}
          {tx.price>0 ? <Text>{t.price}: {money(tx.price)}</Text>:null}
          {tx.amount>0 ? <Text>{t.total}: {money(tx.amount)}</Text>:null}
          {tx.photo ? <Image source={{uri:tx.photo}} style={s.historyPhoto}/>:null}
        </Card>)}
      </ScrollView>
    </SafeAreaView>
  }

  const isSale = screen==="sale", isDeath=screen==="death", isOther=screen==="other";
  return (
    <SafeAreaView style={s.safe}><Header title={typeLabel(screen)}/>
      <ScrollView contentContainerStyle={s.pad}>
        {!isDeath && !isSale && !isOther && <><Text style={s.label}>{t.name}</Text><TextInput style={s.input} value={form.name} onChangeText={v=>setForm(x=>({...x,name:v}))}/></>}
        {!isOther && <><Text style={s.label}>{isSale?t.piecesSold:t.qty}</Text><TextInput keyboardType="numeric" style={s.input} value={form.qty} onChangeText={v=>setForm(x=>({...x,qty:v}))}/></>}
        {isSale && <><Text style={s.label}>{t.totalKg}</Text><TextInput keyboardType="numeric" style={s.input} value={form.kg} onChangeText={v=>setForm(x=>({...x,kg:v}))}/></>}
        {!isDeath && <><Text style={s.label}>{isSale?t.perKg:(isOther?t.total:t.price)}</Text><TextInput keyboardType="numeric" style={s.input} value={form.price} onChangeText={v=>setForm(x=>({...x,price:v}))}/></>}
        {isDeath && <><Btn title={`📷 ${t.photo}`} blue onPress={takePhoto}/>{form.photo&&<Image source={{uri:form.photo}} style={s.proof}/>}</>}
        <Text style={s.label}>{t.note}</Text><TextInput style={[s.input,{height:80}]} multiline value={form.note} onChangeText={v=>setForm(x=>({...x,note:v}))}/>
        {!isDeath && <Card style={{backgroundColor:"#E9FAEF"}}><Text style={s.totalText}>{t.total}: {money(isSale ? Number(form.kg||0)*Number(form.price||0) : isOther ? Number(form.price||0) : Number(form.qty||0)*Number(form.price||0))}</Text></Card>}
        <Btn title={t.save} onPress={()=>addTx(screen)}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#fff"}, welcome:{padding:24,alignItems:"center",backgroundColor:LIGHT,minHeight:"100%"},
  logo:{width:220,height:220,resizeMode:"contain",marginTop:25},appTitle:{fontSize:28,fontWeight:"900",color:"#066B37",textAlign:"center"},
  tag:{fontSize:16,color:"#355B47",marginTop:5,marginBottom:25},langRow:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:18},
  header:{height:58,backgroundColor:GREEN,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:15},
  headerTitle:{color:"#fff",fontWeight:"800",fontSize:20},headerIcon:{color:"#fff",fontSize:34},langMini:{color:"#fff",fontWeight:"800"},
  pad:{padding:16,paddingBottom:100},btn:{backgroundColor:GREEN,borderRadius:12,padding:15,alignItems:"center",marginVertical:8,width:"100%"},
  btnText:{color:"#fff",fontWeight:"800",fontSize:17},outlineBtn:{backgroundColor:"#fff",borderWidth:1,borderColor:GREEN},
  input:{borderWidth:1,borderColor:"#D5DDD8",borderRadius:10,padding:13,fontSize:16,marginBottom:13,backgroundColor:"#fff"},
  label:{fontWeight:"700",marginBottom:6,color:"#244C37"},section:{fontWeight:"900",fontSize:19,color:"#126B3D",marginVertical:12},
  help:{fontSize:15,color:"#5A6A61",marginBottom:18},card:{backgroundColor:"#fff",borderRadius:14,padding:14,marginBottom:10,borderWidth:1,borderColor:"#E4ECE7"},
  farmTitle:{fontSize:18,fontWeight:"800",color:"#145C36",marginBottom:5},stats:{flexDirection:"row",gap:8},
  stat:{flex:1,alignItems:"center",paddingHorizontal:5},statIcon:{fontSize:25},statLabel:{fontSize:12,fontWeight:"800",color:"#14733F",textAlign:"center"},
  statNum:{fontSize:16,fontWeight:"900",marginTop:5,textAlign:"center"},grid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginVertical:15},
  action:{width:"48%",borderWidth:1,borderColor:"#E0E9E3",borderRadius:14,padding:14,alignItems:"center",backgroundColor:"#fff"},
  actionIcon:{fontSize:28},actionText:{fontWeight:"800",color:"#28563C",textAlign:"center",marginTop:5},
  txTitle:{fontWeight:"900",color:"#126B3D",fontSize:16,marginBottom:4},empty:{textAlign:"center",color:"#7A8A81",padding:25},
  thumb:{width:65,height:65,borderRadius:8,marginTop:8},historyPhoto:{width:"100%",height:190,borderRadius:10,marginTop:10},
  proof:{width:"100%",height:230,borderRadius:12,marginVertical:10},totalText:{fontSize:19,fontWeight:"900",color:"#08753C"},
  bottomNav:{position:"absolute",bottom:0,left:0,right:0,height:72,backgroundColor:"#fff",borderTopWidth:1,borderColor:"#E2E7E4",
    flexDirection:"row",justifyContent:"space-around",alignItems:"center"},nav:{textAlign:"center",color:"#66746C"},navOn:{textAlign:"center",color:GREEN,fontWeight:"900"},
  bottomGap:{height:70}
});
