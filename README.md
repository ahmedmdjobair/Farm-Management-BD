# Farm Management BD — নতুন প্রজেক্ট

এই starter build-এ আছে:
- বাংলা / English language switch
- নতুন ফার্ম
- ফার্ম তালিকা
- প্রতি ফার্মের আলাদা Dashboard
- Dashboard: জীবিত মুরগি, মৃত মুরগি, মোট খরচ
- মুরগি, ফিড, ওষুধ, অন্যান্য খরচ
- মৃত মুরগির সাথে ক্যামেরা ছবি
- বিক্রি
- বর্তমান ব্যাচের transaction list
- স্থায়ী History UI এবং তারিখ filter
- অনুমোদিত Farm Management BD logo

গুরুত্বপূর্ণ:
বর্তমান starter-টি UI + local in-memory functional prototype।
একই account বহু ফোনে real-time sync, permanent cloud history, authentication,
photo cloud storage এবং production database-এর জন্য পরের ধাপে backend (যেমন Supabase/Firebase)
সংযোগ করতে হবে। Backend keys ছাড়া নিরাপদ production sync hard-code করা হয়নি।

Run:
1. npm install
2. npx expo start
3. Expo Go দিয়ে QR scan করুন
