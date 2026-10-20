// DARKFLOW // 虚构内容数据层
// 所有商品、人物、组织、地址均为虚构。本文件不含任何真实服务、真实地址或可执行信息。

export const META = {
  title: 'DARKFLOW',
  cn: '暗河',
  version: '1.4.0',
  addr: 'darkflow7kx9q2vz4m8w.onion',
  currency: 'DKC',
  disclaimer: '虚构模拟 · 无真实交易 · 无真实服务',
};

export const CATS = [
  { id: 'data', name: '数据', en: 'DATA', glyph: '▤', color: '#9dff3c' },
  { id: 'id', name: '身份', en: 'IDENTITY', glyph: '▣', color: '#59d7ff' },
  { id: 'hw', name: '黑硬件', en: 'HARDWARE', glyph: '▥', color: '#c9a4ff' },
  { id: 'bio', name: '生物样本', en: 'BIO', glyph: '◈', color: '#ffb64d' },
  { id: 'svc', name: '服务', en: 'SERVICE', glyph: '⌗', color: '#ff6b6b' },
  { id: 'shell', name: '公司壳', en: 'SHELL', glyph: '◎', color: '#8ef0c0' },
];

export const RARITY = {
  common: { name: '普通', w: 55, mult: 1 },
  rare: { name: '稀有', w: 27, mult: 1.9 },
  epic: { name: '史诗', w: 13, mult: 3.6 },
  legend: { name: '传说', w: 5, mult: 7.2 },
};

export const VENDORS = [
  { id: 'MOTH', name: 'MOTH', cn: '飞蛾', rating: 4.2, trades: 218, note: '话多，货杂，偶尔失联。' },
  { id: 'KIRA', name: 'KIRA', cn: '基拉', rating: 4.7, trades: 964, note: '稳定供货，涨价从不解释。' },
  { id: '77', name: '77', cn: '七七', rating: 3.6, trades: 88, note: '便宜得让人不安。' },
  { id: 'VELVET', name: 'VELVET', cn: '绒', rating: 4.9, trades: 1402, note: '只做熟客，发货像仪式。' },
  { id: 'DR_NULL', name: 'DR_NULL', cn: '零博士', rating: 4.0, trades: 402, note: '生物样本专家，附赠免责声明。' },
  { id: 'PALE_HORSE', name: 'PALE_HORSE', cn: '灰马', rating: 4.5, trades: 731, note: '物流出身，什么都运过。' },
  { id: 'SALT', name: 'SALT', cn: '盐', rating: 3.9, trades: 156, note: '卖数据，也卖你的数据。' },
  { id: 'ORACLE_9', name: 'ORACLE_9', cn: '神谕九号', rating: 4.8, trades: 611, note: '不议价，只预言。' },
  { id: '0xDEAD', name: '0xDEAD', cn: '死链', rating: 3.3, trades: 47, note: '新号，先款后货，自求多福。' },
  { id: 'TINMAN', name: 'TINMAN', cn: '铁皮人', rating: 4.4, trades: 350, note: '硬件改装，手工痕迹明显。' },
];

