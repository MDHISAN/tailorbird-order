# TailorBird Order Website V7 — সম্পূর্ণ বাংলা গাইড

## আগে তিনটি কথা

1. **ওয়েবসাইট** GitHub Pages-এ বিনামূল্যে প্রকাশ করা যায়। এটি আলাদা অর্ডার পেজ; আপনার পুরোনো tailorbird.com.au-কে পরিবর্তন করবে না।
2. **নতুন PDF ডিজাইন** `pdf-library/` ফোল্ডারে PDF হিসেবে আপলোড করে Commit/Push করলে GitHub Actions PDF-এর *প্রতিটি পৃষ্ঠা* WEBP প্রিভিউ বানিয়ে গ্যালারিতে প্রকাশ করে। আপনাকে কোনো ছবি তৈরি বা আপলোড করতে হবে না। মূল PDF বদলাবে না।
3. **কাস্টমারের অর্ডার সত্যিকারে গ্রহণ করা** একটি *আলাদা* Google Apps Script সংযোগের ওপর নির্ভরশীল। `config.js` খালি থাকা অবস্থায় Submit বন্ধ থাকবে, কাস্টমারকে মিথ্যা কনফার্মেশন দেখাবে না। স্বয়ংক্রিয় WhatsApp নোটিফিকেশন **এখনো অন্তর্ভুক্ত নয়**; এর জন্য Meta WhatsApp Business API/অনুমোদিত provider এবং অনুমতি দরকার।

## ১ — প্যাকেজের ফোল্ডার

- `index.html` — কাস্টমার অর্ডার পেজ ও Review পেজ
- `config.js` — Google Apps Script /exec URL বসানোর জায়গা (পাসওয়ার্ড রাখবেন না)
- `assets/tailorbird-original-TB-logo.png` — আপনার আপলোড করা **আসল** TB লোগো
- `assets/logo-positions-user-3d.jpg` — আপনার A–I ভিজ্যুয়াল
- `assets/fabrics/` — ফেব্রিক ছবি
- `assets/designs/` — আপনার প্রথম PDF থেকে আগেই তৈরি ৪৮টি প্রিভিউ
- `pdf-library/` — ভবিষ্যতে শুধুমাত্র নতুন PDF রাখবেন, **এই ফোল্ডারটিই গুরুত্বপূর্ণ**
- `scripts/build_gallery.py` — GitHub Actions-এ স্বয়ংক্রিয় PDF প্রিভিউ জেনারেটর
- `.github/workflows/deploy.yml` — GitHub Action; এই হিডেন ফোল্ডারটি অবশ্যই রিপোজিটরিতে তুলবেন
- `gallery/catalog.json` — অটোমেটিক গ্যালারি লিস্ট; নতুন PDF-এ নিজে এডিট করতে হবে না
- `google-backend/Code.gs` — Google Drive, Google Sheets, PDF, email অর্ডার রিসিভার; Apps Script-এ পেস্ট করবেন

## ২ — GitHub রিপোজিটরি তৈরি

1. GitHub-এ লগইন করুন → **New repository**।
2. নাম দিন `tailorbird-order`। Github Free হলে **Public** ব্যবহার করুন (সব ফাইল, প্রোডাক্ট ডিজাইনও তখন পাবলিক হবে)। `Private` করলে আপনার প্ল্যানের Pages সুবিধা পরীক্ষা করুন।
3. `Create repository` ক্লিক করুন।
4. ZIP Extract করুন। রিপোজিটরির **root-এ** সব ফাইল ও ফোল্ডার আপলোড করুন, যাতে root-এই `index.html` থাকে। পুরো ZIP-কে এক ফাইল হিসেবে আপলোড করবেন না।
5. ব্রাউজারের Add file → Upload files দিয়ে hidden `.github/` ফোল্ডার আপলোডে সমস্যা হলে `Add file → Create new file` দিয়ে `.github/workflows/deploy.yml` নামে ফাইল তৈরি করে প্যাকেজের ফাইলটির কোড কপি করুন। `.github` ফোল্ডার না গেলে PDF অটো কনভার্ট হবে না।
6. `Commit changes` ক্লিক করুন। Branch `main` রাখুন।
7. Repository → **Settings → Pages → Build and deployment → Source: GitHub Actions** নির্বাচন করুন।
8. **Actions** ট্যাবে `Deploy TailorBird Website` workflow সফল (সবুজ টিক) হওয়া পর্যন্ত অপেক্ষা করুন। প্রথমবার Actions enable করতে বলতে পারে।
9. **Settings → Pages**-এ প্রকাশিত URL পাবেন। সাধারণত `https://YOUR-USERNAME.github.io/tailorbird-order/` (YOUR-USERNAME বদলাবে)।
10. লিংক খুলে Design Gallery, Fabric, A–I Image, Review পেজ পরীক্ষা করুন। **Backend না লাগানো পর্যন্ত Submit সফল হবে না—ইচ্ছাকৃত।**

## ৩ — শুধু PDF যোগ করে ডিজাইন বাড়ানো

