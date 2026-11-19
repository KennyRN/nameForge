// Brief 6c B1: the people tables of the Indian, Chinese, Japanese and Korean cultures, rewritten. Ordinary attested names lead each list; rulers, generals, sages, poets and founders are flagged `^r`
// and held last (a fifth of a list at most). People only: no god's name. Chinese, Japanese and Korean full names are family name first (the forms in people.json keep that order);
// romanisation is pinyin (Chinese), Hepburn without macrons (Japanese) and Revised Romanisation (Korean). Existing surnames, holy forms and ruler forms are kept.
export const INDIAN = {
  historic: {
    male: "Ramdas|Gopal|Mohan|Shyam|Raghunath|Venkat|Subramanian|Anand|Bhaskar|Dinanath|Tukaram|Yashwant|Bhimsen|Gangadhar|Vishwanath|Ranjit|Sundar|Murali|Sitaram|Devendra|Harish|Kishore|Prakash|Ravindra|Ashoka^r|Chandragupta^r|Akbar^r|Shivaji^r|Harsha^r|Vikramaditya^r",
    female: "Kamala|Meena|Shanta|Leela|Sundari|Manjari|Padma|Revati|Chandni|Malati|Indira|Kaveri|Anjana|Bimala|Champa|Gayatri|Hema|Indumati|Jamuna|Kusum|Mallika|Nalini|Sarla|Tara|Mirabai^r|Razia^r|Ahilyabai^r|Lakshmibai^r|Noor Jahan^r|Mumtaz^r",
    regnalMale: "Ashoka|Chandragupta|Akbar|Shivaji|Harsha|Rajaraja|Krishnadevaraya|Vikramaditya", regnalFemale: "Razia|Ahilyabai|Lakshmibai|Didda|Rudrama|Chennamma|Mumtaz|Mirabai",
    holy: "Kabir|Nanak|Tukaram|Ramanuja|Shankara|Basava|Tulsidas|Chaitanya|Namdev|Ravidas|Eknath|Dadu",
  },
  modern: {
    male: "Rahul|Amit|Vijay|Sanjay|Rajesh|Suresh|Ramesh|Anil|Sunil|Manoj|Deepak|Rohit|Ankit|Nikhil|Karan|Varun|Aman|Vikram|Siddharth|Abhishek|Pranav|Yash|Harsh|Kunal|Mayank|Ritesh|Sandeep|Naveen|Gaurav|Tarun|Akash",
    recentMale: "Aarav|Vihaan|Reyansh|Ayaan|Advait|Kabir|Shaurya|Ishaan|Atharv|Krish|Vivaan|Arnav",
    female: "Priya|Neha|Pooja|Anjali|Sunita|Kavita|Anita|Meena|Rekha|Sapna|Divya|Swati|Nisha|Shweta|Deepika|Ritu|Preeti|Komal|Shalini|Pallavi|Sneha|Ankita|Kriti|Tanvi|Isha|Manisha|Aditi|Bhavna|Jyoti|Shruti",
    recentFemale: "Aadhya|Anaya|Diya|Myra|Saanvi|Kiara|Aarohi|Anika|Navya|Pari|Ira|Avni",
    regnalMale: "Ashoka|Chandragupta|Akbar|Shivaji|Harsha|Rajaraja|Krishnadevaraya|Vikramaditya", regnalFemale: "Razia|Ahilyabai|Lakshmibai|Didda|Rudrama|Chennamma|Mumtaz|Mirabai",
    holy: "Kabir|Nanak|Tukaram|Ramanuja|Shankara|Basava|Tulsidas|Chaitanya|Namdev|Ravidas|Eknath|Dadu",
  },
};
export const CHINESE = {
  historic: {
    male: "Yong|Ming|Guang|Wen|Bo|Zhi|Heng|Qiang|Zhen|Rong|Yuan|Kai|Hong|Cheng|Jian|Tao|Lei|Hui|Feng|Gang|Long|Xin|Chang|Jin|Mengde^r|Xuande^r|Kongming^r|Taibai^r|Dufu^r|Zhongni^r",
    female: "Mei|Lan|Xiu|Ying|Fang|Juan|Ping|Qing|Jing|Yun|Hua|Zhen|Li|Yan|Xia|Lian|Ling|Fen|Shu|Ru|Rong|Chun|Hong|Zhu|Zhaojun^r|Xishi^r|Yuhuan^r|Qingzhao^r|Wenji^r|Wuzhao^r",
    regnalMale: "Taizong|Gaozu|Wudi|Hongwu|Yongle|Kangxi|Qianlong|Guangxu", regnalFemale: "Wuzetian|Cixi|Lu|Feng|Deng|Liang|Xiaozhuang|Ciji",
    holy: "Kongzi|Laozi|Zhuangzi|Mengzi|Mozi|Xunzi|Bodhidharma|Huineng|Xuanzang|Zhuxi|Wangyangming|Zhangdaoling",
  },
  modern: {
    male: "Wei|Jun|Hao|Qiang|Lei|Tao|Gang|Jie|Bo|Peng|Yang|Chao|Kai|Bin|Xin|Cheng|Dong|Long|Yu|Ming|Haoran|Yuchen|Zihan|Yuxuan|Zixuan|Ziyang|Jiahao|Junjie|Haoyu|Zhiyuan",
    recentMale: "Haoran|Yuchen|Zihan|Yuxuan|Zixuan|Ziyang|Jiahao|Junjie|Haoyu|Boyang|Zimo|Yichen",
    female: "Li|Na|Min|Jing|Yan|Fang|Juan|Ying|Hui|Xia|Xiu|Lan|Mei|Ping|Qing|Yun|Hua|Ling|Xinyi|Yiran|Zixin|Yuxin|Meixi|Ziyi|Xinyue|Ruoxi|Yutong|Jiaqi|Shuhui|Wenjing",
    recentFemale: "Xinyi|Yiran|Zixin|Yuxin|Meixi|Ziyi|Xinyue|Ruoxi|Yutong|Jiaqi|Shuxin|Yihan",
    regnalMale: "Taizong|Gaozu|Wudi|Hongwu|Yongle|Kangxi|Qianlong|Guangxu", regnalFemale: "Wuzetian|Cixi|Lu|Feng|Deng|Liang|Xiaozhuang|Ciji",
    holy: "Kongzi|Laozi|Zhuangzi|Mengzi|Mozi|Xunzi|Bodhidharma|Huineng|Xuanzang|Zhuxi|Wangyangming|Zhangdaoling",
  },
};
export const JAPANESE = {
  historic: {
    male: "Taro|Jiro|Saburo|Shiro|Goro|Kenji|Shigeru|Hiroshi|Isamu|Kiyoshi|Masao|Noboru|Tadashi|Takeshi|Yoshio|Akira|Haruo|Isao|Kazuo|Minoru|Osamu|Satoshi|Tetsuo|Fumio|Yoshitsune^r|Yoritomo^r|Nobunaga^r|Hideyoshi^r|Ieyasu^r|Shingen^r",
    female: "Hana|Ine|Haru|Kiku|Matsu|Sumi|Tsuru|Yoshi|Fuji|Kane|Ume|Shige|Toki|Chiyo|Shizu|Natsu|Aki|Fuyu|Mitsu|Take|Yuki|Tama|Miyo|Kikuno|Murasaki^r|Sei^r|Tomoe^r|Masako^r|Himiko^r|Shizuka^r",
    regnalMale: "Tenmu|Shomu|Kammu|Daigo|Gotoba|Gosaga|Meiji|Taisho", regnalFemale: "Suiko|Jito|Koken|Genmei|Gensho|Kogyoku|Saimei|Shotoku",
    holy: "Kukai|Saicho|Honen|Shinran|Nichiren|Dogen|Eisai|Ikkyu|Basho|Ryokan|Hakuin|Rennyo",
  },
  modern: {
    male: "Kenta|Takumi|Daisuke|Shota|Haruto|Yuto|Sota|Ren|Hayato|Riku|Kaito|Yuki|Ryo|Naoki|Kenji|Hiroki|Tomoya|Yusuke|Masato|Shun|Taiga|Koki|Daiki|Sho|Kazuki|Ryota|Takuya|Tsubasa|Yuma|Haruki",
    recentMale: "Haruto|Yuto|Sota|Ren|Hayato|Riku|Kaito|Minato|Asahi|Yuma|Itsuki|Souta",
    female: "Ayumi|Emi|Yumi|Mari|Yui|Hina|Sakura|Aoi|Rin|Mio|Mei|Yuna|Koharu|Riko|Nanami|Misaki|Haruka|Ayaka|Mika|Saki|Nana|Kana|Miyu|Risa|Natsuki|Airi|Honoka|Momoka|Himari|Yuzuki",
    recentFemale: "Himari|Mei|Rin|Yua|Sakura|Hina|Akari|Mio|Koharu|Aoi|Yuna|Ichika",
    regnalMale: "Tenmu|Shomu|Kammu|Daigo|Gotoba|Gosaga|Meiji|Taisho", regnalFemale: "Suiko|Jito|Koken|Genmei|Gensho|Kogyoku|Saimei|Shotoku",
    holy: "Kukai|Saicho|Honen|Shinran|Nichiren|Dogen|Eisai|Ikkyu|Basho|Ryokan|Hakuin|Rennyo",
  },
};
export const KOREAN = {
  historic: {
    male: "Min-su|Dong-su|Jung-ho|Sang-gu|Chul-su|Young-gil|Bong-su|Gil-dong|Man-su|Dae-su|Seok|Tae-su|Jae-sik|Ki-chul|Won-sik|Ho-dong|Kyu-hyun|Hee-chul|Du-sik|Han-su|Byung-ho|Chang-ho|Yong-sik|Gwi-nam|Sejong^r|Taejo^r|Jumong^r|Gwanggaeto^r|Sunsin^r|Jeongjo^r",
    female: "Soon-ae|Mal-sun|Bok-sun|Ok-sun|Chun-ja|Boon-ja|Jung-sook|Ae-ja|Myung-ja|Gap-sun|Mal-ja|Bong-sun|Yeong-ja|Sun-hee|Geum-ja|Eun-ja|Hae-ja|Nam-sun|Dal-rae|Mi-sook|Gi-ja|Jeom-sun|Chae-ryeong|Wol-hyang|Seondeok^r|Jindeok^r|Saimdang^r|Nongae^r|Hwang-jini^r|Nanseolheon^r",
    regnalMale: "Sejong|Taejo|Gwanggaeto|Jeongjo|Taejong|Seongjong|Yeongjo|Sukjong", regnalFemale: "Seondeok|Jindeok|Jinseong|Munjeong|Wonseong|Insu|Jeonghui|Sohyeon",
    holy: "Wonhyo|Uisang|Jinul|Uicheon|Toegye|Yulgok|Seosan|Gyunyeo|Muhak|Chiwon|Daegak|Hyecho",
  },
  modern: {
    male: "Min-jun|Seo-jun|Do-yun|Ye-jun|Si-woo|Ha-jun|Joo-won|Ji-ho|Jun-seo|Ji-hoon|Hyun-woo|Woo-jin|Sung-min|Jae-hyun|Dong-hyun|Tae-yang|Jun-ho|Seung-hyun|Young-ho|Sung-ho|Jong-su|Kyung-su|Min-ho|Jin-woo|Hyun-su|Ji-sung|Dae-hyun|Sang-woo|Yu-jin|Ki-tae",
    recentMale: "Seo-jun|Ha-jun|Do-yun|Ye-jun|Si-woo|Joo-won|Ji-ho|Jun-seo|Eun-woo|Yu-jun|Ji-an|Woo-jin",
    female: "Seo-yeon|Ha-yoon|Ji-woo|Seo-ah|Ha-eun|Ji-yoo|Su-bin|Min-seo|Chae-won|Ye-jin|So-yeon|Da-eun|Yu-na|Ji-min|Eun-seo|Soo-jin|Hye-jin|Mi-young|Eun-ji|Hyo-jin|Na-young|Yeon-woo|Ji-hye|Seul-gi|Bo-ra|Da-hye|Ga-eun|Hee-jin|Jung-ah|Ye-eun",
    recentFemale: "Seo-yeon|Ha-yoon|Seo-ah|Ha-eun|Ji-yoo|Yun-seo|Ji-an|Ha-rin|Seo-yun|Ji-yu|Ye-rin|Min-seo",
    regnalMale: "Sejong|Taejo|Gwanggaeto|Jeongjo|Taejong|Seongjong|Yeongjo|Sukjong", regnalFemale: "Seondeok|Jindeok|Jinseong|Munjeong|Wonseong|Insu|Jeonghui|Sohyeon",
    holy: "Wonhyo|Uisang|Jinul|Uicheon|Toegye|Yulgok|Seosan|Gyunyeo|Muhak|Chiwon|Daegak|Hyecho",
  },
};