// base: 基准价（DKC） vol: 波动率 risk: 0-10
export const ITEMS = [
  // ── 数据 ─────────────────────────────────────────────
  { id: 'd1', name: '北岸医疗集团会员库', code: 'MED-7731', cat: 'data', base: 980, vol: .28, rarity: 'common', risk: 4, vendor: 'SALT', desc: '2024 年整库导出，含就诊记录与保单号。卖家说「干净」，没人验证过。' },
  { id: 'd2', name: '城市交通摄像头拓扑图', code: 'GRID-04', cat: 'data', base: 1450, vol: .22, rarity: 'rare', risk: 6, vendor: 'ORACLE_9', desc: '含离线节点与维护窗口。适合做路线规划，也适合被反向追踪。' },
  { id: 'd3', name: '交易所 API 私钥碎片', code: 'KEY-9F', cat: 'data', base: 3200, vol: .35, rarity: 'epic', risk: 8, vendor: '0xDEAD', desc: '三片中的第二片。没有另外两片，它只是一串漂亮的字符。' },
  { id: 'd4', name: '未公开利用链 GLASS-9', code: 'GLASS-9', cat: 'data', base: 5400, vol: .41, rarity: 'epic', risk: 9, vendor: 'VELVET', desc: '据称可穿过某企业网关。演示视频 11 秒，第 7 秒开始卡顿。' },
  { id: 'd5', name: '校园论坛全量备份', code: 'CAMPUS-2', cat: 'data', base: 260, vol: .18, rarity: 'common', risk: 2, vendor: '77', desc: '四万条私信，一半是告白，一半是骂人。买家通常是为了后者。' },
  { id: 'd6', name: '暗河用户画像包', code: 'PROF-0', cat: 'data', base: 2100, vol: .30, rarity: 'rare', risk: 7, vendor: 'MOTH', desc: '有人把这里的常客做成了标签。第一页就有你自己的代号。' },
  { id: 'd7', name: '港口集装箱舱单（晚间）', code: 'MANI-88', cat: 'data', base: 760, vol: .26, rarity: 'common', risk: 3, vendor: 'PALE_HORSE', desc: '物流线的副产物。改一个数字，整条链就换了主人。' },
  { id: 'd8', name: '离岸信托受益人名单', code: 'TRUST-X', cat: 'data', base: 4100, vol: .24, rarity: 'legend', risk: 9, vendor: 'ORACLE_9', desc: '十七个名字，四个你已经听过。卖家要求成交后删除对话。' },

  // ── 身份 ─────────────────────────────────────────────
  { id: 'i1', name: '三件套 · 欧盟版', code: 'ID-EU-1', cat: 'id', base: 1150, vol: .20, rarity: 'common', risk: 5, vendor: 'KIRA', desc: '证件、住址、税号。照片可以换，历史不能。' },
  { id: 'i2', name: '生物钥匙模板 B-3', code: 'BIOKEY-B3', cat: 'id', base: 2600, vol: .27, rarity: 'rare', risk: 7, vendor: 'DR_NULL', desc: '一枚指纹的三维拓印。卖家提醒：别用在需要活体检测的地方。' },
  { id: 'i3', name: '企业法人壳包（含年报）', code: 'SHELL-C3', cat: 'id', base: 4900, vol: .19, rarity: 'epic', risk: 6, vendor: 'TINMAN', desc: '一家成立八年、从未经营、按时报税的公司。完美的空房子。' },
  { id: 'i4', name: '出入境记录清洗件', code: 'BORDER-7', cat: 'id', base: 1850, vol: .23, rarity: 'rare', risk: 8, vendor: 'VELVET', desc: '把你从某个日期里擦掉。擦得太干净反而显眼。' },
  { id: 'i5', name: '保险理赔身份（已故）', code: 'CLAIM-0', cat: 'id', base: 720, vol: .31, rarity: 'common', risk: 9, vendor: '77', desc: '一个不再会说话的人。用他的人最好也别说话。' },
  { id: 'i6', name: '临时工牌 · 数据中心', code: 'BADGE-DC', cat: 'id', base: 3100, vol: .28, rarity: 'rare', risk: 8, vendor: 'SALT', desc: '有效期 72 小时。卖家不保证门禁系统没升级。' },

  // ── 黑硬件 ────────────────────────────────────────────
  { id: 'h1', name: '改装终端 TX-4', code: 'TX-4', cat: 'hw', base: 880, vol: .17, rarity: 'common', risk: 3, vendor: 'TINMAN', desc: '拆过、焊过、跑过。键盘上有咖啡渍，来自上一任主人。' },
  { id: 'h2', name: '信号中继盒（静默型）', code: 'RELAY-S', cat: 'hw', base: 2400, vol: .21, rarity: 'rare', risk: 6, vendor: 'TINMAN', desc: '把三跳电路伪装成邻居的路由器。指示灯被黑胶带贴住了。' },
  { id: 'h3', name: '冷钱包硬件（已改）', code: 'COLD-X', cat: 'hw', base: 1600, vol: .25, rarity: 'rare', risk: 5, vendor: '0xDEAD', desc: '原厂固件被替换。里面是空的，但「空」有很多种含义。' },
  { id: 'h4', name: '矿机主板 · 八卡', code: 'RIG-8', cat: 'hw', base: 5200, vol: .29, rarity: 'epic', risk: 4, vendor: 'KIRA', desc: '电费是它唯一诚实的部分。' },
  { id: 'h5', name: 'SIM 池 32 口', code: 'SIM-32', cat: 'hw', base: 1350, vol: .24, rarity: 'common', risk: 6, vendor: 'PALE_HORSE', desc: '三十二个号码，三十二种人生，都不属于你。' },
  { id: 'h6', name: '一次性基站（手提箱）', code: 'BTS-1', cat: 'hw', base: 8600, vol: .33, rarity: 'legend', risk: 10, vendor: 'VELVET', desc: '半径 300 米。开机会让整栋楼的手机同时「回家」。' },

  // ── 生物样本（科幻虚构）────────────────────────────────
  { id: 'b1', name: '静默剂 S-7（实验级）', code: 'S-7', cat: 'bio', base: 1750, vol: .34, rarity: 'rare', risk: 8, vendor: 'DR_NULL', desc: '让神经信号安静四小时。副作用栏是空的，这比有内容更可怕。' },
  { id: 'b2', name: '记忆碎片 M-12', code: 'M-12', cat: 'bio', base: 3900, vol: .38, rarity: 'epic', risk: 9, vendor: 'DR_NULL', desc: '一段 40 秒的陌生夏天。买家说他在里面听见了自己母亲的声音。' },
  { id: 'b3', name: '仿生皮肤贴片（三代）', code: 'DERM-3', cat: 'bio', base: 1250, vol: .26, rarity: 'common', risk: 5, vendor: 'KIRA', desc: '覆盖旧疤，也覆盖指纹。洗澡时记得别用力。' },
  { id: 'b4', name: '低温保存箱（含样本）', code: 'CRYO-4', cat: 'bio', base: 6400, vol: .30, rarity: 'legend', risk: 9, vendor: 'ORACLE_9', desc: '箱子上贴着「易碎」，没人知道里面碎的是什么。' },
  { id: 'b5', name: '合成酶批次 #44', code: 'ENZ-44', cat: 'bio', base: 2300, vol: .36, rarity: 'rare', risk: 7, vendor: 'SALT', desc: '工业级纯度。卖家强调「不是给人用的」，然后加了三个笑脸。' },

  // ── 服务 ─────────────────────────────────────────────
  { id: 's1', name: '数据清洗 · 十万条', code: 'WASH-10W', cat: 'svc', base: 620, vol: .15, rarity: 'common', risk: 3, vendor: 'SALT', desc: '去重、脱敏、补全。洗完的数据像新的一样，也像假的一样。' },
  { id: 's2', name: '伪造物流单（72h）', code: 'SHIP-FAKE', cat: 'svc', base: 480, vol: .16, rarity: 'common', risk: 4, vendor: 'PALE_HORSE', desc: '一条从不存在的航线，一份盖得很真的章。' },
  { id: 's3', name: '安全屋 · 72 小时', code: 'SAFE-72', cat: 'svc', base: 2200, vol: .18, rarity: 'rare', risk: 2, vendor: 'MOTH', desc: '没有窗，有网。房东不问名字，只收现金。' },
  { id: 's4', name: '渗透测试（虚构目标）', code: 'PENTEST', cat: 'svc', base: 3400, vol: .32, rarity: 'epic', risk: 8, vendor: 'ORACLE_9', desc: '目标由卖家指定。你只需要在报告上签字——用别人的名字。' },
  { id: 's5', name: '保释窗口 · 48 小时', code: 'BAIL-48', cat: 'svc', base: 7800, vol: .20, rarity: 'legend', risk: 3, vendor: 'VELVET', desc: '一个电话，一辆车，一扇后门。价格里包含沉默。' },
  { id: 's6', name: '舆情压制 · 单周', code: 'MUTE-W', cat: 'svc', base: 1500, vol: .27, rarity: 'rare', risk: 5, vendor: '77', desc: '让搜索结果的第二页变成第一页。' },

  // ── 公司壳 ────────────────────────────────────────────
  { id: 'c1', name: '空壳公司（BVI 模板）', code: 'BVI-01', cat: 'shell', base: 3800, vol: .14, rarity: 'rare', risk: 4, vendor: 'TINMAN', desc: '注册地在一个你无法在地图上找到的小岛。' },
  { id: 'c2', name: '离岸账户通道', code: 'OFF-2', cat: 'shell', base: 5600, vol: .18, rarity: 'epic', risk: 7, vendor: 'ORACLE_9', desc: '三层账户，两次跳转，一个签名。' },
  { id: 'c3', name: '加密支付网关牌照（虚构）', code: 'GATE-9', cat: 'shell', base: 9200, vol: .22, rarity: 'legend', risk: 8, vendor: 'VELVET', desc: '一张纸，让钱看起来像是从合法的地方来的。' },
  { id: 'c4', name: '域名清洗服务', code: 'DNS-W', cat: 'shell', base: 900, vol: .19, rarity: 'common', risk: 3, vendor: 'MOTH', desc: '把一条被标记的域名洗成新的。旧访客会自己找回来。' },
];