1. PDF-এর নাম দিন `TB-DESIGN-002.pdf`, পরেরটা `TB-DESIGN-003.pdf`, ইত্যাদি। নামের সংখ্যা হলো **PDF-এর ক্রমিক**, পৃষ্ঠার সংখ্যা নয়।
2. GitHub রিপোজিটরিতে `pdf-library` ফোল্ডারে যান → **Add file → Upload files** → নতুন PDF নির্বাচন করুন → **Commit changes**। `pdf-library` ফোল্ডার রিপোজিটরিতে না দেখালে সেখানে একটি ছোট README ফাইল আগে কমিট করুন।
3. `Actions` ট্যাবে নতুন deployment শেষ হলে ওয়েবসাইট Refresh দিন। নতুন PDF-এর প্রতিটি পৃষ্ঠা আলাদা স্লাইড। আগে থাকা ৪৮টি স্লাইড অক্ষত থাকবে।
4. যেমন ২০ পৃষ্ঠার `TB-DESIGN-002.pdf` দিলে ২০টি নতুন স্লাইড; ৫০ পৃষ্ঠার `TB-DESIGN-003.pdf` দিলে আরও ৫০টি স্লাইড। মোট ৪৮+২০+৫০ = ১১৮টি।
5. GitHub ওয়েব UI দিয়ে ফাইল আপলোডে সীমা আছে (সাধারণত ২৫ MB প্রতি ফাইল); Git-এর মাধ্যমেও GitHub ১০০ MB-এর বড় ফাইল প্রত্যাখ্যান করে। আপনার মূল `TailorBird page 01.pdf.pdf` ~108 MB ছিল। এটি রিপোজিটরিতে দিতে চাইলে **আগে Compress বা Split** করতে হবে। প্যাকেজে ওই ৪৮ পৃষ্ঠার প্রিভিউ আগে থেকেই আছে, তাই সেটি আর নতুন করে আপলোড করার প্রয়োজন নেই।
6. ১,০০০–১০,০০০ ডিজাইন হলে GitHub Actions-এর কাজের সময়/স্টোরেজ/Pages artifact সীমা আসতে পারে। বড় সংগ্রহে object storage/CDN + আলাদা catalogue service প্রয়োজন হতে পারে। এই V7-এ ১০,০০০ ডিজাইনের stress-test করা হয়নি।
7. আপনি শুধু **PDF** আপলোড করবেন; `scripts/build_gallery.py` GitHub Actions-এ **স্বয়ংক্রিয়ভাবে** প্রিভিউ তৈরি করবে। আপলোডের পর *Commit/Push দরকার*—অ্যাকশন সাইটে নিজে থেকে ফোল্ডার দেখতে পারে না।

## ৪ — Google Drive + Sheets + Email-এ সত্যিকারের অর্ডার নেওয়া

**গুরুত্বপূর্ণ:** GitHub Pages একা customer files/notifications গ্রহণ করতে পারে না। এর জন্য Google Apps Script receiver দরকার। V7-এর starter receiver ছোট ফাইলের জন্য (এক ফাইল 3MB-এর নিচে; সব একসঙ্গে 8MB-এর নিচে)। বড় artwork/ZIP বা বেশি ভিজিটরের জন্য পরে আরো উপযুক্ত backend লাগবে। নিচের ইন্টিগ্রেশন বাস্তব Google অ্যাকাউন্টে এখনো end-to-end পরীক্ষা করা হয়নি; প্রথমে নিজের টেস্ট অর্ডার দিয়ে যাচাই করতে হবে।

1. `mmh6491@gmail.com` Google অ্যাকাউন্টে লগইন করুন।
2. https://script.google.com → **New project** → নাম দিন `TailorBird Order Receiver`।
3. প্যাকেজের `google-backend/Code.gs` খুলে পুরো কোড কপি করে Apps Script-এর `Code.gs`-এ পেস্ট করুন। **Save** দিন।
4. Function dropdown-এ `setup` বেছে **Run** করুন। Google Drive, Spreadsheet, Documents, Email permission চাইবে; প্রয়োজনীয় অনুমতি পর্যালোচনা করে অনুমোদন দিন। `setup` সফল হলে Google Drive-এ `TailorBird Customer Orders` ফোল্ডার এবং Google Sheets-এ `TailorBird Orders` স্প্রেডশিট তৈরি হবে।
5. Apps Script → **Deploy → New deployment → Type: Web app**। Description `TailorBird Order API`। **Execute as: Me**; **Who has access: Anyone** (anonymous visitors can submit) → **Deploy**। এই endpoint প্রকাশ্য; অপ্রয়োজনীয় Spam/abuse মোকাবিলায় production-এ CAPTCHA ও rate-limiting যুক্ত করা উচিত।
6. Web app URL কপি করুন। URL `https://script.google.com/macros/s/.../exec` আকারের হবে।
7. GitHub রিপোজিটরিতে `config.js` খুলে `appsScriptUrl`-এর খালি `""`-এর পরিবর্তে নতুন URL লিখে **Commit changes** দিন। `config.js`-এ কখনো Password, Google token, Meta API token রাখবেন না।
8. `Actions` শেষ হলে আপনার Published Website খুলে ছোট একটি টেস্ট অর্ডার সাবমিট করুন। Review পেজের তিনটি checkbox দিন। সফল হলে order ID আসবে, Google Drive-এ নতুন order folder এবং PDF, Google Sheets-এ row ও দুইটি ইমেইলে notification আসার কথা। Gmail Spam folder-ও দেখুন।
9. যদি অর্ডার না যায়, customer **NOT confirmed** মেসেজ পাবে। Browser console, Apps Script → Executions এবং অনুমতির সেটিংস যাচাই করুন। একই অর্ডার বারবার সাবমিট না করে আগে Drive/Sheet চেক করুন।
10. আপনি পরে `google-backend/Code.gs`-এ `OWNER_EMAILS` ও Apps Script Properties `NOTIFICATION_EMAILS` বদলে recipients বদলাতে পারবেন। Apps Script কোড পরিবর্তন করলে **Deploy → Manage deployments → Edit → New version → Deploy** করুন।

