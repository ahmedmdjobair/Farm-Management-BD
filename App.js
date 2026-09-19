import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "farm_management_bd_v3";

const WELCOME_BACKGROUND = require("./assets/welcome-background.png");
const FARM_LIST_BACKGROUND = require("./assets/farm-list-background.png");
const DASHBOARD_BACKGROUND = require("./assets/dashboard-background.png");

const GREEN = "#087B43";
const DARK_GREEN = "#075B35";
const LIGHT_GREEN = "#EAF8F0";
const RED = "#D92D3A";
const BLUE = "#2563EB";
const ORANGE = "#B66A00";
const BORDER = "#E1E9E4";
const MUTED = "#69786F";
const BG = "#F7FAF8";

const emptyAuth = () => ({
  farmName: "",
  contact: "",
  password: "",
  confirmPassword: "",
});

const emptyForm = () => ({
  name: "",
  qty: "",
  price: "",
  kg: "",
  note: "",
  photo: null,
});

const makeId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const nowText = () => new Date().toLocaleString();

const money = (n) => `৳ ${Number(n || 0).toLocaleString()}`;

const bn = {
  app: "ফার্ম ম্যানেজমেন্ট বিডি",
  slogan: "আপনার ফার্ম, আপনার হিসাব",

  newFarm: "নতুন ফার্ম তৈরি করুন",
  joinFarm: "ফার্মে যোগ দিন",
  farmList: "আমার ফার্মসমূহ",

  farmName: "ফার্মের নাম",
  contact: "মোবাইল নম্বর অথবা ইমেইল",
  password: "পাসওয়ার্ড",
  confirmPassword: "পুনরায় পাসওয়ার্ড",

  signup: "সাইন আপ",
  login: "লগইন",

  otpTitle: "OTP যাচাই",
  otpText: "আপনার মোবাইল/ইমেইলে পাঠানো ৬ সংখ্যার OTP লিখুন",
  verifyOtp: "OTP যাচাই করুন",
  resendOtp: "OTP আবার পাঠান",

  dashboard: "ড্যাশবোর্ড",
  expense: "খরচ",
  sales: "বিক্রি",
  history: "ইতিহাস",
  more: "আরও",

  live: "জীবিত মুরগি",
  dead: "মৃত মুরগি",
  totalExpense: "মোট খরচ",

  currentTx: "বর্তমান ব্যাচের লেনদেন",
  noTx: "বর্তমান ব্যাচে এখনো কোনো লেনদেন নেই",

  addChicken: "নতুন মুরগি যোগ করুন",
  addDead: "মৃত মুরগি যোগ করুন",
  addFeed: "ফিড যোগ করুন",
  addMedicine: "ওষুধ যোগ করুন",
  addOther: "অন্যান্য খরচ যোগ করুন",

  qty: "পরিমাণ / পিস",
  bags: "বস্তা সংখ্যা",
  pricePiece: "প্রতি পিস দাম",
  priceBag: "প্রতি বস্তা দাম",
  priceUnit: "প্রতি ইউনিট দাম",
  name: "নাম",
  amount: "টাকার পরিমাণ",
  note: "মন্তব্য (ঐচ্ছিক)",

  takePhoto: "ছবি তুলুন",
  save: "সংরক্ষণ করুন",
  saveMore: "সংরক্ষণ করে আরও যোগ করুন",

  soldPieces: "বিক্রি করা মুরগির সংখ্যা",
  totalKg: "মোট ওজন (কেজি)",
  perKg: "প্রতি কেজির দাম",
  totalSales: "মোট বিক্রি",
  profitLoss: "লাভ / লস",
  addSale: "নতুন বিক্রি যোগ করুন",

  dateSearch: "তারিখ দিয়ে খুঁজুন",
  showAll: "সব দেখুন",

  farms: "ফার্মসমূহ",
  addFarm: "নতুন ফার্ম যোগ করুন",
  language: "ভাষা",

  batch: "ব্যাচ",
  batchEnded: "বর্তমান ব্যাচ শেষ",
  batchEndedText:
    "নতুন মুরগি যোগ করলে নতুন ব্যাচ শুরু হবে। পুরনো হিসাব ইতিহাসে থাকবে।",

  total: "মোট",
};

const en = {
  ...bn,

  app: "Farm Management BD",
  slogan: "Your farm, your accounts",

  newFarm: "Create New Farm",
  joinFarm: "Join Farm",
  farmList: "My Farms",

  farmName: "Farm Name",
  contact: "Phone Number or Email",
  password: "Password",
  confirmPassword: "Confirm Password",

  signup: "Sign Up",
  login: "Login",

  otpTitle: "OTP Verification",
  otpText: "Enter the 6-digit OTP sent to your phone/email",
  verifyOtp: "Verify OTP",
  resendOtp: "Resend OTP",

  dashboard: "Dashboard",
  expense: "Expense",
  sales: "Sales",
  history: "History",
  more: "More",

  live: "Live Chicken",
  dead: "Dead Chicken",
  totalExpense: "Total Expense",

  currentTx: "Current Batch Transactions",
  noTx: "No transactions in the current batch",

  addChicken: "Add Chicken",
  addDead: "Add Dead Chicken",
  addFeed: "Add Feed",
  addMedicine: "Add Medicine",
  addOther: "Other Expense",

  qty: "Quantity / Pieces",
  bags: "Number of Bags",
  pricePiece: "Price Per Piece",
  priceBag: "Price Per Bag",
  priceUnit: "Price Per Unit",
  name: "Name",
  amount: "Amount",
  note: "Note (Optional)",

  takePhoto: "Take Photo",
  save: "Save",
  saveMore: "Save & Add More",

  soldPieces: "Chicken Pieces Sold",
  totalKg: "Total Weight (kg)",
  perKg: "Price Per kg",
  totalSales: "Total Sales",
  profitLoss: "Profit / Loss",
  addSale: "Add Sale",

  dateSearch: "Search by Date",
  showAll: "Show All",

  farms: "Farms",
  addFarm: "Add New Farm",
  language: "Language",

  batch: "Batch",
  batchEnded: "Current Batch Ended",
  batchEndedText:
    "Adding new chickens starts a new batch. Old records remain in History.",

  total: "Total",
};