export const AUCTION_POOL = [
  { defId: 'd4', title: 'GLASS-9 完整演示包', desc: '卖家只拍卖一次。上一任买家在成交后第 3 天消失了，账号还在。', start: 4200, step: 200 },
  { defId: 'h6', title: '手提箱基站 · 未拆封', desc: '原包装，封条完整。附带一张手写纸条：「别在城市里开」。', start: 7100, step: 400 },
  { defId: 'd8', title: '离岸信托名单 · 十七人', desc: '名单上有四个人已经死了。卖家说这四个人是「最安全的」。', start: 3600, step: 250 },
  { defId: 'b4', title: 'CRYO-4 保存箱 · 编号缺失', desc: '温度记录有一条 6 分钟的空档。没人敢问那 6 分钟。', start: 5200, step: 300 },
  { defId: 'i3', title: '八年空壳 · 完美年报', desc: '一家从未经营却从不迟到的公司。审计师去年自杀了。', start: 3900, step: 200 },
  { defId: 's5', title: '保释窗口 · 一次性', desc: '卖家保证「人一定出来」。他不保证出来的是原来那个人。', start: 6300, step: 350 },
  { defId: 'd2', title: 'GRID-04 全量拓扑', desc: '含 14 个离线节点。其中一个在卖家住处楼下。', start: 1500, step: 100 },
  { defId: 'b2', title: '记忆碎片 M-12 · 母带', desc: '未经剪辑的 4 分 12 秒。拍卖页面的试听按钮是坏的。', start: 3100, step: 250 },
];

