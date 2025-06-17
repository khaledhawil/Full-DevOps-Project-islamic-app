import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface Zikr {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  category: string;
  count: number;
  reward?: string;
  times?: string;
}

interface AzkarCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  azkar: Zikr[];
}

const Azkar: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { preferences } = useUserPreferences();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userProgress, setUserProgress] = useState<{[key: number]: number}>({});
  const [completedAzkar, setCompletedAzkar] = useState<Set<number>>(new Set());

  // Comprehensive Azkar database
  const azkarCategories: AzkarCategory[] = [
    {
      id: 'morning',
      name: 'أذكار الصباح',
      icon: '🌅',
      description: 'أذكار تُقال في الصباح من بعد الفجر حتى الضحى',
      azkar: [
        {
          id: 1,
          arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma anta rabbee la ilaha illa anta, khalaqtanee wa ana abduka, wa ana ala ahdika wa wa\'dika mastata\'tu, a\'oothu bika min sharri ma sana\'tu, aboo\'u laka bini\'matika \'alayya, wa aboo\'u laka bithanbee faghfir lee fa\'innahu la yaghfiru ath-thunooba illa anta',
          translation: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.',
          source: 'البخاري',
          category: 'morning',
          count: 1,
          reward: 'من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة',
          times: 'مرة واحدة'
        },
        {
          id: 2,
          arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
          transliteration: 'Asbahna wa asbahal-mulku lillahi walhamdu lillahi la ilaha illallahu wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer, rabbi as\'aluka khayra ma fee hatha alyawmi wa khayra ma ba\'dahu, wa a\'oothu bika min sharri ma fee hatha alyawmi wa sharri ma ba\'dahu, rabbi a\'oothu bika minal-kasali wa soo\'il-kibari, rabbi a\'oothu bika min \'athabin fin-nari wa \'athabin fil-qabri',
          translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
          source: 'مسلم',
          category: 'morning',
          count: 1,
          times: 'مرة واحدة'
        },
        {
          id: 3,
          arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
          transliteration: 'Subhan Allahi wa bihamdih',
          translation: 'Glory is to Allah and praise is to Him',
          source: 'البخاري',
          category: 'morning',
          count: 100,
          reward: 'حُطَّت خطاياه وإن كانت مثل زبد البحر',
          times: '100 مرة'
        },
        {
          id: 4,
          arabic: 'حَسْبِيَ اللَّهُ لا إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
          transliteration: 'Hasbiyal-lahu la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul-\'arshil-\'atheem',
          translation: 'Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.',
          source: 'أبو داود',
          category: 'morning',
          count: 7,
          reward: 'من قالها سبع مرات كفاه الله ما أهمه',
          times: 'سبع مرات'
        },
        {
          id: 101,
          arabic: 'بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
          transliteration: 'Bismillahil-lathee la yadhurru ma\'as-mihi shay\'un fil-ardhi wa la fis-sama\'i wa huwas-samee\'ul-\'aleem',
          translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is the All-Seeing, the All-Knowing.',
          source: 'أبو داود',
          category: 'morning',
          count: 3,
          reward: 'من قالها ثلاثاً لم تصبه فجأة بلاء حتى يمسي',
          times: 'ثلاث مرات'
        },
        {
          id: 102,
          arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
          transliteration: 'Allahumma ma asbaha bee min ni\'matin aw bi-ahadin min khalqika faminka wahdaka la shareeka laka falakaal-hamdu wa lakash-shukr',
          translation: 'O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.',
          source: 'أبو داود',
          category: 'morning',
          count: 1,
          reward: 'من قالها فقد أدى شكر يومه',
          times: 'مرة واحدة'
        },
        {
          id: 103,
          arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ رَسُولاً',
          transliteration: 'Radheetu billahi rabban, wa bil-islaami deenan, wa bi-muhammadin sallallahu \'alayhi wa sallama rasoolan',
          translation: 'I am pleased with Allah as a Lord, and Islam as a religion and Muhammad peace be upon him as a Messenger.',
          source: 'أبو داود',
          category: 'morning',
          count: 3,
          reward: 'كان حقاً على الله أن يرضيه يوم القيامة',
          times: 'ثلاث مرات'
        },
        {
          id: 104,
          arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لا إِلَهَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma \'aafini fee badanee, allahumma \'aafini fee sam\'ee, allahumma \'aafini fee basaree, la ilaha illa anta',
          translation: 'O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You.',
          source: 'أبو داود',
          category: 'morning',
          count: 3,
          reward: 'دعاء للعافية في البدن والحواس',
          times: 'ثلاث مرات'
        },
        {
          id: 105,
          arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لا إِلَهَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma innee a\'oothu bika minal-kufri wal-faqr, wa a\'oothu bika min \'athaabil-qabr, la ilaha illa anta',
          translation: 'O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You.',
          source: 'أبو داود',
          category: 'morning',
          count: 3,
          reward: 'استعاذة من الكفر والفقر وعذاب القبر',
          times: 'ثلاث مرات'
        },
        {
          id: 132,
          arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
          transliteration: 'Qul huwallahu ahad, Allahus-samad, lam yalid wa lam yoolad, wa lam yakun lahu kufuwan ahad',
          translation: 'Say: He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.',
          source: 'سورة الإخلاص',
          category: 'morning',
          count: 3,
          reward: 'تعدل ثلث القرآن',
          times: 'ثلاث مرات'
        },
        {
          id: 133,
          arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
          transliteration: 'Qul a\'oothu birabbi-l-falaq, min sharri ma khalaq, wa min sharri ghasiqin itha waqab, wa min sharrin-naffathati fil-\'uqad, wa min sharri hasidin itha hasad',
          translation: 'Say: I seek refuge in the Lord of daybreak, From the evil of that which He created, And from the evil of darkness when it settles, And from the evil of the blowers in knots, And from the evil of an envier when he envies.',
          source: 'سورة الفلق',
          category: 'morning',
          count: 3,
          reward: 'حماية من الشر والحسد',
          times: 'ثلاث مرات'
        },
        {
          id: 134,
          arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَـهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ',
          transliteration: 'Qul a\'oothu birabbi-n-nas, maliki-n-nas, ilahi-n-nas, min sharril-waswasil-khannas, alladhee yuwaswisu fee sudoorin-nas, minal-jinnati wan-nas',
          translation: 'Say: I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer, Who whispers [evil] into the breasts of mankind, From among the jinn and mankind.',
          source: 'سورة الناس',
          category: 'morning',
          count: 3,
          reward: 'حماية من وساوس الشياطين',
          times: 'ثلاث مرات'
        },
        {
          id: 135,
          arabic: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لا إِلَـهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ',
          transliteration: 'Allahumma \'alimal-ghaybi wash-shahadati fatiras-samawati wal-ard, rabba kulli shay\'in wa maleekah, ashhadu an la ilaha illa anta, a\'oothu bika min sharri nafsee wa min sharrish-shaytani wa shirkihi',
          translation: 'O Allah, Knower of the unseen and the witnessed, Creator of the heavens and the earth, Lord of everything and its Owner, I bear witness that there is none worthy of worship but You. I seek refuge in You from the evil of my soul and from the evil of Satan and his polytheism.',
          source: 'الترمذي',
          category: 'morning',
          count: 1,
          reward: 'حماية من الشر والشرك',
          times: 'مرة واحدة'
        },
        {
          id: 136,
          arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
          transliteration: 'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namootu wa ilaykan-nushoor',
          translation: 'O Allah, by You we have reached the morning and by You we have reached the evening, by You we live and by You we die and to You is our resurrection.',
          source: 'الترمذي',
          category: 'morning',
          count: 1,
          reward: 'تفويض الأمر كله لله',
          times: 'مرة واحدة'
        },
        {
          id: 137,
          arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
          transliteration: 'Allahumma innee as\'alukal-huda wat-tuqa wal-\'afafa wal-ghina',
          translation: 'O Allah, I ask You for guidance, piety, chastity and contentment.',
          source: 'مسلم',
          category: 'morning',
          count: 1,
          reward: 'دعاء جامع للخير',
          times: 'مرة واحدة'
        },
        {
          id: 138,
          arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
          transliteration: 'Allahumma a\'innee ala thikrika wa shukrika wa husni \'ibadatik',
          translation: 'O Allah, help me remember You, to be grateful to You, and to worship You in an excellent manner.',
          source: 'أبو داود',
          category: 'morning',
          count: 1,
          reward: 'دعاء للإعانة على الذكر والشكر وحسن العبادة',
          times: 'مرة واحدة'
        },
        {
          id: 139,
          arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اللَّهُ لا إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لا تَأْخُذُهُ سِنَةٌ وَلا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلا يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
          transliteration: 'A\'oothu billahi minash-shaytanir-rajeem. Allahu la ilaha illa huwal-hayyul-qayyoom, la ta\'khuthuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man thal-lathee yashfa\'u \'indahu illa bi\'ithnih, ya\'lamu ma bayna aydeehim wa ma khalfahum, wa la yuheetoona bishay\'in min \'ilmihi illa bima sha\'a, wasi\'a kursiyyuhus-samawati wal-arda wa la ya\'ooduhu hifthuhuma wa huwal-\'aliyyul-\'atheem',
          translation: 'I seek refuge in Allah from Satan, the accursed one. Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
          source: 'آية الكرسي - البقرة',
          category: 'morning',
          count: 1,
          reward: 'من قرأها لم يزل عليه من الله حافظ',
          times: 'مرة واحدة'
        },
        {
          id: 140,
          arabic: 'لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          transliteration: 'La ilaha illallahu wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer',
          translation: 'None has the right to be worshipped but Allah alone, who has no partner. His is the dominion and His is the praise, and He is Able to do all things.',
          source: 'الترمذي',
          category: 'morning',
          count: 100,
          reward: 'كانت له عدل عشر رقاب وكتبت له مائة حسنة',
          times: '100 مرة'
        }
      ]
    },
    {
      id: 'evening',
      name: 'أذكار المساء',
      icon: '🌙',
      description: 'أذكار تُقال في المساء من بعد العصر حتى المغرب',
      azkar: [
        {
          id: 5,
          arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
          transliteration: 'Amsayna wa amsal-mulku lillahi walhamdu lillahi la ilaha illallahu wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer, rabbi as\'aluka khayra ma fee hathihil-laylati wa khayra ma ba\'daha, wa a\'oothu bika min sharri ma fee hathihil-laylati wa sharri ma ba\'daha, rabbi a\'oothu bika minal-kasali wa soo\'il-kibari, rabbi a\'oothu bika min \'athabin fin-nari wa \'athabin fil-qabri',
          translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
          source: 'مسلم',
          category: 'evening',
          count: 1,
          times: 'مرة واحدة'
        },
        {
          id: 6,
          arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
          transliteration: 'A\'oothu bikalimatil-lahit-tammati min sharri ma khalaq',
          translation: 'I take refuge in Allah\'s perfect words from the evil He has created.',
          source: 'مسلم',
          category: 'evening',
          count: 3,
          reward: 'من قالها ثلاث مرات لم تضره حمة تلك الليلة',
          times: 'ثلاث مرات'
        },
        {
          id: 106,
          arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma anta rabbee la ilaha illa anta, khalaqtanee wa ana abduka, wa ana ala ahdika wa wa\'dika mastata\'tu, a\'oothu bika min sharri ma sana\'tu, aboo\'u laka bini\'matika \'alayya, wa aboo\'u laka bithanbee faghfir lee fa\'innahu la yaghfiru ath-thunooba illa anta',
          translation: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.',
          source: 'البخاري',
          category: 'evening',
          count: 1,
          reward: 'من قالها من الليل موقناً بها فمات قبل أن يصبح فهو من أهل الجنة',
          times: 'مرة واحدة'
        },
        {
          id: 107,
          arabic: 'بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
          transliteration: 'Bismillahil-lathee la yadhurru ma\'as-mihi shay\'un fil-ardhi wa la fis-sama\'i wa huwas-samee\'ul-\'aleem',
          translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is the All-Seeing, the All-Knowing.',
          source: 'أبو داود',
          category: 'evening',
          count: 3,
          reward: 'من قالها ثلاثاً لم تصبه فجأة بلاء حتى يصبح',
          times: 'ثلاث مرات'
        },
        {
          id: 108,
          arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
          transliteration: 'Allahumma ma amsa bee min ni\'matin aw bi-ahadin min khalqika faminka wahdaka la shareeka laka falakaal-hamdu wa lakash-shukr',
          translation: 'O Allah, what blessing I or any of Your creation have reached the evening upon, is from You alone, without partner, so for You is all praise and unto You all thanks.',
          source: 'أبو داود',
          category: 'evening',
          count: 1,
          reward: 'من قالها فقد أدى شكر ليلته',
          times: 'مرة واحدة'
        },
        {
          id: 109,
          arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لا إِلَهَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma \'aafini fee badanee, allahumma \'aafini fee sam\'ee, allahumma \'aafini fee basaree, la ilaha illa anta',
          translation: 'O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You.',
          source: 'أبو داود',
          category: 'evening',
          count: 3,
          reward: 'دعاء للعافية في البدن والحواس',
          times: 'ثلاث مرات'
        },
        {
          id: 141,
          arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
          transliteration: 'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namootu wa ilaykal-maseer',
          translation: 'O Allah, by You we have reached the evening and by You we have reached the morning, by You we live and by You we die and to You is our return.',
          source: 'الترمذي',
          category: 'evening',
          count: 1,
          reward: 'تفويض الأمر كله لله',
          times: 'مرة واحدة'
        },
        {
          id: 142,
          arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
          transliteration: 'Qul huwallahu ahad, Allahus-samad, lam yalid wa lam yoolad, wa lam yakun lahu kufuwan ahad',
          translation: 'Say: He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.',
          source: 'سورة الإخلاص',
          category: 'evening',
          count: 3,
          reward: 'تعدل ثلث القرآن',
          times: 'ثلاث مرات'
        },
        {
          id: 143,
          arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
          transliteration: 'Qul a\'oothu birabbi-l-falaq, min sharri ma khalaq, wa min sharri ghasiqin itha waqab, wa min sharrin-naffathati fil-\'uqad, wa min sharri hasidin itha hasad',
          translation: 'Say: I seek refuge in the Lord of daybreak, From the evil of that which He created, And from the evil of darkness when it settles, And from the evil of the blowers in knots, And from the evil of an envier when he envies.',
          source: 'سورة الفلق',
          category: 'evening',
          count: 3,
          reward: 'حماية من الشر والحسد',
          times: 'ثلاث مرات'
        },
        {
          id: 144,
          arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَـهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ',
          transliteration: 'Qul a\'oothu birabbi-n-nas, maliki-n-nas, ilahi-n-nas, min sharril-waswasil-khannas, alladhee yuwaswisu fee sudoorin-nas, minal-jinnati wan-nas',
          translation: 'Say: I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer, Who whispers [evil] into the breasts of mankind, From among the jinn and mankind.',
          source: 'سورة الناس',
          category: 'evening',
          count: 3,
          reward: 'حماية من وساوس الشياطين',
          times: 'ثلاث مرات'
        },
        {
          id: 145,
          arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ رَسُولاً',
          transliteration: 'Radheetu billahi rabban, wa bil-islaami deenan, wa bi-muhammadin sallallahu \'alayhi wa sallama rasoolan',
          translation: 'I am pleased with Allah as a Lord, and Islam as a religion and Muhammad peace be upon him as a Messenger.',
          source: 'أبو داود',
          category: 'evening',
          count: 3,
          reward: 'كان حقاً على الله أن يرضيه يوم القيامة',
          times: 'ثلاث مرات'
        },
        {
          id: 146,
          arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لا إِلَهَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma innee a\'oothu bika minal-kufri wal-faqr, wa a\'oothu bika min \'athaabil-qabr, la ilaha illa anta',
          translation: 'O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You.',
          source: 'أبو داود',
          category: 'evening',
          count: 3,
          reward: 'استعاذة من الكفر والفقر وعذاب القبر',
          times: 'ثلاث مرات'
        }
      ]
    },
    {
      id: 'general',
      name: 'الأذكار العامة',
      icon: '📿',
      description: 'أذكار متنوعة تُقال في أي وقت',
      azkar: [
        {
          id: 7,
          arabic: 'سُبْحَانَ اللَّهِ',
          transliteration: 'Subhan Allah',
          translation: 'Glory is to Allah',
          source: 'متفق عليه',
          category: 'general',
          count: 33,
          reward: 'من أعظم الأذكار',
          times: '33 مرة'
        },
        {
          id: 8,
          arabic: 'الْحَمْدُ لِلَّهِ',
          transliteration: 'Alhamdulillah',
          translation: 'All praise is due to Allah',
          source: 'متفق عليه',
          category: 'general',
          count: 33,
          reward: 'تملأ الميزان',
          times: '33 مرة'
        },
        {
          id: 9,
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: 'Allahu Akbar',
          translation: 'Allah is the greatest',
          source: 'متفق عليه',
          category: 'general',
          count: 34,
          reward: 'تملأ ما بين السماء والأرض',
          times: '34 مرة'
        },
        {
          id: 10,
          arabic: 'لا إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          transliteration: 'La ilaha illa Allah wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer',
          translation: 'None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
          source: 'البخاري',
          category: 'general',
          count: 10,
          reward: 'كانت له عدل عشر رقاب',
          times: '10 مرات'
        },
        {
          id: 110,
          arabic: 'لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ',
          transliteration: 'La hawla wa la quwwata illa billah',
          translation: 'There is no might nor power except with Allah',
          source: 'البخاري',
          category: 'general',
          count: 100,
          reward: 'كنز من كنوز الجنة',
          times: '100 مرة'
        },
        {
          id: 111,
          arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
          transliteration: 'Subhan Allahi wa bihamdih, subhan Allah al-\'atheem',
          translation: 'Glory and praise to Allah, Glory to Allah the Almighty',
          source: 'مسلم',
          category: 'general',
          count: 1,
          reward: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان',
          times: 'أي عدد'
        },
        {
          id: 112,
          arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
          transliteration: 'Astaghfirullah wa atoobu ilayh',
          translation: 'I seek forgiveness of Allah and repent to Him',
          source: 'البخاري',
          category: 'general',
          count: 70,
          reward: 'كان النبي صلى الله عليه وسلم يستغفر في اليوم أكثر من سبعين مرة',
          times: '70 مرة'
        },
        {
          id: 113,
          arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
          transliteration: 'Allahumma salli wa sallim \'ala nabiyyina Muhammad',
          translation: 'O Allah, send prayers and peace upon our Prophet Muhammad',
          source: 'الترمذي',
          category: 'general',
          count: 10,
          reward: 'من صلى علي واحدة صلى الله عليه عشراً',
          times: '10 مرات'
        },
        {
          id: 114,
          arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
          transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'athab an-nar',
          translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire',
          source: 'البقرة',
          category: 'general',
          count: 1,
          reward: 'دعاء جامع لخير الدنيا والآخرة',
          times: 'أي عدد'
        }
      ]
    },
    {
      id: 'istighfar',
      name: 'الاستغفار',
      icon: '🤲',
      description: 'أذكار الاستغفار والتوبة',
      azkar: [
        {
          id: 11,
          arabic: 'أَسْتَغْفِرُ اللَّهَ',
          transliteration: 'Astaghfirullah',
          translation: 'I seek forgiveness of Allah',
          source: 'البخاري',
          category: 'istighfar',
          count: 100,
          reward: 'من أعظم الأذكار',
          times: '100 مرة'
        },
        {
          id: 12,
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لا إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
          transliteration: 'Astaghfirul-lahal-\'atheemil-lathee la ilaha illa huwal-hayyul-qayyoomu wa atoobu ilayh',
          translation: 'I seek forgiveness of Allah the Mighty, Whom there is none worthy of worship except Him, the Living, the Eternal, and I repent unto Him.',
          source: 'أبو داود',
          category: 'istighfar',
          count: 1,
          reward: 'غُفر له وإن كان فر من الزحف',
          times: 'مرة واحدة'
        },
        {
          id: 115,
          arabic: 'رَبِّ اغْفِرْ لِي ذَنْبِي وَخَطَئِي وَجَهْلِي',
          transliteration: 'Rabbi ghfir lee thanbee wa khata\'ee wa jahlee',
          translation: 'My Lord, forgive me my sin, my error, and my ignorance',
          source: 'البخاري',
          category: 'istighfar',
          count: 1,
          reward: 'دعاء شامل للمغفرة',
          times: 'أي عدد'
        },
        {
          id: 116,
          arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي، وَوَسِّعْ لِي فِي دَارِي، وَبَارِكْ لِي فِي رِزْقِي',
          transliteration: 'Allahumma ghfir lee thanbee wa wassi\' lee fee daaree wa baarik lee fee rizqee',
          translation: 'O Allah, forgive me my sin, expand for me my home, and bless me in my provision',
          source: 'الطبراني',
          category: 'istighfar',
          count: 1,
          reward: 'دعاء للمغفرة وسعة الرزق والمنزل',
          times: 'أي عدد'
        },
        {
          id: 117,
          arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ',
          transliteration: 'Astaghfirullah rabbee min kulli thanbin wa atoobu ilayh',
          translation: 'I seek forgiveness of Allah, my Lord, from every sin and I repent to Him',
          source: 'أبو داود',
          category: 'istighfar',
          count: 1,
          reward: 'استغفار شامل من جميع الذنوب',
          times: 'أي عدد'
        }
      ]
    },
    {
      id: 'sleep',
      name: 'أذكار النوم',
      icon: '🌛',
      description: 'أذكار تُقال قبل النوم',
      azkar: [
        {
          id: 118,
          arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
          transliteration: 'Bismika rabbee wada\'tu janbee, wa bika arfa\'uhu, fa\'in amsakta nafsee farhamha, wa in arsaltaha fahfathha bima tahfathu bihi \'ibaadakas-saliheen',
          translation: 'In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it in the manner You do so with Your righteous servants.',
          source: 'البخاري',
          category: 'sleep',
          count: 1,
          reward: 'دعاء قبل النوم للحفظ والرحمة',
          times: 'مرة واحدة'
        },
        {
          id: 119,
          arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
          transliteration: 'Allahumma qinee \'athaabaka yawma tab\'athu \'ibaadak',
          translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
          source: 'أبو داود',
          category: 'sleep',
          count: 3,
          reward: 'حماية من عذاب يوم القيامة',
          times: 'ثلاث مرات'
        },
        {
          id: 120,
          arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
          transliteration: 'Allahumma bismika amootu wa ahya',
          translation: 'O Allah, in Your name I live and die.',
          source: 'البخاري',
          category: 'sleep',
          count: 1,
          reward: 'تفويض الأمر لله في النوم والاستيقاظ',
          times: 'مرة واحدة'
        }
      ]
    },
    {
      id: 'wakeup',
      name: 'أذكار الاستيقاظ',
      icon: '☀️',
      description: 'أذكار تُقال عند الاستيقاظ من النوم',
      azkar: [
        {
          id: 121,
          arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
          transliteration: 'Alhamdulillahil-lathee ahyana ba\'da ma amatana wa ilayhin-nushoor',
          translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
          source: 'البخاري',
          category: 'wakeup',
          count: 1,
          reward: 'شكر الله على إحياء بعد النوم',
          times: 'مرة واحدة'
        },
        {
          id: 122,
          arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
          transliteration: 'Allahumma \'aafini fee badanee, allahumma \'aafini fee sam\'ee, allahumma \'aafini fee basaree',
          translation: 'O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health.',
          source: 'أبو داود',
          category: 'wakeup',
          count: 3,
          reward: 'دعاء للعافية في البدن والحواس',
          times: 'ثلاث مرات'
        }
      ]
    },
    {
      id: 'food',
      name: 'أذكار الطعام',
      icon: '🍽️',
      description: 'أذكار تُقال قبل وبعد الطعام',
      azkar: [
        {
          id: 123,
          arabic: 'بِسْمِ اللَّهِ',
          transliteration: 'Bismillah',
          translation: 'In the name of Allah',
          source: 'الترمذي',
          category: 'food',
          count: 1,
          reward: 'بركة في الطعام',
          times: 'قبل الطعام'
        },
        {
          id: 124,
          arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
          transliteration: 'Alhamdulillahil-lathee at\'amana wa saqana wa ja\'alana muslimeen',
          translation: 'All praise is for Allah who fed us and gave us drink and made us Muslims.',
          source: 'أبو داود',
          category: 'food',
          count: 1,
          reward: 'شكر الله على الطعام والشراب والإسلام',
          times: 'بعد الطعام'
        },
        {
          id: 125,
          arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ، بِسْمِ اللَّهِ',
          transliteration: 'Allahumma baarik lana feema razaqtana wa qina \'athab an-nar, bismillah',
          translation: 'O Allah, bless for us what You have provided us and protect us from the punishment of the Fire. In the name of Allah.',
          source: 'الترمذي',
          category: 'food',
          count: 1,
          reward: 'دعاء للبركة في الرزق والحماية من النار',
          times: 'قبل الطعام'
        }
      ]
    },
    {
      id: 'travel',
      name: 'أذكار السفر',
      icon: '✈️',
      description: 'أذكار تُقال في السفر',
      azkar: [
        {
          id: 126,
          arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
          transliteration: 'Subhanal-lathee sakhkhara lana hatha wa ma kunna lahu muqrineen wa inna ila rabbina lamunqaliboon',
          translation: 'Exalted is He who has subjected this to us, and we could not have [otherwise] subdued it. And indeed we, to our Lord, will [surely] return.',
          source: 'أبو داود',
          category: 'travel',
          count: 1,
          reward: 'دعاء ركوب وسائل النقل',
          times: 'عند ركوب وسيلة النقل'
        },
        {
          id: 127,
          arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى',
          transliteration: 'Allahumma inna nas\'aluka fee safarina hathal-birra wat-taqwa wa minal-\'amali ma tardha',
          translation: 'O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You.',
          source: 'الترمذي',
          category: 'travel',
          count: 1,
          reward: 'دعاء عند بداية السفر',
          times: 'عند بداية السفر'
        },
        {
          id: 128,
          arabic: 'اللَّهُمَّ اطْوِ لَنَا الْأَرْضَ وَهَوِّنْ عَلَيْنَا السَّفَرَ',
          transliteration: 'Allahumma itwi lanal-ardha wa hawwin \'alaynas-safar',
          translation: 'O Allah, shorten the earth for us and make this journey easy for us.',
          source: 'الطبراني',
          category: 'travel',
          count: 1,
          reward: 'دعاء لتسهيل السفر',
          times: 'أثناء السفر'
        }
      ]
    },
    {
      id: 'weather',
      name: 'أذكار الطقس',
      icon: '🌦️',
      description: 'أذكار تُقال عند تغير الطقس',
      azkar: [
        {
          id: 129,
          arabic: 'اللَّهُمَّ صَيِّباً نَافِعاً',
          transliteration: 'Allahumma sayyiban nafi\'an',
          translation: 'O Allah, [bring us] beneficial rain.',
          source: 'البخاري',
          category: 'weather',
          count: 1,
          reward: 'دعاء عند نزول المطر',
          times: 'عند نزول المطر'
        },
        {
          id: 130,
          arabic: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ',
          transliteration: 'Mutirnaa bifadhlillahi wa rahmatih',
          translation: 'We have been given rain by the grace of Allah and His mercy.',
          source: 'البخاري',
          category: 'weather',
          count: 1,
          reward: 'شكر الله على المطر',
          times: 'بعد نزول المطر'
        },
        {
          id: 131,
          arabic: 'اللَّهُمَّ حَوَالَيْنَا وَلا عَلَيْنَا، اللَّهُمَّ عَلَى الآكَامِ وَالظِّرَابِ وَبُطُونِ الْأَوْدِيَةِ وَمَنَابِتِ الشَّجَرِ',
          transliteration: 'Allahumma hawalayna wa la \'alayna, allahumma \'alal-akami wadh-dhirabi wa butoonil-awdiyati wa manabitis-shajar',
          translation: 'O Allah, [let it rain] around us and not upon us. O Allah, [let it rain] on the pastures, hills, valleys and the roots of trees.',
          source: 'البخاري',
          category: 'weather',
          count: 1,
          reward: 'دعاء عند شدة المطر',
          times: 'عند شدة المطر'
        }
      ]
    }
  ];

  // Load user progress when component mounts
  useEffect(() => {
    const savedProgress = localStorage.getItem('azkar_progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Update progress for a specific zikr
  const updateProgress = (zikreId: number, currentCount: number) => {
    const newProgress = { ...userProgress, [zikreId]: currentCount };
    setUserProgress(newProgress);
    localStorage.setItem('azkar_progress', JSON.stringify(newProgress));
  };

  // Increment counter for a zikr
  const incrementCounter = (zikr: Zikr) => {
    const currentCount = userProgress[zikr.id] || 0;
    const newCount = currentCount + 1;
    
    updateProgress(zikr.id, newCount);
    
    if (newCount >= zikr.count) {
      setCompletedAzkar(prev => new Set(prev).add(zikr.id));
    }
  };

  // Reset counter for a zikr
  const resetCounter = (zikreId: number) => {
    updateProgress(zikreId, 0);
    setCompletedAzkar(prev => {
      const newSet = new Set(prev);
      newSet.delete(zikreId);
      return newSet;
    });
  };

  // Get filtered azkar based on search term
  const getFilteredAzkar = (azkar: Zikr[]) => {
    if (!searchTerm) return azkar;
    
    return azkar.filter(zikr => 
      zikr.arabic.includes(searchTerm) ||
      zikr.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zikr.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentCategory = azkarCategories.find(cat => cat.id === selectedCategory);
  const filteredAzkar = currentCategory ? getFilteredAzkar(currentCategory.azkar) : [];

  const cardStyle = {
    background: isDarkMode 
      ? 'rgba(15, 23, 42, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: `0 10px 30px ${theme.colors.shadow}`,
    marginBottom: '1rem'
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            80% { transform: translateY(-5px); }
          }
          .zikr-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px ${theme.colors.shadow};
          }
          .counter-button:active {
            transform: scale(0.95);
          }
        `}
      </style>
      <div style={{
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
        direction: 'rtl',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤲</div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              الأذكار والأدعية
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: theme.colors.textSecondary,
              marginBottom: '2rem'
            }}>
              مجموعة شاملة من الأذكار والأدعية النبوية الصحيحة
            </p>
          </div>

          {/* Category Selection */}
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              اختر فئة الأذكار
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {azkarCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    background: selectedCategory === category.id
                      ? theme.gradients.primary
                      : isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.5)',
                    border: selectedCategory === category.id
                      ? 'none'
                      : `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    color: selectedCategory === category.id
                      ? 'white'
                      : theme.colors.text,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {category.icon}
                  </div>
                  <div>{category.name}</div>
                  <div style={{
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    opacity: 0.8
                  }}>
                    {category.azkar.length} ذكر
                  </div>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الأذكار..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: isDarkMode ? '#1e293b' : 'white',
                  color: theme.colors.text,
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Category Description */}
          {currentCategory && (
            <div style={cardStyle}>
              <div style={{
                textAlign: 'center',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {currentCategory.icon}
                </div>
                <h2 style={{
                  color: theme.colors.text,
                  fontSize: '2rem',
                  marginBottom: '1rem'
                }}>
                  {currentCategory.name}
                </h2>
                <p style={{
                  color: theme.colors.textSecondary,
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {currentCategory.description}
                </p>
              </div>
            </div>
          )}

          {/* Azkar List */}
          {filteredAzkar.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {filteredAzkar.map((zikr) => {
                const currentCount = userProgress[zikr.id] || 0;
                const isCompleted = currentCount >= zikr.count;
                const progressPercentage = Math.min((currentCount / zikr.count) * 100, 100);

                return (
                  <div
                    key={zikr.id}
                    className="zikr-card"
                    style={{
                      ...cardStyle,
                      background: isCompleted
                        ? isDarkMode 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(34, 197, 94, 0.05)'
                        : cardStyle.background,
                      border: isCompleted
                        ? '2px solid rgba(34, 197, 94, 0.5)'
                        : cardStyle.border,
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Zikr Text */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <p style={{
                        fontSize: '1.8rem',
                        color: theme.colors.text,
                        lineHeight: '1.8',
                        marginBottom: '1rem',
                        fontFamily: 'Amiri, serif'
                      }}>
                        {zikr.arabic}
                      </p>
                      
                      <p style={{
                        fontSize: '1rem',
                        color: theme.colors.textSecondary,
                        fontStyle: 'italic',
                        marginBottom: '0.5rem'
                      }}>
                        {zikr.transliteration}
                      </p>
                      
                      <p style={{
                        fontSize: '1rem',
                        color: theme.colors.textSecondary,
                        lineHeight: '1.6'
                      }}>
                        {zikr.translation}
                      </p>
                    </div>

                    {/* Counter Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <button
                        onClick={() => resetCounter(zikr.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          color: 'white',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        🔄
                      </button>

                      <div style={{
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        borderRadius: '15px',
                        padding: '1rem 2rem',
                        textAlign: 'center',
                        minWidth: '120px'
                      }}>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: isCompleted ? '#22c55e' : theme.colors.text
                        }}>
                          {currentCount}/{zikr.count}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: theme.colors.textSecondary,
                          marginTop: '0.25rem'
                        }}>
                          {zikr.times}
                        </div>
                      </div>

                      <button
                        className="counter-button"
                        onClick={() => incrementCounter(zikr)}
                        disabled={isCompleted}
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                            : theme.gradients.primary,
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.75rem 1.5rem',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: isCompleted ? 'default' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: isCompleted ? 0.8 : 1
                        }}
                      >
                        {isCompleted ? '✅' : '📿'}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      borderRadius: '10px',
                      height: '8px',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : theme.gradients.primary,
                        height: '100%',
                        width: `${progressPercentage}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Source and Reward */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: theme.colors.textSecondary
                    }}>
                      <div>
                        <strong>المصدر:</strong> {zikr.source}
                      </div>
                      {zikr.reward && (
                        <div style={{
                          background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          maxWidth: '300px'
                        }}>
                          <strong>الأجر:</strong> {zikr.reward}
                        </div>
                      )}
                    </div>

                    {/* Completion Badge */}
                    {isCompleted && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        animation: 'bounce 1s ease-in-out'
                      }}>
                        مكتمل ✅
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{
                textAlign: 'center',
                padding: '3rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p style={{
                  fontSize: '1.2rem',
                  color: theme.colors.textSecondary
                }}>
                  لم يتم العثور على أذكار تطابق البحث
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}
          {currentCategory && (
            <div style={cardStyle}>
              <h3 style={{
                color: theme.colors.text,
                marginBottom: '1rem',
                fontSize: '1.5rem',
                textAlign: 'center'
              }}>
                📊 إحصائيات التقدم
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  background: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                    {completedAzkar.size}
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    أذكار مكتملة
                  </div>
                </div>
                
                <div style={{
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                    {currentCategory.azkar.length}
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    إجمالي الأذكار
                  </div>
                </div>
                
                <div style={{
                  background: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#a855f7', marginBottom: '0.5rem' }}>
                    {Math.round((completedAzkar.size / currentCategory.azkar.length) * 100)}%
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    نسبة الإكمال
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Azkar;