export default function App() {
  const [lang, setLang] = useState("bn");
  const t = lang === "bn" ? bn : en;

  const [loaded, setLoaded] = useState(false);

  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);

  const [screen, setScreen] = useState("loading");
  const screenRef = useRef("loading");

  const [backStack, setBackStack] = useState([]);

  const [auth, setAuth] = useState(emptyAuth());
  const [pendingAuth, setPendingAuth] = useState(null);
  const [otp, setOtp] = useState("");

  const [entryType, setEntryType] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [historyDate, setHistoryDate] = useState("");

  const [photoViewer, setPhotoViewer] = useState(null);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        farms,
        lang,
      })
    ).catch(() => {});
  }, [farms, lang, loaded]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const current = screenRef.current;

        if (current === "welcome" || current === "farmList") {
          return false;
        }

        goBack();
        return true;
      }
    );

    return () => subscription.remove();
  }, [farms, activeFarmId]);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setScreen("welcome");
        setLoaded(true);
        return;
      }

      const saved = JSON.parse(raw);

      const savedFarms = Array.isArray(saved.farms)
        ? saved.farms
        : [];

      setFarms(savedFarms);

      if (saved.lang) {
        setLang(saved.lang);
      }

      if (savedFarms.length > 0) {
        setScreen("farmList");
      } else {
        setScreen("welcome");
      }
    } catch {
      setScreen("welcome");
    } finally {
      setLoaded(true);
    }
  };

  const activeFarm = useMemo(() => {
    return farms.find((f) => f.id === activeFarmId) || null;
  }, [farms, activeFarmId]);

  const navigate = (nextScreen) => {
    setBackStack((old) => [...old, screenRef.current]);
    setScreen(nextScreen);
  };

  const goBack = () => {
    setBackStack((old) => {
      if (old.length > 0) {
        const copy = [...old];
        const previous = copy.pop();

        setScreen(previous);

        return copy;
      }

      if (activeFarmId) {
        setScreen("dashboard");
      } else if (farms.length > 0) {
        setScreen("farmList");
      } else {
        setScreen("welcome");
      }

      return old;
    });
  };

  const resetAuth = () => {
    setAuth(emptyAuth());
    setPendingAuth(null);
    setOtp("");
  };

  const openFarm = (farmId) => {
    setActiveFarmId(farmId);
    setBackStack([]);
    setHistoryDate("");
    setScreen("dashboard");
  };

  const updateFarm = (farmId, callback) => {
    setFarms((old) =>
      old.map((farm) =>
        farm.id === farmId ? callback(farm) : farm
      )
    );
  };

  const sendTestOtp = (data) => {
    const code = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    setPendingAuth({
      ...data,
      otp: code,
    });

    setOtp("");

    navigate("otp");

    setTimeout(() => {
      Alert.alert(
        "OTP Test Mode",
        `Real SMS/Gmail OTP service এখনো connect করা হয়নি।

Test OTP: ${code}`
      );
    }, 200);
  };

  const createFarmRequest = () => {
    const farmName = auth.farmName.trim();
    const contact = auth.contact.trim();

    if (
      !farmName ||
      !contact ||
      !auth.password ||
      !auth.confirmPassword
    ) {
      Alert.alert(
        "অসম্পূর্ণ",
        "সবগুলো ঘর পূরণ করুন।"
      );
      return;
    }

    if (auth.password !== auth.confirmPassword) {
      Alert.alert(
        "পাসওয়ার্ড মিলছে না",
        "দুইটি পাসওয়ার্ড একই হতে হবে।"
      );
      return;
    }

    sendTestOtp({
      mode: "create",
      farmName,
      contact,
      password: auth.password,
    });
  };

  const joinFarmRequest = () => {
    const contact = auth.contact.trim();
    const password = auth.password;

    if (!contact || !password) {
      Alert.alert(
        "অসম্পূর্ণ",
        "মোবাইল/ইমেইল এবং পাসওয়ার্ড দিন।"
      );
      return;
    }

    const found = farms.find(
      (farm) =>
        String(farm.contact || "").toLowerCase() ===
          contact.toLowerCase() &&
        farm.password === password
    );

    if (!found) {
      Alert.alert(
        "ফার্ম পাওয়া যায়নি",
        "এই ডিভাইসে এই তথ্যের ফার্ম পাওয়া যায়নি। অন্য ফোন থেকে সত্যিকারের Join করার জন্য cloud backend লাগবে।"
      );
      return;
    }

    sendTestOtp({
      mode: "join",
      farmId: found.id,
      contact,
    });
  };

  const verifyOtp = () => {
    if (!pendingAuth) return;

    if (otp.trim() !== pendingAuth.otp) {
      Alert.alert(
        "OTP ভুল",
        "সঠিক OTP দিন।"
      );
      return;
    }

    if (pendingAuth.mode === "create") {
      const newFarm = {
        id: makeId(),

        name: pendingAuth.farmName,
        contact: pendingAuth.contact,
        password: pendingAuth.password,

        live: 0,
        dead: 0,
        expense: 0,
        sales: 0,

        batchNo: 0,
        currentBatchId: null,

        history: [],

        createdAt: nowText(),
      };

      setFarms((old) => [...old, newFarm]);

      resetAuth();

      setActiveFarmId(newFarm.id);
      setBackStack([]);
      setScreen("dashboard");

      return;
    }

    if (pendingAuth.mode === "join") {
      const id = pendingAuth.farmId;

      resetAuth();

      openFarm(id);
    }
  };

  const resendOtp = () => {
    if (!pendingAuth) return;

    const newOtp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    setPendingAuth((old) => ({
      ...old,
      otp: newOtp,
    }));

    setOtp("");

    Alert.alert(
      "OTP Test Mode",
      `New Test OTP: ${newOtp}`
    );
  };

  const openEntry = (type) => {
    setEntryType(type);
    setForm(emptyForm());
    navigate("entry");
  };

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission",
        "ছবি তুলতে Camera permission দিতে হবে।"
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });

    if (!result.canceled) {
      setForm((old) => ({
        ...old,
        photo: result.assets[0].uri,
      }));
    }
  };

  const saveTransaction = (keepOpen = false) => {
    if (!activeFarm) return;

    const qty = Number(form.qty || 0);
    const price = Number(form.price || 0);
    const kg = Number(form.kg || 0);

    if (
      entryType !== "other" &&
      qty <= 0
    ) {
      Alert.alert(
        "পরিমাণ",
        "সঠিক পরিমাণ দিন।"
      );
      return;
    }

    if (
      ["chicken", "feed", "medicine"].includes(
        entryType
      ) &&
      price <= 0
    ) {
      Alert.alert(
        "দাম",
        "সঠিক দাম দিন।"
      );
      return;
    }

    if (
      entryType === "other" &&
      (!form.name.trim() || price <= 0)
    ) {
      Alert.alert(
        "খরচ",
        "খরচের নাম এবং টাকার পরিমাণ দিন।"
      );
      return;
    }

    if (
      entryType === "sale" &&
      (qty <= 0 || kg <= 0 || price <= 0)
    ) {
      Alert.alert(
        "বিক্রি",
        "পিস, কেজি এবং প্রতি কেজি দাম দিন।"
      );
      return;
    }

    if (
      ["death", "sale"].includes(entryType) &&
      qty > activeFarm.live
    ) {
      Alert.alert(
        "পরিমাণ বেশি",
        `বর্তমানে জীবিত মুরগি ${activeFarm.live}টি।`
      );
      return;
    }

    if (
      entryType !== "chicken" &&
      !activeFarm.currentBatchId
    ) {
      Alert.alert(
        "ব্যাচ নেই",
        "আগে নতুন মুরগি যোগ করে একটি ব্যাচ শুরু করুন।"
      );
      return;
    }

    updateFarm(activeFarm.id, (farm) => {
      let live = Number(farm.live || 0);
      let dead = Number(farm.dead || 0);
      let expense = Number(farm.expense || 0);
      let sales = Number(farm.sales || 0);

      let batchNo = Number(farm.batchNo || 0);
      let batchId = farm.currentBatchId;

      if (
        entryType === "chicken" &&
        !batchId
      ) {
        batchNo += 1;
        batchId = `batch_${batchNo}_${Date.now()}`;

        live = 0;
        dead = 0;
        expense = 0;
        sales = 0;
      }

      let amount = 0;

      if (entryType === "chicken") {
        amount = qty * price;
        live += qty;
        expense += amount;
      }

      if (entryType === "feed") {
        amount = qty * price;
        expense += amount;
      }

      if (entryType === "medicine") {
        amount = qty * price;
        expense += amount;
      }

      if (entryType === "other") {
        amount = price;
        expense += amount;
      }

      if (entryType === "death") {
        live -= qty;
        dead += qty;
      }

      if (entryType === "sale") {
        amount = kg * price;
        live -= qty;
        sales += amount;
      }

      const transaction = {
        id: makeId(),

        type: entryType,

        name: form.name.trim(),

        qty,
        price,
        kg,
        amount,

        note: form.note.trim(),

        photo: form.photo,

        day: today(),
        time: nowText(),

        batchNo,
        batchId,
      };

      const batchEnded =
        batchId &&
        live === 0 &&
        ["death", "sale"].includes(
          entryType
        );

      return {
        ...farm,

        live: batchEnded ? 0 : live,
        dead: batchEnded ? 0 : dead,
        expense: batchEnded ? 0 : expense,
        sales: batchEnded ? 0 : sales,

        batchNo,
        currentBatchId: batchEnded
          ? null
          : batchId,

        history: [
          transaction,
          ...(farm.history || []),
        ],
      };
    });

    setForm(emptyForm());

    if (keepOpen) {
      return;
    }

    setBackStack([]);

    if (entryType === "sale") {
      setScreen("sales");
    } else {
      setScreen("expense");
    }
  };

  const txTitle = (type) => {
    if (type === "chicken") return t.addChicken;
    if (type === "death") return t.addDead;
    if (type === "feed") return t.addFeed;
    if (type === "medicine") return t.addMedicine;
    if (type === "other") return t.addOther;
    if (type === "sale") return t.sales;

    return type;
  };

  const currentTransactions = useMemo(() => {
    if (!activeFarm?.currentBatchId) {
      return [];
    }

    return (activeFarm.history || []).filter(
      (tx) =>
        tx.batchId ===
        activeFarm.currentBatchId
    );
  }, [activeFarm]);

  const historyTransactions = useMemo(() => {
    if (!activeFarm) return [];

    const all = activeFarm.history || [];

    if (!historyDate.trim()) {
      return all;
    }

    return all.filter(
      (tx) =>
        tx.day === historyDate.trim()
    );
  }, [activeFarm, historyDate]);

  const Header = ({
    title,
    back = true,
    right = null,
  }) => {
    return (
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {back ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBlank} />
          )}
        </View>

        <Text
          numberOfLines={1}
          style={styles.headerTitle}
        >
          {title}
        </Text>

        <View
          style={[
            styles.headerSide,
            { alignItems: "flex-end" },
          ]}
        >
          {right || (
            <View style={styles.headerBlank} />
          )}
        </View>
      </View>
    );
  };

  const Button = ({
    title,
    onPress,
    secondary = false,
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          secondary &&
            styles.buttonSecondary,
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.buttonText,
            secondary && {
              color: GREEN,
            },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const BottomNav = ({ active }) => {
    const tabs = [
      ["dashboard", "⌂", t.dashboard],
      ["expense", "৳", t.expense],
      ["sales", "⇄", t.sales],
      ["history", "◷", t.history],
      ["more", "•••", t.more],
    ];

    return (
      <View style={styles.bottomNav}>
        {tabs.map(
          ([key, icon, label]) => (
            <TouchableOpacity
              key={key}
              style={styles.navItem}
              onPress={() => {
                setBackStack([]);
                setScreen(key);
              }}
            >
              <Text
                style={[
                  styles.navIcon,
                  active === key &&
                    styles.navActive,
                ]}
              >
                {icon}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.navLabel,
                  active === key &&
                    styles.navActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };

  const MainScreen = ({
    tab,
    title,
    children,
  }) => {
    return (
      <ImageBackground
        source={DASHBOARD_BACKGROUND}
        style={styles.safe}
      >
        <StatusBar style="light" />

        <Header
          title={title}
          back={false}
        />

        <ScrollView
          contentContainerStyle={
            styles.mainContent
          }
        >
          {children}
        </ScrollView>

        <BottomNav active={tab} />
      </ImageBackground>
    );
  };

  const StatCard = ({
    icon,
    label,
    value,
    tone,
  }) => {
    return (
      <View
        style={[
          styles.statCard,
          tone === "red" &&
            styles.statRed,
          tone === "blue" &&
            styles.statBlue,
        ]}
      >
        <Text style={styles.statIcon}>
          {icon}
        </Text>

        <Text
          style={[
            styles.statLabel,
            tone === "red" && {
              color: RED,
            },
            tone === "blue" && {
              color: BLUE,
            },
          ]}
        >
          {label}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>
      </View>
    );
  };

  const TransactionCard = ({ tx }) => {
    return (
      <View style={styles.txCard}>
        <View style={styles.txTop}>
          <Text style={styles.txTitle}>
            {txTitle(tx.type)}
          </Text>

          <Text style={styles.batchPill}>
            {t.batch} {tx.batchNo}
          </Text>
        </View>

        <Text style={styles.txTime}>
          {tx.time}
        </Text>

        {tx.name ? (
          <Text style={styles.txText}>
            {t.name}: {tx.name}
          </Text>
        ) : null}

        {tx.qty > 0 ? (
          <Text style={styles.txText}>
            {t.qty}: {tx.qty}
          </Text>
        ) : null}

        {tx.kg > 0 ? (
          <Text style={styles.txText}>
            {t.totalKg}: {tx.kg}
          </Text>
        ) : null}

        {tx.price > 0 ? (
          <Text style={styles.txText}>
            দাম: {money(tx.price)}
          </Text>
        ) : null}

        {tx.amount > 0 ? (
          <Text style={styles.txAmount}>
            {t.total}:{" "}
            {money(tx.amount)}
          </Text>
        ) : null}

        {tx.note ? (
          <Text style={styles.txNote}>
            {tx.note}
          </Text>
        ) : null}

        {tx.photo ? (
          <TouchableOpacity
            onPress={() =>
              setPhotoViewer(tx.photo)
            }
          >
            <Image
              source={{ uri: tx.photo }}
              style={styles.txPhoto}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (screen === "loading") {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          styles.center,
        ]}
      >
        <StatusBar style="dark" />

        <Image
          source={require("./assets/logo.png")}
          style={styles.loadingLogo}
        />

        <Text style={styles.muted}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  if (screen === "welcome") {
    return (
      <ImageBackground
        source={WELCOME_BACKGROUND}
        style={styles.safe}
      >
        <StatusBar style="dark" />

        <ScrollView
          contentContainerStyle={
            styles.welcome
          }
        >
          <Image
            source={require("./assets/logo.png")}
            style={styles.logo}
          />

          <Text style={styles.appName}>
            {t.app}
          </Text>

          <Text style={styles.slogan}>
            {t.slogan}
          </Text>

          <View style={styles.languageRow}>
            <Text style={styles.languageText}>
              বাংলা
            </Text>

            <Switch
              value={lang === "en"}
              onValueChange={(value) =>
                setLang(
                  value ? "en" : "bn"
                )
              }
            />

            <Text style={styles.languageText}>
              English
            </Text>
          </View>

          <Button
            title={`＋  ${t.newFarm}`}
            onPress={() => {
              resetAuth();
              navigate("createFarm");
            }}
          />

          <Button
            title={`👥  ${t.joinFarm}`}
            secondary
            onPress={() => {
              resetAuth();
              navigate("joinFarm");
            }}
          />
        </ScrollView>
      </ImageBackground>
    );
  }

  if (screen === "createFarm") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />

        <Header title={t.newFarm} />

        <ScrollView
          contentContainerStyle={
            styles.formContent
          }
        >
          <Text style={styles.label}>
            {t.farmName}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.farmName}
            placeholder={t.farmName}
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                farmName: value,
              }))
            }
          />

          <Text style={styles.label}>
            {t.contact}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.contact}
            placeholder={t.contact}
            autoCapitalize="none"
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                contact: value,
              }))
            }
          />

          <Text style={styles.label}>
            {t.password}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.password}
            placeholder={t.password}
            secureTextEntry
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                password: value,
              }))
            }
          />

          <Text style={styles.label}>
            {t.confirmPassword}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.confirmPassword}
            placeholder={
              t.confirmPassword
            }
            secureTextEntry
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                confirmPassword: value,
              }))
            }
          />

          <Button
            title={t.signup}
            onPress={createFarmRequest}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "joinFarm") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />

        <Header title={t.joinFarm} />

        <ScrollView
          contentContainerStyle={
            styles.formContent
          }
        >
          <Text style={styles.label}>
            {t.contact}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.contact}
            placeholder={t.contact}
            autoCapitalize="none"
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                contact: value,
              }))
            }
          />

          <Text style={styles.label}>
            {t.password}
          </Text>

          <TextInput
            style={styles.input}
            value={auth.password}
            placeholder={t.password}
            secureTextEntry
            onChangeText={(value) =>
              setAuth((old) => ({
                ...old,
                password: value,
              }))
            }
          />

          <Button
            title={t.login}
            onPress={joinFarmRequest}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "otp") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />

        <Header title={t.otpTitle} />

        <View style={styles.otpPage}>
          <Text style={styles.otpIcon}>
            ✉️
          </Text>

          <Text style={styles.otpTitle}>
            {t.otpTitle}
          </Text>

          <Text style={styles.otpText}>
            {t.otpText}
          </Text>

          <Text style={styles.otpContact}>
            {pendingAuth?.contact}
          </Text>

          <TextInput
            style={styles.otpInput}
            value={otp}
            maxLength={6}
            keyboardType="number-pad"
            placeholder="000000"
            textAlign="center"
            onChangeText={(value) =>
              setOtp(
                value
                  .replace(
                    /[^0-9]/g,
                    ""
                  )
                  .slice(0, 6)
              )
            }
          />

          <Button
            title={t.verifyOtp}
            onPress={verifyOtp}
          />

          <TouchableOpacity
            onPress={resendOtp}
          >
            <Text style={styles.link}>
              {t.resendOtp}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "farmList") {
    return (
      <ImageBackground
        source={FARM_LIST_BACKGROUND}
        style={styles.safe}
      >
        <StatusBar style="light" />

        <Header
          title={t.farmList}
          back={false}
          right={
            <TouchableOpacity
              onPress={() =>
                setLang(
                  lang === "bn"
                    ? "en"
                    : "bn"
                )
              }
            >
              <Text
                style={
                  styles.headerLanguage
                }
              >
                {lang === "bn"
                  ? "EN"
                  : "বাং"}
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={
            styles.farmListContent
          }
        >
          {farms.map((farm) => (
            <TouchableOpacity
              key={farm.id}
              style={styles.farmCard}
              onPress={() =>
                openFarm(farm.id)
              }
            >
              <View
                style={styles.farmIcon}
              >
                <Text
                  style={{
                    fontSize: 25,
                  }}
                >
                  🏡
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={
                    styles.farmCardName
                  }
                >
                  {farm.name}
                </Text>

                <Text
                  style={
                    styles.farmMeta
                  }
                >
                  {farm.contact}
                </Text>

                <Text
                  style={
                    styles.farmMeta
                  }
                >
                  {t.live}:{" "}
                  {farm.live}
                </Text>
              </View>

              <Text
                style={styles.chevron}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}

          {farms.length === 0 ? (
            <Text
              style={styles.empty}
            >
              এখনো কোনো ফার্ম নেই
            </Text>
          ) : null}

          <Button
            title={`＋  ${t.addFarm}`}
            onPress={() => {
              resetAuth();
              navigate("createFarm");
            }}
          />

          <Button
            title={`👥  ${t.joinFarm}`}
            secondary
            onPress={() => {
              resetAuth();
              navigate("joinFarm");
            }}
          />
        </ScrollView>
      </ImageBackground>
    );
  }

  if (!activeFarm) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          styles.center,
        ]}
      >
        <Button
          title={t.farmList}
          onPress={() =>
            setScreen(
              farms.length
                ? "farmList"
                : "welcome"
            )
          }
        />
      </SafeAreaView>
    );
  }

  if (screen === "dashboard") {
    return (
      <MainScreen
        tab="dashboard"
        title={activeFarm.name}
      >
        <View style={styles.statsRow}>
          <StatCard
            icon="🐔"
            label={t.live}
            value={activeFarm.live}
          />

          <StatCard
            icon="☠️"
            label={t.dead}
            value={activeFarm.dead}
            tone="red"
          />

          <StatCard
            icon="৳"
            label={t.totalExpense}
            value={money(
              activeFarm.expense
            )}
            tone="blue"
          />
        </View>

        {!activeFarm.currentBatchId &&
        activeFarm.batchNo > 0 ? (
          <View
            style={
              styles.batchEndedCard
            }
          >
            <Text
              style={
                styles.batchEndedTitle
              }
            >
              ✓ {t.batchEnded}
            </Text>

            <Text
              style={
                styles.batchEndedText
              }
            >
              {t.batchEndedText}
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.currentTx}
          </Text>

          {activeFarm.currentBatchId ? (
            <Text
              style={
                styles.batchBadge
              }
            >
              {t.batch}{" "}
              {activeFarm.batchNo}
            </Text>
          ) : null}
        </View>

        {currentTransactions.length >
        0 ? (
          currentTransactions.map(
            (tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
              />
            )
          )
        ) : (
          <Text style={styles.empty}>
            {t.noTx}
          </Text>
        )}
      </MainScreen>
    );
  }

  if (screen === "expense") {
    const menu = [
      [
        "chicken",
        "🐥",
        t.addChicken,
      ],
      [
        "death",
        "☠️",
        t.addDead,
      ],
      [
        "feed",
        "🧺",
        t.addFeed,
      ],
      [
        "medicine",
        "💊",
        t.addMedicine,
      ],
      [
        "other",
        "🧾",
        t.addOther,
      ],
    ];

    return (
      <MainScreen
        tab="expense"
        title={t.expense}
      >
        <Text
          style={styles.pageTitle}
        >
          খরচের ধরন নির্বাচন করুন
        </Text>

        {menu.map(
          ([type, icon, title]) => (
            <TouchableOpacity
              key={type}
              style={
                styles.menuCard
              }
              onPress={() =>
                openEntry(type)
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text
                  style={{
                    fontSize: 25,
                  }}
                >
                  {icon}
                </Text>
              </View>

              <Text
                style={
                  styles.menuTitle
                }
              >
                {title}
              </Text>

              <Text
                style={
                  styles.chevron
                }
              >
                ›
              </Text>
            </TouchableOpacity>
          )
        )}
      </MainScreen>
    );
  }

  if (screen === "sales") {
    const profit =
      Number(activeFarm.sales || 0) -
      Number(
        activeFarm.expense || 0
      );

    const salesList =
      currentTransactions.filter(
        (tx) => tx.type === "sale"
      );

    return (
      <MainScreen
        tab="sales"
        title={t.sales}
      >
        <View
          style={
            styles.salesSummary
          }
        >
          <View
            style={
              styles.salesSummaryCard
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              {t.totalSales}
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {money(
                activeFarm.sales
              )}
            </Text>
          </View>

          <View
            style={
              styles.salesSummaryCard
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              {t.profitLoss}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    profit >= 0
                      ? GREEN
                      : RED,
                },
              ]}
            >
              {money(profit)}
            </Text>
          </View>
        </View>

        <Button
          title={`＋  ${t.addSale}`}
          onPress={() =>
            openEntry("sale")
          }
        />

        <Text
          style={styles.sectionTitle}
        >
          বর্তমান ব্যাচের বিক্রি
        </Text>

        {salesList.length > 0 ? (
          salesList.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
            />
          ))
        ) : (
          <Text style={styles.empty}>
            এখনো কোনো বিক্রি নেই
          </Text>
        )}
      </MainScreen>
    );
  }

  if (screen === "history") {
    return (
      <MainScreen
        tab="history"
        title={t.history}
      >
        <Text style={styles.label}>
          {t.dateSearch}
        </Text>

        <View
          style={
            styles.historySearch
          }
        >
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
              },
            ]}
            value={historyDate}
            placeholder="2026-09-18"
            onChangeText={
              setHistoryDate
            }
          />

          <TouchableOpacity
            style={
              styles.showAllButton
            }
            onPress={() =>
              setHistoryDate("")
            }
          >
            <Text
              style={
                styles.showAllText
              }
            >
              {t.showAll}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={styles.recordCount}
        >
          মোট রেকর্ড:{" "}
          {
            historyTransactions.length
          }
        </Text>

        {historyTransactions.length >
        0 ? (
          historyTransactions.map(
            (tx) => (
              <TransactionCard
                key={tx.id}
                tx={tx}
              />
            )
          )
        ) : (
          <Text style={styles.empty}>
            এই তারিখে কোনো লেনদেন
            পাওয়া যায়নি
          </Text>
        )}
      </MainScreen>
    );
  }

  if (screen === "more") {
    return (
      <MainScreen
        tab="more"
        title={t.more}
      >
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => {
            setActiveFarmId(null);
            setBackStack([]);
            setScreen("farmList");
          }}
        >
          <View
            style={styles.menuIcon}
          >
            <Text
              style={{ fontSize: 25 }}
            >
              🏡
            </Text>
          </View>

          <Text
            style={styles.menuTitle}
          >
            {t.farms}
          </Text>

          <Text
            style={styles.chevron}
          >
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => {
            resetAuth();
            navigate("createFarm");
          }}
        >
          <View
            style={styles.menuIcon}
          >
            <Text
              style={{ fontSize: 25 }}
            >
              ＋
            </Text>
          </View>

          <Text
            style={styles.menuTitle}
          >
            {t.addFarm}
          </Text>

          <Text
            style={styles.chevron}
          >
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => {
            resetAuth();
            navigate("joinFarm");
          }}
        >
          <View
            style={styles.menuIcon}
          >
            <Text
              style={{ fontSize: 25 }}
            >
              👥
            </Text>
          </View>

          <Text
            style={styles.menuTitle}
          >
            {t.joinFarm}
          </Text>

          <Text
            style={styles.chevron}
          >
            ›
          </Text>
        </TouchableOpacity>

        <View
          style={styles.settingsCard}
        >
          <View>
            <Text
              style={styles.menuTitle}
            >
              {t.language}
            </Text>

            <Text
              style={styles.muted}
            >
              {lang === "bn"
                ? "বাংলা"
                : "English"}
            </Text>
          </View>

          <Switch
            value={lang === "en"}
            onValueChange={(value) =>
              setLang(
                value ? "en" : "bn"
              )
            }
          />
        </View>
      </MainScreen>
    );
  }

  if (screen === "entry") {
    const isSale =
      entryType === "sale";

    const isDeath =
      entryType === "death";

    const isOther =
      entryType === "other";

    const isFeed =
      entryType === "feed";

    const total = isSale
      ? Number(form.kg || 0) *
        Number(form.price || 0)
      : isOther
      ? Number(form.price || 0)
      : isDeath
      ? 0
      : Number(form.qty || 0) *
        Number(form.price || 0);

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />

        <Header
          title={txTitle(
            entryType
          )}
        />

        <ScrollView
          contentContainerStyle={
            styles.formContent
          }
        >
          {!isSale &&
          !isDeath &&
          !isOther &&
          entryType !== "chicken" ? (
            <>
              <Text
                style={styles.label}
              >
                {t.name}
              </Text>

              <TextInput
                style={styles.input}
                value={form.name}
                placeholder={
                  entryType === "feed"
                    ? "ফিডের নাম"
                    : "ওষুধের নাম"
                }
                onChangeText={(
                  value
                ) =>
                  setForm(
                    (old) => ({
                      ...old,
                      name: value,
                    })
                  )
                }
              />
            </>
          ) : null}

          {isOther ? (
            <>
              <Text
                style={styles.label}
              >
                খরচের নাম
              </Text>

              <TextInput
                style={styles.input}
                value={form.name}
                placeholder="খরচের নাম"
                onChangeText={(
                  value
                ) =>
                  setForm(
                    (old) => ({
                      ...old,
                      name: value,
                    })
                  )
                }
              />
            </>
          ) : null}

          {!isOther ? (
            <>
              <Text
                style={styles.label}
              >
                {isSale
                  ? t.soldPieces
                  : isFeed
                  ? t.bags
                  : t.qty}
              </Text>

              <TextInput
                style={styles.input}
                value={form.qty}
                keyboardType="number-pad"
                placeholder="0"
                onChangeText={(
                  value
                ) =>
                  setForm(
                    (old) => ({
                      ...old,
                      qty: value,
                    })
                  )
                }
              />
            </>
          ) : null}

          {isSale ? (
            <>
              <Text
                style={styles.label}
              >
                {t.totalKg}
              </Text>

              <TextInput
                style={styles.input}
                value={form.kg}
                keyboardType="decimal-pad"
                placeholder="0"
                onChangeText={(
                  value
                ) =>
                  setForm(
                    (old) => ({
                      ...old,
                      kg: value,
                    })
                  )
                }
              />
            </>
          ) : null}

          {!isDeath ? (
            <>
              <Text
                style={styles.label}
              >
                {isSale
                  ? t.perKg
                  : isOther
                  ? t.amount
                  : isFeed
                  ? t.priceBag
                  : entryType ===
                    "chicken"
                  ? t.pricePiece
                  : t.priceUnit}
              </Text>

              <TextInput
                style={styles.input}
                value={form.price}
                keyboardType="decimal-pad"
                placeholder="0"
                onChangeText={(
                  value
                ) =>
                  setForm(
                    (old) => ({
                      ...old,
                      price: value,
                    })
                  )
                }
              />
            </>
          ) : null}

          {isDeath ? (
            <>
              <Button
                title={`📷  ${t.takePhoto}`}
                secondary
                onPress={takePhoto}
              />

              {form.photo ? (
                <TouchableOpacity
                  onPress={() =>
                    setPhotoViewer(
                      form.photo
                    )
                  }
                >
                  <Image
                    source={{
                      uri: form.photo,
                    }}
                    style={
                      styles.proofPhoto
                    }
                  />
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          <Text style={styles.label}>
            {t.note}
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.noteInput,
            ]}
            value={form.note}
            multiline
            placeholder={t.note}
            onChangeText={(value) =>
              setForm((old) => ({
                ...old,
                note: value,
              }))
            }
          />

          {!isDeath ? (
            <View
              style={
                styles.totalCard
              }
            >
              <Text
                style={
                  styles.totalLabel
                }
              >
                {t.total}
              </Text>

              <Text
                style={
                  styles.totalValue
                }
              >
                {money(total)}
              </Text>
            </View>
          ) : null}

          <Button
            title={t.save}
            onPress={() =>
              saveTransaction(false)
            }
          />

          {[
            "feed",
            "medicine",
            "other",
          ].includes(entryType) ? (
            <Button
              title={t.saveMore}
              secondary
              onPress={() =>
                saveTransaction(true)
              }
            />
          ) : null}
        </ScrollView>

        <Modal
          visible={!!photoViewer}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setPhotoViewer(null)
          }
        >
          <View
            style={
              styles.photoModal
            }
          >
            <TouchableOpacity
              style={
                styles.photoClose
              }
              onPress={() =>
                setPhotoViewer(null)
              }
            >
              <Text
                style={
                  styles.photoCloseText
                }
              >
                ✕
              </Text>
            </TouchableOpacity>

            {photoViewer ? (
              <Image
                source={{
                  uri: photoViewer,
                }}
                style={
                  styles.fullPhoto
                }
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <>
      <View />

      <Modal
        visible={!!photoViewer}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPhotoViewer(null)
        }
      >
        <View style={styles.photoModal}>
          <TouchableOpacity
            style={styles.photoClose}
            onPress={() =>
              setPhotoViewer(null)
            }
          >
            <Text
              style={
                styles.photoCloseText
              }
            >
              ✕
            </Text>
          </TouchableOpacity>

          {photoViewer ? (
            <Image
              source={{
                uri: photoViewer,
              }}
              style={styles.fullPhoto}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop:
      RNStatusBar.currentHeight || 0,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },

  muted: {
    color: MUTED,
  },

  welcome: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(243, 255, 247, 0.86)",
  },

  logo: {
    width: 215,
    height: 215,
    resizeMode: "contain",
  },

  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: DARK_GREEN,
    textAlign: "center",
    marginTop: 8,
  },

  slogan: {
    fontSize: 16,
    color: "#486554",
    marginTop: 7,
    marginBottom: 25,
  },

  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  languageText: {
    fontWeight: "700",
    color: DARK_GREEN,
    marginHorizontal: 8,
  },

  header: {
    height: 58,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerSide: {
    width: 48,
    justifyContent: "center",
  },

  headerBlank: {
    width: 40,
    height: 40,
  },

  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 40,
  },

  headerLanguage: {
    color: "#FFFFFF",
    fontWeight: "900",
    padding: 8,
  },

  button: {
    width: "100%",
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: GREEN,
    borderWidth: 1,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginVertical: 7,
  },

  buttonSecondary: {
    backgroundColor: "#FFFFFF",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  formContent: {
    padding: 18,
    paddingBottom: 50,
  },

  label: {
    color: "#244C37",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 4,
  },

  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#D3DDD7",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    fontSize: 16,
    marginBottom: 14,
  },

  noteInput: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  otpPage: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  otpIcon: {
    fontSize: 50,
  },

  otpTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: DARK_GREEN,
    marginTop: 8,
  },

  otpText: {
    textAlign: "center",
    color: MUTED,
    marginTop: 8,
    lineHeight: 21,
  },

  otpContact: {
    color: GREEN,
    fontWeight: "800",
    marginVertical: 12,
  },

  otpInput: {
    width: "100%",
    minHeight: 60,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 12,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 8,
    marginVertical: 12,
  },

  link: {
    color: BLUE,
    fontWeight: "800",
    marginTop: 14,
  },

  farmListContent: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "rgba(247, 250, 248, 0.88)",
    minHeight: "100%",
  },

  farmCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 11,
  },

  farmIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  farmCardName: {
    color: DARK_GREEN,
    fontSize: 18,
    fontWeight: "900",
  },

  farmMeta: {
    color: MUTED,
    fontSize: 13,
    marginTop: 3,
  },

  chevron: {
    fontSize: 30,
    color: "#93A299",
  },

  mainContent: {
    padding: 15,
    paddingBottom: 100,
    minHeight: "100%",
    backgroundColor: "rgba(247, 250, 248, 0.88)",
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    minHeight: 116,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#D5ECDD",
    borderRadius: 14,
    marginHorizontal: 3,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  statRed: {
    backgroundColor: "#FFF0F1",
    borderColor: "#F1D5D8",
  },

  statBlue: {
    backgroundColor: "#EEF5FF",
    borderColor: "#D6E5F9",
  },

  statIcon: {
    fontSize: 24,
  },

  statLabel: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#21372A",
    marginTop: 5,
    textAlign: "center",
  },

  batchEndedCard: {
    backgroundColor: "#FFF8E9",
    borderWidth: 1,
    borderColor: "#F1DFB5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  batchEndedTitle: {
    color: ORANGE,
    fontWeight: "900",
    fontSize: 16,
  },

  batchEndedText: {
    color: "#6E5E38",
    marginTop: 5,
    lineHeight: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: DARK_GREEN,
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 10,
  },

  batchBadge: {
    backgroundColor: LIGHT_GREEN,
    color: GREEN,
    fontWeight: "900",
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  txCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  txTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  txTitle: {
    flex: 1,
    color: DARK_GREEN,
    fontWeight: "900",
    fontSize: 15,
  },

  batchPill: {
    backgroundColor: LIGHT_GREEN,
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  txTime: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 7,
  },

  txText: {
    color: "#344D3E",
    marginTop: 2,
  },

  txAmount: {
    color: GREEN,
    fontWeight: "900",
    marginTop: 5,
  },

  txNote: {
    color: MUTED,
    fontStyle: "italic",
    marginTop: 5,
  },

  txPhoto: {
    width: "100%",
    height: 190,
    borderRadius: 11,
    marginTop: 10,
    resizeMode: "cover",
  },

  empty: {
    color: MUTED,
    textAlign: "center",
    paddingVertical: 25,
  },

  pageTitle: {
    color: DARK_GREEN,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 13,
  },

  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuTitle: {
    flex: 1,
    color: DARK_GREEN,
    fontWeight: "900",
    fontSize: 16,
  },

  salesSummary: {
    flexDirection: "row",
    marginBottom: 12,
  },

  salesSummaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginHorizontal: 4,
  },

  summaryLabel: {
    color: MUTED,
    fontWeight: "700",
    fontSize: 12,
  },

  summaryValue: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },

  historySearch: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  showAllButton: {
    minHeight: 48,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginLeft: 8,
  },

  showAllText: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 12,
  },

  recordCount: {
    color: MUTED,
    fontWeight: "700",
    marginBottom: 10,
  },

  settingsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 15,
  },

  proofPhoto: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
    borderRadius: 13,
    marginVertical: 10,
  },

  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#D0E9D8",
    borderRadius: 13,
    padding: 14,
    marginVertical: 8,
  },

  totalLabel: {
    color: DARK_GREEN,
    fontWeight: "800",
  },

  totalValue: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 20,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 5,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    color: "#77867E",
    fontSize: 20,
    fontWeight: "900",
  },

  navLabel: {
    color: "#77867E",
    fontSize: 10,
    marginTop: 2,
  },

  navActive: {
    color: GREEN,
    fontWeight: "900",
  },

  photoModal: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },

  fullPhoto: {
    width: "100%",
    height: "85%",
  },

  photoClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  photoCloseText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
  },
});