export const COMPANIES = [
  {
    id: 'rig', name: '矿场', en: 'RIG FARM', icon: '▦', base: 4000,
    desc: '一排改装矿机，嗡嗡作响。它每小时印钱，也每小时留下电费与热量的痕迹。',
    perLevel: { income: 260, heat: 0.4 }, effect: '每小时 +260 DKC · 热度 +0.4/h',
  },
  {
    id: 'forge', name: '伪造工坊', en: 'FORGE', icon: '⌬', base: 6500,
    desc: '三台压印机、一台老式相机，和一位从不出门的手艺人。',
    perLevel: { income: 0, heat: 0.6, goodsEvery: 4 }, effect: '每 4 小时产出一件「身份」货',
  },
  {
    id: 'logi', name: '物流线', en: 'LOGISTICS', icon: '⇄', base: 5200,
    desc: '两条航线、四个码头联系人。你的包裹会比别人的更安静。',
    perLevel: { income: 0, heat: 0, speed: 2, fee: .3 }, effect: '到货时间 -2h/级 · 运费 -30%',
  },
  {
    id: 'intel', name: '情报站', en: 'INTEL', icon: '◉', base: 7600,
    desc: '一间没有招牌的办公室，里面的人只看不买。他们卖的是「确定性」。',
    perLevel: { income: 120, heat: -.1 }, effect: '显示真实品质与假货率 · 热度 -0.1/h',
  },
  {
    id: 'laundry', name: '洗币所', en: 'LAUNDRY', icon: '≈', base: 8800,
    desc: '前台是自助洗衣店。机器转得比钱快。',
    perLevel: { income: 180, heat: -.2 }, effect: '混币费率 -10%/级 · 热度 -0.2/h',
  },
];

export const NPCS = {
  MOTH: { name: 'MOTH', cn: '飞蛾', color: '#9dff3c' },
  GHOST: { name: 'GHOST', cn: '幽灵', color: '#59d7ff' },
  KIRA: { name: 'KIRA', cn: '基拉', color: '#ffb64d' },
  BANKER: { name: 'THE_BANKER', cn: '银行家', color: '#c9a4ff' },
  LZ: { name: 'LZ', cn: '林栀', color: '#ff8fa3' },
  ASH: { name: 'ASH', cn: '灰账', color: '#ff5a4d' },
};

