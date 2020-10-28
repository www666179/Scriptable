// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;
//------------------------------------------------
const env = importModule("ENV.js");
//------------------------------------------------
// 配置区
env.configs.previewSize = "Medium"; // 预览大小【小：Small，中：Medium，大：Large】
env.configs.changePicBg = true; // 是否需要更换背景
env.configs.colorMode = true; // 是否是纯色背景
env.configs.bgColor = new Color("#36033B"); // 小组件背景色
env.configs.topPadding = 0; // 内容区边距
env.configs.leftPadding = 0; // 内容区边距
env.configs.bottomPadding = 0; // 内容区边距
env.configs.rightPadding = 0; // 内容区边距
env.configs.refreshInterval = 180; // 刷新间隔，单位分钟，非精准，会有3-5分钟差距
//////////////////////////////////
// 大标题文字颜色
const headTitleFontColor = new Color("#e587ce", 0.8);
// 列表文字颜色
const listTitleFontColor = new Color("ffffff", 0.8);

const tableTitles = [
  { 1: "球队" },
  { 2: "赛" },
  { 3: "胜/平/负" },
  { 4: "进/失" },
  { 5: "积分" },
];
//////////////////////////////////
const imgStyle = env.imgStyle;
const textStyle = env.textStyle;
//------------------------------------------------
// 脚本名字
const name = Script.name();
// 文件
const fm = FileManager.local();
// 排版
const widget = new ListWidget();
const contentStack = widget.addStack();
contentStack.layoutVertically();
contentStack.addSpacer(3);
//------------------------------------------------

//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓内容区↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
let locale = undefined;
let competitionId = undefined;
let seasonId = undefined;
let leagueName = undefined;
const teamNmu = 7;

if (Device.locale() == "zh_CN") {
  locale = "zh";
} else {
  locale = "en";
}

// 获取外部输入的参数
var widgetInputRAW = args.widgetParameter;
const defaultLeague = "epl";
try {
  widgetInputRAW.toString();
} catch (e) {
  // 默认值英超
  widgetInputRAW = "epl";
}
// 初始化联赛ID
var inputStr = widgetInputRAW.toString();
if (inputStr.length == 0) {
  // 英超
  competitionId = "9";
  seasonId = "39301";
  leagueName = "英格兰足球超级联赛";
} else if (inputStr == "slp") {
  // 西甲
  competitionId = "10";
  seasonId = "39319";
  leagueName = "西班牙足球甲级联赛";
} else if (inputStr == "liga") {
  // 德甲
  competitionId = "1";
  seasonId = "39285";
  leagueName = "德国足球甲级联赛";
} else if (inputStr == "isa") {
  // 意甲
  competitionId = "13";
  seasonId = "39325";
  leagueName = "意大利足球甲级联赛";
} else if (inputStr == "flc") {
  // 法甲
  competitionId = "23";
  seasonId = "39245";
  leagueName = "法国足球甲级联赛";
} else {
  // 英超
  competitionId = "9";
  seasonId = "39301";
  leagueName = "英格兰足球甲级联赛";
}

// 获取联赛数据
const leagueJSON = await getLeague();
const leagueIcon = await getLeagueIcon();

let titleStack = contentStack.addStack();
titleStack.addSpacer(98);
// 添加联赛徽标
let leagueImg = leagueIcon;
imgStyle.stack = titleStack;
imgStyle.width = 18;
imgStyle.height = 18;
imgStyle.img = leagueImg;
env.addStyleImg();
titleStack.addSpacer(4);
// 联赛名称
textStyle.stack = titleStack;
textStyle.text = leagueName;
textStyle.lineLimit = 1;
textStyle.font = Font.boldSystemFont(15);
textStyle.textColor = headTitleFontColor;
env.addStyleText();
contentStack.addSpacer(2);

// 积分榜标题
let tableStack = env.alignLeftStack(contentStack, 50);
for (var i = 0; i < tableTitles.length; i++) {
  textStyle.stack = tableStack;
  textStyle.text = Object.values(tableTitles[i])[0];
  textStyle.font = Font.boldSystemFont(13);
  textStyle.textColor = headTitleFontColor;
  env.addStyleText();
  if (i == 0) {
    tableStack.addSpacer(43);
  } else if (i == 1) {
    tableStack.addSpacer(35);
  } else if (i == 2) {
    tableStack.addSpacer(23);
  } else if (i == 3) {
    tableStack.addSpacer(22);
  }
}

