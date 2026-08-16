// ============================================================
// LANGUAGE CONFIGURATION
// ============================================================

export const LANGUAGES = {
  EN: 'en',
  MM: 'mm',
};

export const DEFAULT_LANGUAGE = LANGUAGES.EN;

export const LANGUAGE_LABELS = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.MM]: 'မြန်မာ',
};

export const LANGUAGE_FLAGS = {
  [LANGUAGES.EN]: '🇬🇧',
  [LANGUAGES.MM]: '🇲🇲',
};

// ============================================================
// TRANSLATIONS
// ============================================================

export const translations = {
  [LANGUAGES.EN]: {
    // Navigation
    'nav.home': 'Home',
    'nav.games': 'Games',
    'nav.slots': 'Slots',
    'nav.liveCasino': 'Live Casino',
    'nav.sports': 'Sports',
    'nav.fishing': 'Fishing',
    'nav.lotto': 'Lotto',
    'nav.promotions': 'Promotions',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile',
    'nav.history': 'History',
    'nav.leaderboard': 'Leaderboard',
    'nav.referral': 'Referral',
    'nav.support': 'Support',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.clearCache': 'Clear Cache & Refresh',
    'nav.secure': 'Secure',
    'nav.live': 'Live',
    'nav.language': 'Language',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.viewAll': 'View All',
    'common.playNow': 'Play Now',
    'common.claimNow': 'Claim Now',
    'common.learnMore': 'Learn More',
    'common.joinNow': 'Join Now',

    // Home
    'home.welcome': 'Welcome to FattBet',
    'home.subtitle': 'Your trusted online gaming platform',
    'home.hotGames': 'Hot Games',
    'home.featuredGames': 'Featured Games',
    'home.noHotGames': 'No hot games available',
    'home.noFeaturedGames': 'No featured games available',

    // Games
    'games.title': 'All Games',
    'games.noGames': 'No games found matching your criteria.',
    'games.clearFilters': 'Clear filters',
    'games.providers': 'Providers',
    'games.categories': 'Categories',
    'games.searchPlaceholder': 'Search games...',

    // Wallet
    'wallet.title': 'My Wallet',
    'wallet.totalBalance': 'Total Balance',
    'wallet.mainBalance': 'Main',
    'wallet.bonusBalance': 'Bonus',
    'wallet.commissionBalance': 'Commission',
    'wallet.lockedBalance': 'Locked',
    'wallet.deposit': 'Deposit',
    'wallet.withdraw': 'Withdraw',
    'wallet.transactions': 'Transactions',
    'wallet.noTransactions': 'No transactions yet',
    'wallet.bankAccounts': 'Bank Accounts',
    'wallet.noBankAccounts': 'No bank accounts added',
    'wallet.addBankAccount': 'Add Bank Account',
    'wallet.manageBank': 'Manage',
    'wallet.default': 'Default',

    // Deposit
    'deposit.title': 'Deposit Funds',
    'deposit.amount': 'Amount (THB)',
    'deposit.quickSelect': 'Quick Select',
    'deposit.paymentMethod': 'Payment Method',
    'deposit.selectBank': 'Select Bank Account',
    'deposit.submit': 'Submit Deposit',
    'deposit.minAmount': 'Minimum deposit: 100 THB',
    'deposit.info': 'Deposits processed within 24 hours',
    'deposit.confirm': 'Confirm Deposit',
    'deposit.confirmAmount': 'Amount',
    'deposit.confirmMethod': 'Method',
    'deposit.cancel': 'Cancel',

    // Withdraw
    'withdraw.title': 'Withdraw Funds',
    'withdraw.availableBalance': 'Available Balance',
    'withdraw.amount': 'Amount (THB)',
    'withdraw.quickSelect': 'Quick Select',
    'withdraw.selectBank': 'Select Bank Account',
    'withdraw.submit': 'Submit Withdrawal',
    'withdraw.minAmount': 'Minimum withdrawal: 500 THB',
    'withdraw.info': 'Withdrawals processed within 24 hours',
    'withdraw.confirm': 'Confirm Withdrawal',
    'withdraw.confirmAmount': 'Amount',
    'withdraw.confirmTo': 'To',

    // Promotions
    'promotions.title': 'Promotions',
    'promotions.subtitle': 'Exclusive offers and bonuses for our valued players',
    'promotions.ends': 'Ends',
    'promotions.tcApply': 'T&C apply',
    'promotions.claimNow': 'Claim Now',

    // Profile
    'profile.title': 'My Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.username': 'Username',
    'profile.email': 'Email',
    'profile.fullName': 'Full Name',
    'profile.phone': 'Phone',
    'profile.joined': 'Joined',
    'profile.changePassword': 'Change Password',
    'profile.active': 'Active',
    'profile.role': 'Role',
    'profile.loginRequired': 'Please login to view your profile',

    // Referral
    'referral.title': 'Referral Program',
    'referral.subtitle': 'Invite friends and earn rewards',
    'referral.yourLink': 'Your Referral Link',
    'referral.copyLink': 'Copy Link',
    'referral.copied': 'Copied!',
    'referral.totalReferrals': 'Total Referrals',
    'referral.earned': 'Earned',
    'referral.noReferrals': 'No referrals yet',
    'referral.inviteFriends': 'Invite Friends',
    'referral.share': 'Share',

    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.subtitle': 'Top players this month',
    'leaderboard.rank': 'Rank',
    'leaderboard.player': 'Player',
    'leaderboard.score': 'Score',
    'leaderboard.reward': 'Reward',
    'leaderboard.noData': 'No leaderboard data available',

    // History
    'history.title': 'History',
    'history.bets': 'Bet History',
    'history.transactions': 'Transaction History',
    'history.date': 'Date',
    'history.amount': 'Amount',
    'history.status': 'Status',
    'history.type': 'Type',
    'history.noData': 'No history available',

    // Support Chat
    'support.title': 'Support Chat',
    'support.subtitle': 'Chat with our support team',
    'support.typeMessage': 'Type a message...',
    'support.send': 'Send',
    'support.noMessages': 'No messages yet',
    'support.connected': 'Connected',
    'support.disconnected': 'Disconnected',
    'support.connecting': 'Connecting...',

    // Chat Widget
    'chat.title': 'Chat with us',
    'chat.placeholder': 'Type your message...',
    'chat.send': 'Send',
    'chat.online': 'Online',
    'chat.offline': 'Offline',

    // Game Card
    'game.play': 'PLAY',
    'game.rtp': 'RTP',
    'game.hot': 'HOT',
    'game.new': 'NEW',
    'game.unavailable': 'Game unavailable',
    'game.loginToPlay': 'Please login to play',
    'game.launching': 'Launching',

    // Errors
    'error.loadingGames': 'Failed to load games',
    'error.loadingProviders': 'Failed to load providers',
    'error.network': 'Network error. Please check your connection.',
    'error.rateLimit': 'Too many requests. Please wait a moment.',
    'error.general': 'Something went wrong. Please try again.',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.email': 'Email',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create Account',
    'auth.agreeTerms': 'I agree to the Terms of Service and Privacy Policy',
    'auth.termsRequired': 'You must agree to the terms',
    'auth.welcomeBack': 'Welcome Back!',
    'auth.joinFun': 'Join the fun and start winning!',
    'auth.loginToContinue': 'Please login to continue',
    'auth.invalidCredentials': 'Invalid credentials',
    'auth.passwordMinLength': 'Minimum 8 characters',
    'auth.passwordUppercase': 'Must contain at least one uppercase letter',
    'auth.passwordLowercase': 'Must contain at least one lowercase letter',
    'auth.passwordNumber': 'Must contain at least one number',
    'auth.invalidEmail': 'Invalid email format',
    'auth.usernameMinLength': 'Minimum 3 characters',
    'auth.usernameMaxLength': 'Maximum 20 characters',
    'auth.usernameRequired': 'Username is required',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.fullNameRequired': 'Full name is required',

    // Footer
    'footer.copyright': 'All rights reserved',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.responsibleGaming': 'Responsible Gaming',
    'footer.faq': 'FAQ',
    'footer.about': 'About',
    'footer.contact': 'Contact',

    // SEO
    'meta.title': 'FattBet - Online Gaming Platform',
    'meta.description': 'Your trusted online gaming platform. Play safe, win big.',
  },

  [LANGUAGES.MM]: {
    // Navigation
    'nav.home': 'ပင်မစာမျက်နှာ',
    'nav.games': 'ဂိမ်းများ',
    'nav.slots': 'ဆလော့ခ်',
    'nav.liveCasino': 'တိုက်ရိုက်ကာစီနို',
    'nav.sports': 'အားကစား',
    'nav.fishing': 'ငါးဖမ်း',
    'nav.lotto': 'ထီ',
    'nav.promotions': 'ပရိုမိုးရှင်း',
    'nav.wallet': 'ငွေအိတ်',
    'nav.profile': 'ကိုယ်ရေးအချက်အလက်',
    'nav.history': 'မှတ်တမ်း',
    'nav.leaderboard': 'ထိပ်တန်းစာရင်း',
    'nav.referral': 'လွှဲပြောင်းခြင်း',
    'nav.support': 'အကူအညီ',
    'nav.login': 'ဝင်ရန်',
    'nav.register': 'စာရင်းသွင်းရန်',
    'nav.logout': 'ထွက်ရန်',
    'nav.clearCache': 'Cache ရှင်းရန်',
    'nav.secure': 'လုံခြုံသည်',
    'nav.live': 'တိုက်ရိုက်',
    'nav.language': 'ဘာသာစကား',

    // Common
    'common.loading': 'ခေတ္တစောင့်ပါ...',
    'common.error': 'အမှားတစ်ခုဖြစ်ပွားခဲ့သည်',
    'common.retry': 'ပြန်ကြိုးစားရန်',
    'common.back': 'နောက်သို့',
    'common.save': 'သိမ်းရန်',
    'common.cancel': 'ပယ်ဖျက်ရန်',
    'common.confirm': 'အတည်ပြုရန်',
    'common.close': 'ပိတ်ရန်',
    'common.search': 'ရှာဖွေရန်',
    'common.viewAll': 'အားလုံးကြည့်ရန်',
    'common.playNow': 'ယခုကစားရန်',
    'common.claimNow': 'ယခုရယူရန်',
    'common.learnMore': 'ပိုမိုလေ့လာရန်',
    'common.joinNow': 'ယခုပါဝင်ရန်',

    // Home
    'home.welcome': 'FattBet မှ ကြိုဆိုပါသည်',
    'home.subtitle': 'သင်၏ ယုံကြည်စိတ်ချရသော အွန်လိုင်းဂိမ်းပလက်ဖောင်း',
    'home.hotGames': 'ဟော့ဂိမ်းများ',
    'home.featuredGames': 'အထူးဂိမ်းများ',
    'home.noHotGames': 'ဟော့ဂိမ်းမရှိပါ',
    'home.noFeaturedGames': 'အထူးဂိမ်းမရှိပါ',

    // Games
    'games.title': 'ဂိမ်းအားလုံး',
    'games.noGames': 'သင်ရွေးချယ်ထားသော ဂိမ်းများမတွေ့ပါ',
    'games.clearFilters': 'စစ်ထုတ်မှုများရှင်းရန်',
    'games.providers': 'ပံ့ပိုးပေးသူများ',
    'games.categories': 'အမျိုးအစားများ',
    'games.searchPlaceholder': 'ဂိမ်းရှာဖွေရန်...',

    // Wallet
    'wallet.title': 'ကျွန်ုပ်၏ငွေအိတ်',
    'wallet.totalBalance': 'စုစုပေါင်းငွေလက်ကျန်',
    'wallet.mainBalance': 'အဓိက',
    'wallet.bonusBalance': 'ဘောနပ်',
    'wallet.commissionBalance': 'ကော်မရှင်',
    'wallet.lockedBalance': 'သော့ခတ်ထားသည်',
    'wallet.deposit': 'ငွေသွင်း',
    'wallet.withdraw': 'ငွေထုတ်',
    'wallet.transactions': 'ငွေလွှဲမှတ်တမ်းများ',
    'wallet.noTransactions': 'ငွေလွှဲမှတ်တမ်းမရှိသေးပါ',
    'wallet.bankAccounts': 'ဘဏ်အကောင့်များ',
    'wallet.noBankAccounts': 'ဘဏ်အကောင့်မထည့်သွင်းရသေးပါ',
    'wallet.addBankAccount': 'ဘဏ်အကောင့်ထည့်ရန်',
    'wallet.manageBank': 'စီမံရန်',
    'wallet.default': 'ပုံမှန်',

    // Deposit
    'deposit.title': 'ငွေသွင်းရန်',
    'deposit.amount': 'ပမာဏ (THB)',
    'deposit.quickSelect': 'အမြန်ရွေးချယ်ရန်',
    'deposit.paymentMethod': 'ငွေပေးချေနည်းလမ်း',
    'deposit.selectBank': 'ဘဏ်အကောင့်ရွေးချယ်ရန်',
    'deposit.submit': 'ငွေသွင်းရန် တင်ပြပါ',
    'deposit.minAmount': 'အနည်းဆုံးသွင်းရန် 100 THB',
    'deposit.info': 'ငွေသွင်းမှုများ ၂၄ နာရီအတွင်း ဆောင်ရွက်ပေးပါမည်',
    'deposit.confirm': 'ငွေသွင်းရန်အတည်ပြုပါ',
    'deposit.confirmAmount': 'ပမာဏ',
    'deposit.confirmMethod': 'နည်းလမ်း',
    'deposit.cancel': 'ပယ်ဖျက်ရန်',

    // Withdraw
    'withdraw.title': 'ငွေထုတ်ရန်',
    'withdraw.availableBalance': 'ရရှိနိုင်သောငွေလက်ကျန်',
    'withdraw.amount': 'ပမာဏ (THB)',
    'withdraw.quickSelect': 'အမြန်ရွေးချယ်ရန်',
    'withdraw.selectBank': 'ဘဏ်အကောင့်ရွေးချယ်ရန်',
    'withdraw.submit': 'ငွေထုတ်ရန် တင်ပြပါ',
    'withdraw.minAmount': 'အနည်းဆုံးထုတ်ရန် 500 THB',
    'withdraw.info': 'ငွေထုတ်မှုများ ၂၄ နာရီအတွင်း ဆောင်ရွက်ပေးပါမည်',
    'withdraw.confirm': 'ငွေထုတ်ရန်အတည်ပြုပါ',
    'withdraw.confirmAmount': 'ပမာဏ',
    'withdraw.confirmTo': 'သို့',

    // Promotions
    'promotions.title': 'ပရိုမိုးရှင်းများ',
    'promotions.subtitle': 'ကျွန်ုပ်တို့၏တန်ဖိုးရှိသော ကစားသမားများအတွက် အထူးကမ်းလှမ်းချက်များ',
    'promotions.ends': 'ကုန်ဆုံးမည်',
    'promotions.tcApply': 'စည်းကမ်းချက်များသက်ရောက်သည်',
    'promotions.claimNow': 'ယခုရယူရန်',

    // Profile
    'profile.title': 'ကျွန်ုပ်၏ကိုယ်ရေးအချက်အလက်',
    'profile.edit': 'တည်းဖြတ်ရန်',
    'profile.save': 'သိမ်းဆည်းရန်',
    'profile.cancel': 'ပယ်ဖျက်ရန်',
    'profile.username': 'အသုံးပြုသူအမည်',
    'profile.email': 'အီးမေးလ်',
    'profile.fullName': 'အမည်အပြည့်အစုံ',
    'profile.phone': 'ဖုန်းနံပါတ်',
    'profile.joined': 'စာရင်းသွင်းခဲ့သည်',
    'profile.changePassword': 'စကားဝှက်ပြောင်းရန်',
    'profile.active': 'အသက်ဝင်သည်',
    'profile.role': 'အခန်းကဏ္ဍ',
    'profile.loginRequired': 'သင့်ကိုယ်ရေးအချက်အလက်ကြည့်ရန် ဝင်ရောက်ပါ',

    // Referral
    'referral.title': 'လွှဲပြောင်းခြင်းအစီအစဉ်',
    'referral.subtitle': 'သူငယ်ချင်းများကိုဖိတ်ပြီး ဆုလာဘ်များရယူပါ',
    'referral.yourLink': 'သင်၏လွှဲပြောင်းလင့်ခ်',
    'referral.copyLink': 'လင့်ခ်ကူးရန်',
    'referral.copied': 'ကူးယူပြီးပါပြီ',
    'referral.totalReferrals': 'စုစုပေါင်းလွှဲပြောင်းမှုများ',
    'referral.earned': 'ရရှိငွေ',
    'referral.noReferrals': 'လွှဲပြောင်းမှုမရှိသေးပါ',
    'referral.inviteFriends': 'သူငယ်ချင်းများကိုဖိတ်ပါ',
    'referral.share': 'မျှဝေရန်',

    // Leaderboard
    'leaderboard.title': 'ထိပ်တန်းစာရင်း',
    'leaderboard.subtitle': 'ဤလအတွက် ထိပ်တန်းကစားသမားများ',
    'leaderboard.rank': 'အဆင့်',
    'leaderboard.player': 'ကစားသမား',
    'leaderboard.score': 'ရမှတ်',
    'leaderboard.reward': 'ဆုလာဘ်',
    'leaderboard.noData': 'ထိပ်တန်းစာရင်းဒေတာမရှိပါ',

    // History
    'history.title': 'မှတ်တမ်း',
    'history.bets': 'လောင်းကြေးမှတ်တမ်း',
    'history.transactions': 'ငွေလွှဲမှတ်တမ်း',
    'history.date': 'ရက်စွဲ',
    'history.amount': 'ပမာဏ',
    'history.status': 'အခြေအနေ',
    'history.type': 'အမျိုးအစား',
    'history.noData': 'မှတ်တမ်းမရှိပါ',

    // Support Chat
    'support.title': 'အကူအညီစကားပြောခန်း',
    'support.subtitle': 'ကျွန်ုပ်တို့၏အကူအညီအဖွဲ့နှင့် စကားပြောပါ',
    'support.typeMessage': 'မက်ဆေ့ခ်ျရိုက်ပါ...',
    'support.send': 'ပို့ရန်',
    'support.noMessages': 'မက်ဆေ့ခ်ျမရှိသေးပါ',
    'support.connected': 'ချိတ်ဆက်ပြီး',
    'support.disconnected': 'ချိတ်ဆက်မှုပြတ်တောက်သွားသည်',
    'support.connecting': 'ချိတ်ဆက်နေသည်...',

    // Chat Widget
    'chat.title': 'ကျွန်ုပ်တို့နှင့် စကားပြောပါ',
    'chat.placeholder': 'မက်ဆေ့ခ်ျရိုက်ပါ...',
    'chat.send': 'ပို့ရန်',
    'chat.online': 'အွန်လိုင်း',
    'chat.offline': 'အော့ဖ်လိုင်း',

    // Game Card
    'game.play': 'ကစားရန်',
    'game.rtp': 'RTP',
    'game.hot': 'ဟော့',
    'game.new': 'အသစ်',
    'game.unavailable': 'ဂိမ်းမရရှိနိုင်ပါ',
    'game.loginToPlay': 'ကစားရန် ဝင်ရောက်ပါ',
    'game.launching': 'စတင်နေသည်',

    // Errors
    'error.loadingGames': 'ဂိမ်းများဖွင့်ရန်မအောင်မြင်ပါ',
    'error.loadingProviders': 'ပံ့ပိုးပေးသူများဖွင့်ရန်မအောင်မြင်ပါ',
    'error.network': 'ကွန်ရက်အမှား ဖြစ်ပွားနေပါသည်။ သင့်ချိတ်ဆက်မှုကိုစစ်ဆေးပါ။',
    'error.rateLimit': 'တောင်းဆိုမှုများလွန်းပါသည်။ ခေတ္တစောင့်ပါ။',
    'error.general': 'အမှားတစ်ခုဖြစ်ပွားခဲ့သည်။ ပြန်ကြိုးစားပါ။',

    // Auth
    'auth.login': 'ဝင်ရန်',
    'auth.register': 'စာရင်းသွင်းရန်',
    'auth.username': 'အသုံးပြုသူအမည်',
    'auth.password': 'စကားဝှက်',
    'auth.email': 'အီးမေးလ်',
    'auth.fullName': 'အမည်အပြည့်အစုံ',
    'auth.phone': 'ဖုန်းနံပါတ်',
    'auth.forgotPassword': 'စကားဝှက်မေ့နေပါသလား?',
    'auth.rememberMe': 'ကျွန်ုပ်ကိုမှတ်ထားပါ',
    'auth.noAccount': 'အကောင့်မရှိသေးဘူးလား?',
    'auth.hasAccount': 'အကောင့်ရှိပြီးသားလား?',
    'auth.signIn': 'ဝင်ရန်',
    'auth.signUp': 'အကောင့်ဖွင့်ရန်',
    'auth.agreeTerms': 'ဝန်ဆောင်မှုစည်းကမ်းချက်များနှင့် ကိုယ်ရေးအချက်အလက်မူဝါဒကို သဘောတူပါသည်',
    'auth.termsRequired': 'စည်းကမ်းချက်များကိုသဘောတူရပါမည်',
    'auth.welcomeBack': 'ပြန်လည်ကြိုဆိုပါသည်',
    'auth.joinFun': 'ပျော်စရာများပါဝင်ပြီး အနိုင်ရရှိလိုက်ပါ!',
    'auth.loginToContinue': 'ဆက်လက်လုပ်ဆောင်ရန် ဝင်ရောက်ပါ',
    'auth.invalidCredentials': 'မှားယွင်းသော အထောက်အထား',
    'auth.passwordMinLength': 'အနည်းဆုံး ၈ လုံး',
    'auth.passwordUppercase': 'အင်္ဂလိပ်လုံးကြီးတစ်လုံးပါရမည်',
    'auth.passwordLowercase': 'အင်္ဂလိပ်လုံးသေးတစ်လုံးပါရမည်',
    'auth.passwordNumber': 'နံပါတ်တစ်လုံးပါရမည်',
    'auth.invalidEmail': 'မှားယွင်းသော အီးမေးလ်ပုံစံ',
    'auth.usernameMinLength': 'အနည်းဆုံး ၃ လုံး',
    'auth.usernameMaxLength': 'အများဆုံး ၂၀ လုံး',
    'auth.usernameRequired': 'အသုံးပြုသူအမည်လိုအပ်သည်',
    'auth.emailRequired': 'အီးမေးလ်လိုအပ်သည်',
    'auth.passwordRequired': 'စကားဝှက်လိုအပ်သည်',
    'auth.fullNameRequired': 'အမည်အပြည့်အစုံလိုအပ်သည်',

    // Footer
    'footer.copyright': 'မူပိုင်ခွင့်အားလုံး ရပိုင်ခွင့်ရှိသည်',
    'footer.terms': 'စည်းကမ်းချက်များ',
    'footer.privacy': 'ကိုယ်ရေးအချက်အလက်မူဝါဒ',
    'footer.responsibleGaming': 'တာဝန်ရှိသောဂိမ်းကစားခြင်း',
    'footer.faq': 'မေးလေ့ရှိသောမေးခွန်းများ',
    'footer.about': 'အကြောင်း',
    'footer.contact': 'ဆက်သွယ်ရန်',

    // SEO
    'meta.title': 'FattBet - အွန်လိုင်းဂိမ်းပလက်ဖောင်း',
    'meta.description': 'သင်၏ ယုံကြည်စိတ်ချရသော အွန်လိုင်းဂိမ်းပလက်ဖောင်း။ လုံခြုံစွာကစားပါ၊ ကြီးကြီးမားမားအနိုင်ရပါ။',
  },
};

// ============================================================
// LANGUAGE HELPER FUNCTIONS
// ============================================================

export const getTranslation = (key, language = DEFAULT_LANGUAGE) => {
  const langTranslations = translations[language] || translations[DEFAULT_LANGUAGE];
  return langTranslations[key] || key;
};

export const getLanguageName = (code) => {
  return LANGUAGE_LABELS[code] || code;
};

export const getLanguageFlag = (code) => {
  return LANGUAGE_FLAGS[code] || '🌐';
};

export const isLanguageSupported = (code) => {
  return Object.values(LANGUAGES).includes(code);
};

export default {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  translations,
  getTranslation,
  getLanguageName,
  getLanguageFlag,
  isLanguageSupported,
};