export const DIALOGS = {
  intro: [
    { from: 'MOTH', text: '你能看见这行字，说明你的入口节点还没被标记。很好。', delay: 1200 },
    { from: 'MOTH', text: '我是飞蛾。这里叫暗河，别问它为什么叫这个。', delay: 2600 },
    { from: 'MOTH', text: '你现在的身份是中间人。不生产，不拥有，只撮合。听懂了吗？', delay: 2800 },
    { from: 'MOTH', text: '规则只有三条：钱进托管再发货；验货之前别评价；热度比利润重要。', delay: 3200 },
    { from: 'MOTH', text: '先从一单小生意开始。市场里那些三位数的货，随便挑一件。', delay: 3000 },
  ],
  firstTrade: [
    { from: 'MOTH', text: '第一单做完了。你比我想的安静，这是好事。', delay: 1500 },
    { from: 'GHOST', text: '别高兴。你刚才那笔交易让三个节点记住了你的节奏。', delay: 3500 },
    { from: 'GHOST', text: '记住：托管不是安全，只是把风险推迟到验货那一刻。', delay: 3000 },
  ],
  firstAuction: [
    { from: 'BANKER', text: '拍卖行里我见过太多新人。他们都在最后三秒加价，然后输。', delay: 1600 },
    { from: 'BANKER', text: '如果你想赢我，别在最后三秒才决定。', delay: 3000 },
  ],
  firstCompany: [
    { from: 'KIRA', text: '你买公司了？不错。资产会替你赚钱，也会替你留下地址。', delay: 1600 },
    { from: 'KIRA', text: '我的工坊可以给你留一条产线。价格好说——对你这种新客户。', delay: 3200 },
  ],
  heatWarning: [
    { from: 'GHOST', text: '你的热度到 60 了。现在开始，每一次大额交易都像是在黑暗里点火。', delay: 1200 },
    { from: 'GHOST', text: '去洗币，或者换个身份。别等到他们先动手。', delay: 3000 },
  ],
  kingpin: [
    { from: 'BANKER', text: '你成了。', delay: 1200 },
    { from: 'BANKER', text: '现在你该知道，暗河没有主人，只有还没被端掉的人。', delay: 3000 },
    { from: 'MOTH', text: '别听他的。你已经是这里最安静的那一个了。', delay: 2600 },
  ],
};

export const CONTRACTS = [
  { id: 'k1', title: '第一单', giver: 'MOTH', desc: '完成 1 笔交易（买或卖都算）', reward: 400, rep: 4 },
  { id: 'k2', title: '别信卖家', giver: 'GHOST', desc: '验货 1 次', reward: 500, rep: 3 },
  { id: 'k3', title: '拍卖场的新人', giver: 'BANKER', desc: '赢下 1 场拍卖', reward: 1200, rep: 6 },
  { id: 'k4', title: '拥有', giver: 'KIRA', desc: '收购 1 家公司', reward: 900, rep: 5 },
  { id: 'k5', title: '临界', giver: 'GHOST', desc: '热度达到 60 并活过 12 小时', reward: 1800, rep: 8 },
  { id: 'k6', title: '十万', giver: 'MOTH', desc: '净资产达到 100,000 DKC', reward: 5000, rep: 12 },
];