### Backend ফাইল সংরক্ষণের গঠন

`Google Drive / TailorBird Customer Orders / TB-YYYYMMDD-001_TeamName /` এর মধ্যে `Production_Order.pdf`, `Order_Details.json` এবং কাস্টমারের আপলোডকৃত ফাইলগুলো যাবে। Google Sheets row-এ PDF ও folder-এর লিংক থাকবে। ZIP automatically Drive-এ তৈরি করার ব্যবস্থা নেই; PDF ও আসল ফাইলগুলো ফোল্ডারে সংগৃহীত থাকবে।

### WhatsApp সংক্রান্ত বাস্তব অবস্থা

WhatsApp notification recipient numbers হিসেবে আপনি **01704769699** এবং **01886209171** বলেছেন। V7-এ এগুলোতে **automatic WhatsApp message পাঠানো নেই**। Facebook/Meta WhatsApp Business Platform API, অনুমোদিত message template ও server-side provider credentials লাগবে। অনুমোদিত backend ছাড়া 'connected' লেখা নিরাপদ নয়। Email এবং Google Drive/Sheets আলাদাভাবে চালু করা যাবে।

### Admin Login সংক্রান্ত বাস্তব অবস্থা

আপনার দুই Google account অনুমোদিত Admin হওয়ার পরিকল্পনা আছে। **V7-এর ওয়েবসাইটে এখনও প্রকৃত সুরক্ষিত Google Admin panel নেই**, কারণ Github Pages frontend-এ admin secret রাখা যাবে না। Drive ও Sheets কেবল Google-এর আসল অ্যাকাউন্ট অনুমতিসাপেক্ষ; Google account login দিয়ে ওয়েবসাইটের admin settings পরিবর্তনের feature পরবর্তীতে backend/auth যোগ করে চালু করতে হবে। বর্তমান `Admin demo` লিংক পাবলিক পেজ থেকে লুকানো হয়েছে।

## ৫ — ভবিষ্যতে পুরোনো ওয়েবসাইটে জুড়বেন

প্রথমে URL আলাদা থাকবে `https://YOUR-USERNAME.github.io/tailorbird-order/`। পরে tailorbird.com.au-তে **Order Now** বাটন দিয়ে এই লিংক খুলতে পারবেন। চাইলে পরে সাবডোমেইন `order.tailorbird.com.au` ব্যবহার করতে পারবেন; তার জন্য DNS ও GitHub Pages custom domain সেটিংস সামঞ্জস্য করতে হবে। মূল ওয়েবসাইট অপরিবর্তিত থাকবে।

## ৬ — দ্রুত সমাধান

- **404:** GitHub Actions green হলো? `Settings → Pages → Source: GitHub Actions` কি দেওয়া? `index.html` root-এ আছে?
- **নতুন PDF নেই:** `pdf-library`-এ Commit হয়েছে? Actions সফল? PDF GitHub সীমার মধ্যে? Ctrl+F5 দিয়ে refresh দিন।
- **Gallery PDF thumbnail build fails:** Actions → failed job log পড়ুন। Password-protected বা corrupt PDF হলে কাজ করবে না।
- **Order submit fails:** `config.js`-এ `/exec` URL আছে? Apps Script Web App-এ Anyone access দেওয়া? Apps Script permission authorize করা? Backend এখনো live test হয়নি।
- **Customer upload huge:** সর্বোচ্চ 3MB/file, মোট 8MB সীমা। ছোট ফাইল দিয়ে পরীক্ষা করুন। মূল production-artwork বৃহৎ হলে Google Drive direct upload solution আলাদা করে তৈরি করতে হবে।
- **WhatsApp আসছে না:** V7-এ automatic WhatsApp connection এখনো নেই।

### Security

Public GitHub repo-তে **কখনো password, Google Drive private files, customer orders, private API token আপলোড করবেন না**। কেবল public catalogue PDF রাখুন। Customer files শুধুমাত্র authorized Google Drive backend-এ সংরক্ষণ হবে। কোনো PDF-তে অন্যের কপিরাইট/অনুমতি সংক্রান্ত বিষয় থাকলে পাবলিক প্রকাশের আগে নিশ্চিত করুন।