// 积分榜详情
let teamImg = undefined;
var j = 0;
for (var item of leagueJSON.groups[0].ranking) {
  let teamStack = env.alignLeftStack(contentStack);
  teamStack.addSpacer(10);
  if (j == teamNmu) {
    break;
  }
  const teamImgCachePath = fm.joinPath(
    fm.documentsDirectory(),
    "teamImage" + j + "-cache"
  );

  log(`${item.team.idInternal}`);
  const teamImgUrl = `https://images.onefootball.com/icons/teams/56/${item.team.idInternal}.png`;
  try {
    teamImg = await env.getImage(teamImgUrl);
    fm.writeImage(teamImgCachePath, teamImg);
    log(`队徽写入缓存`);
  } catch (e) {
    teamImg = fm.readImage(teamImgCachePath);
    log(`读取队徽缓存`);
  }

  const stats = item.team.teamstats;
  let teamName = `${item.team.name}`;
  imgStyle.stack = teamStack;
  imgStyle.width = 13;
  imgStyle.height = 13;
  imgStyle.img = teamImg;
  env.addStyleImg();
  if (teamName == "阿士東維拉足球會") {
    teamName = "阿斯顿维拉";
    createTextStack(teamStack, teamName, 80);
  } else {
    createTextStack(teamStack, `${item.team.name}`, 80);
  }
  createTextStack(teamStack, `${stats.played}`, 30);
  createTextStack(teamStack, `${stats.won}/${stats.drawn}/${stats.lost}`, 60);
  createTextStack(teamStack, `${stats.goalsShot}/${stats.goalsGot}`, 60);
  createTextStack(teamStack, `${stats.points}`, 30);
  j++;
}

async function getLeague() {
  // 缓存目录
  const leagueCachePath = fm.joinPath(fm.documentsDirectory(), "league-cache");

  var leagueUrl = `https://feedmonster.onefootball.com/feeds/il/${locale}/competitions/${competitionId}/${seasonId}/standings.json`;
  let leagueJsonData = undefined;
  try {
    leagueJsonData = await env.getJson(leagueUrl);
    log("联赛数据请求成功，进行缓存。");
  } catch (e) {
    const cache = fm.readString(leagueCachePath);
    log("读取联赛缓存数据。");
    leagueJsonData = JSON.parse(cache);
  }

  // 写入缓存
  fm.writeString(leagueCachePath, JSON.stringify(leagueJsonData));
  return leagueJsonData;
}

async function getLeagueIcon() {
  // 缓存目录
  const leagueIconCachePath = fm.joinPath(
    fm.documentsDirectory(),
    "league-icon-cache"
  );

  var leagueIconUrl = `https://images.onefootball.com/icons/leagueColoredCompetition/64/${competitionId}.png`;
  let leagueIconImage = undefined;
  try {
    leagueIconImage = await env.getImage(leagueIconUrl);
    // 写入缓存
    fm.writeImage(leagueIconCachePath, leagueIconImage);
    log("联赛徽标数据请求成功，进行缓存。");
  } catch (e) {
    log("读取联赛徽标缓存数据。");
    leagueIconImage = fm.readImage(leagueIconCachePath);
  }

  return leagueIconImage;
}

function createTextStack(stack, text, width) {
  //const tmpStack = stack.addStack();
  const tmpStack = env.alignLeftStack(stack);
  tmpStack.size = new Size(width, 18);
  const widgetText = tmpStack.addText(text);
  widgetText.font = Font.systemFont(13);
  //       homeText.textColor = new Color("#e587ce")
  widgetText.textColor = Color.white();
  widgetText.textOpacity = 0.6;
  return widgetText;
}
//------------------------------------------------
//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑内容区↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

//------------------------------------------------
// 运行脚本、预览
await env.run(name, widget);
//------------------------------------------------