export const EVENTS = [
  {
    id: 'sting', title: '假买家', weight: 10, minHeat: 0,
    text: '一个刚注册 4 小时的账号想买走你全部的库存，付款爽快得不像话，还主动多付了 200。',
    tag: '风险', choices: [
      { label: '接单，但只发一半', effect: { credits: 600, heat: 6, rep: 1 }, result: '对方收了货，没有评价。三天后你收到一条空白消息。' },
      { label: '拒绝，拉黑', effect: { heat: -4, rep: 2 }, result: '你关掉对话框。十分钟后，那个账号消失了。' },
      { label: '反查对方的钱包', effect: { heat: 10, rep: 4, credits: -100 }, result: '你顺着地址摸到一个执法部门的测试节点。你立刻断开了连接。' },
    ],
  },
  {
    id: 'crash', title: '汇率崩了', weight: 9, minHeat: 0,
    text: '暗币在四十分钟里跌了 31%。论坛上有人说这是庄家在洗盘，也有人说这是查封前的征兆。',
    tag: '市场', choices: [
      { label: '抄底买入', effect: { credits: -1500, heat: 3, flag: 'dip' }, result: '你在最低点接了 1,500 的货。价格在两小时后回了一半。' },
      { label: '清仓换现金', effect: { credits: 900, heat: -2 }, result: '你低价出了一批库存，换来一点喘息和一点后悔。' },
      { label: '什么都不做', effect: { heat: 1 }, result: '你盯着曲线看了一夜。曲线也盯着你。' },
    ],
  },
  {
    id: 'journalist', title: '记者', weight: 7, minHeat: 20,
    text: '一个自称独立记者的人发来长文，说他在写「暗河上的中间人」。附件里有你的交易时间线，精确到分钟。',
    tag: '曝光', choices: [
      { label: '付封口费', effect: { credits: -2000, heat: -8 }, result: '他收了钱，说文章会「换个角度」。你不太信，但热度确实降了。' },
      { label: '反过来调查他', effect: { heat: 8, rep: 3 }, result: '你查到他住在哪，然后把地址发了回去。他再也没出现过。' },
      { label: '无视', effect: { heat: 12 }, result: '三天后，一篇没有署名的长文出现在几个小论坛上。你的代号被提到了两次。' },
    ],
  },
  {
    id: 'vendor_gone', title: '供应商跑路', weight: 8, minHeat: 0,
    text: 'KIRA 的店铺页面变成了 404。你有两笔在途订单，托管里的钱还没放款。',
    tag: '供应链', choices: [
      { label: '申请托管仲裁', effect: { credits: 800, heat: 2 }, result: '平台退回了 70%。剩下的 30% 被标注为「处理费」。' },
      { label: '找飞蛾打听', effect: { credits: -300, rep: 3, flag: 'kiraGone' }, result: '飞蛾说基拉去了南边，货在别人手上。他给了你一个新联系人。' },
      { label: '当没发生', effect: { heat: 3 }, result: '你继续做生意。三天后，KIRA 的店铺又出现了，商品价格全部上调。' },
    ],
  },
  {
    id: 'raid', title: '扫荡', weight: 0, minHeat: 25,
    text: '凌晨 03:12，市场同时掉线了 40 秒。恢复后，公告栏只有一行字：「本周第七次清理」。',
    tag: '执法', choices: [
      { label: '销毁部分库存', effect: { heat: -18, credits: -600 }, result: '你烧掉了三分之一的家当。烟味在房间里留了很久。' },
      { label: '花大钱走关系', effect: { heat: -25, credits: -2500 }, result: '一个陌生号码发来「收到」。你的名字从某份名单上被划掉了。' },
      { label: '硬扛', effect: { heat: 6, riskRaid: true }, result: '你什么都没做。门外的脚步声停了两次，然后走远了。' },
    ],
  },
  {
    id: 'whale', title: '大买家', weight: 6, minHeat: 10,
    text: 'THE_BANKER 亲自发来消息：他要一批「安静」的货，数量是平时的十倍，价格随便开。',
    tag: '机会', choices: [
      { label: '接单', effect: { credits: 4500, heat: 14, rep: 5 }, result: '钱到得很快。你发现自己在数零的时候手在抖。' },
      { label: '只做一半', effect: { credits: 1800, heat: 6, rep: 2 }, result: '银行家没说什么，只是把你从「优先」名单挪到了「观察」名单。' },
      { label: '拒绝', effect: { rep: -2, heat: -3 }, result: '他回了一个句号。你盯着那个句号看了很久。' },
    ],
  },
  {
    id: 'power', title: '断电', weight: 5, minHeat: 0,
    text: '整个街区停电 90 秒。你的 UPS 只撑了 40 秒，两笔在途订单的时间戳出现了空档。',
    tag: '意外', choices: [
      { label: '手动补时间戳', effect: { credits: -400, heat: 4, rep: 2 }, result: '你补得天衣无缝。至少你自己是这么认为的。' },
      { label: '申请平台豁免', effect: { heat: 2, credits: -200 }, result: '平台批准了豁免，并在你的档案上记了一笔「异常」。' },
    ],
  },
  {
    id: 'snitch', title: '同行举报', weight: 6, minHeat: 30,
    text: '有人在论坛匿名发帖，说你的货源「来路不正」，附了三张交易截图。截图是真的。',
    tag: '声誉', choices: [
      { label: '公开回应', effect: { rep: 3, heat: 5 }, result: '你写了一段冷静的回应。有人信了，有人截图存了下来。' },
      { label: '查出是谁', effect: { heat: 7, credits: -500, rep: 4 }, result: '你找到了那个账号，然后把它买了下来。现在它属于你。' },
      { label: '沉默', effect: { rep: -4, heat: 2 }, result: '帖子沉了。但你知道它没有消失。' },
    ],
  },
  {
    id: 'archive', title: '旧档案', weight: 4, minHeat: 0,
    text: '你在整理本地缓存时发现一个不属于你的文件夹，里面是暗河早期的交易记录，最早可以追溯到九年前。',
    tag: '秘密', choices: [
      { label: '读完它', effect: { rep: 5, heat: 6, flag: 'archive' }, result: '你读到第 411 页时看到了自己的代号。记录时间是明天。' },
      { label: '删掉', effect: { heat: -5 }, result: '你删了三次，回收站里还在。你决定不再打开那个分区。' },
    ],
  },
  {
    id: 'collector', title: '灰账的人', weight: 20, minHeat: 0, minMissed: 1,
    text: '两个穿冲锋衣的男人在楼下便利店买了烟，没有上来。其中一个人抬头看了一眼你家窗户的方向。',
    tag: '债务', choices: [
      { label: '下楼，先给 2,000', effect: { credits: -2000, heat: -6, rep: 1, debtOverdue: -2000 }, result: '他们收了钱，说「这次算你有诚意」。走的时候把烟头按在楼道扶手上。' },
      { label: '装作不在家', effect: { heat: 12, rep: -3, debtPenalty: 1000 }, result: '凌晨三点，门缝里塞进来一张纸：欠款 +1,000，逾期计息。' },
      { label: '把终端藏进背包，从后门走', effect: { heat: 6, credits: -300 }, result: '你在网吧坐到天亮。硬盘没被拿走，但你知道他们记住了你的脸。' },
    ],
  },
];

export const BROADCASTS = [
  '成交 · {code} · {price} DKC · 托管已释放',
  '新卖家入驻 · 评分待观察',
  '拍卖结束 · {code} · {price} DKC',
  '节点延迟 +{ms}ms · 建议重连',
  '查封公告 · 3 个店铺已下线',
  '匿名用户刚刚查看了你的档案',
  '托管争议 · 仲裁中 · 涉及 {price} DKC',
  '新拍卖上架 · 仅剩 1 件',
  '论坛热帖 · 「如何分辨假货」· 214 回复',
  '钱包地址 {addr} 收到一笔转账',
  '系统提示 · 请勿在公共网络使用本市场',
  '卖家 KIRA 上调全线报价 12%',
];

export const TERMINAL_HELP = [
  '可用命令：',
  '  help                显示此帮助',
  '  market [类目]       列出市场商品（data/id/hw/bio/svc/shell）',
  '  buy <商品ID>        快速购买（按市场价）',
  '  inv                 查看库存',
  '  sell <序号> <价格>  挂单出售库存',
  '  wallet              钱包与流水',
  '  status              余额 / 热度 / 声望 / 在途 / 库存',
  '  orders              在途包裹与预计到货',
  '  netstat             虚构节点与延迟',
  '  mix <金额>          混币（降低热度）',
  '  crack               启动密码破解',
  '  scan                扫描节点与热度',
  '  whoami              你的档案',
  '  clear               清屏',
];

export const CRACK_WORDS = [
  'ORION', 'VESPER', 'NULLED', 'CIPHER', 'GHOST', 'MIRROR', 'SABLE', 'TEMPLE',
  'VECTOR', 'ASHEN', 'HOLLOW', 'SIGNAL', 'WRAITH', 'CINDER', 'STATIC', 'PALE',
  'MERCY', 'RUST', 'ONYX', 'LUMEN', 'DAGGER', 'SILENT', 'NOMAD', 'VANTA',
];

export const ACHIEVEMENTS = [
  { id: 'a1', name: '第一次见血', desc: '完成第一笔交易' },
  { id: 'a2', name: '验尸官', desc: '验货 5 次' },
  { id: 'a3', name: '拍卖之王', desc: '赢下 5 场拍卖' },
  { id: 'a4', name: '房东', desc: '拥有 3 家公司' },
  { id: 'a5', name: '临界点', desc: '热度达到 85 并存活' },
  { id: 'a6', name: '密码学家', desc: '破解终端 3 次' },
  { id: 'a7', name: '洗白', desc: '更换身份 1 次' },
  { id: 'a8', name: '六位数', desc: '净资产超过 100,000' },
  { id: 'a9', name: '静默', desc: '热度降到 5 以下' },
  { id: 'a10', name: '暗河之主', desc: '达成登顶结局' },
  { id: 'a11', name: '第一期', desc: '按时付清第一期月供' },
  { id: 'a12', name: '干净', desc: '结清灰账的全部欠款' },
];

export const STORY = {
  sister: { name: '林栀', age: 17, ill: '急性淋巴细胞白血病' },
  lender: { name: 'ASH', cn: '灰账' },
  drug: { name: '白舒', cost: 1200, period: '七天一盒' },
  debt: { principal: 48000, installment: 5200, periods: 12, firstDue: 129, period: 720, penalty: 0.15, maxMiss: 3 },
  med: { cost: 1200, firstDue: 57, period: 168, maxMiss: 3 },
  prologue: [
    '林栀，十七岁。急性淋巴细胞白血病。',
    '特价药白舒，一盒 1,200，七天一盒。断一次，之前的都白打。',
    '去年冬天，我在灰账借了 48,000。月供 5,200，十二期。',
    '今天，离第一期还有五天。',
    '我没有资源，没有学历，也没有能再借钱的人。',
    '只剩下一个入口。他们说，这里叫暗河。',
  ],
  chapters: {
    1: { n: 1, tag: 'CH.01 · 白舒', title: '三盒', lines: [
      '三盒是一个疗程。护士收走空盒时会抬眼看你一下——她在数你还能撑几盒。',
      '一盒 1,200。暗河的市场里，一件货的差价，刚好是一盒。',
    ] },
    2: { n: 2, tag: 'CH.02 · 第一期', title: '第 6 天 09:00', lines: [
      '灰账不看天气，也不看病房的探视时间。',
      '5,200。你只能把它拆成十几次买卖，一次一两百地凑。',
    ] },
    3: { n: 3, tag: 'CH.03 · 催收', title: '走廊', lines: [
      '第一次没扣到的那晚，手机在枕头边震了一下，又停了。',
      '他们没有骂人，只发来一张医院走廊的照片。拍摄时间显示：刚才。',
    ] },
    4: { n: 4, tag: 'CH.04 · 账清了', title: '好', lines: [
      '最后一笔转出去，灰账只回了一个「好」字。',
      '你在医院楼下的便利店坐到天亮。玻璃上，你的脸看起来不太像一个坏人。',
    ] },
  },
  beats: {
    warn48: '还有两天。5,200。别让我替你算利息。',
    payFirst: '第一期，收到。',
    payFirstSis: '哥，今天药打完了，我没吐。',
    miss1: '第 1 次没扣到。罚息 780，记上了。下次我不发消息，直接去医院。',
    miss2: '两次了。你妹妹住哪个病房，我知道。',
    cleared: '账清了。以后别来找我，也别再来这条街。',
    clearedSis: '哥，我们是不是可以回家了？',
    med3: '医生说指标降了一点。她还说，我头发会慢慢长回来。',
    medMiss1: '今天没打上。护士说明天可以补，但要重新排床位。',
    medMiss2: '是不是……太贵了？哥，我可以不治的。',
  },
};

export const ENDINGS = {
  arrest: { title: '被捕', tag: 'SESSION TERMINATED', grade: 'F', text: '门被敲响的时候，你正在核对一笔 4,000 的托管。你没有回头。判决书上的代号拼错了两个字母，但没人会为此上诉。' },
  kingpin: { title: '暗河之主', tag: 'ASCENSION', grade: 'S', text: '你成了暗河里最安静的那个人。所有人都知道你的名字，但没人敢在广播里提起。你终于明白：这不是王座，只是一张更贵的椅子。' },
  retire: { title: '金盆洗手', tag: 'EXIT', text: '你关掉终端，把硬盘放进微波炉。第二天早上，你在楼下买了豆浆，第一次觉得阳光有点刺眼。' },
  liquidated: { title: '清算', tag: 'DEBT COLLECTED', grade: 'F', text: '第三次违约之后，灰账没有来敲门。他们只是把医院的欠费单拍照发给你，然后停了你的入口。你在楼下坐到天亮，手机再没亮过。' },
  medstop: { title: '药停了', tag: 'TREATMENT STOPPED', grade: 'F', text: '第三盒药没续上。护士站的电话打来时，你正在拍一件货。你说「马上」，然后按了静音。三天后，林栀的病房空了半张床。' },
};

export const FLAVOR = [
  '本页所有内容均为本地生成。',
  '你看到的每一次成交，都是这台机器编出来的。',
  '没有服务器在监听你。至少这一局没有。',
  '暗河没有记忆，除了 localStorage。',
  '延迟是假的，紧张是真的。',
  '所有代号都属于虚构的人。',
];
