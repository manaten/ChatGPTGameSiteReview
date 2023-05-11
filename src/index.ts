import axios from "axios";
import { ChatGPTAPI } from "chatgpt";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
import { z } from "zod";

dotenv.config();

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

type PageInfo = {
  title: string,
  description: string,
  body: string,
  image: string,
  url: string,
};

const PageSummary = z.object({
  genre: z.coerce.string(),
  tags: z.array(z.coerce.string()),
});

const CommentInfo = z.object({
  description: z.coerce.string(),
  comment: z.coerce.string(),
  rate: z.coerce.number(),
});

async function getPageInfo(url: string): Promise<PageInfo> {
  const page = (await axios.get(url)).data;
  const $ = cheerio.load(page);

  const data = {
    title: $("title").text(),
    description: $("meta[name='description']").attr("content") || "",
    body: $("p").text().replace(/[\t\n\r\s]/g, ""),
    image: $("meta[property='og:image']").attr("content") || "",
    url,
  } as const satisfies PageInfo;

  return data;
}

async function summarize(page: PageInfo): Promise<z.infer<typeof PageSummary>> {
  const res = await api.sendMessage(`
あなたは以下のゲーム記事を要約するマシーンです。
以下の記事の内容について、｢記事の扱うゲームのジャンル(RPG、シューティングなど)｣｢記事の扱いゲームのタイトルやシリーズなどのタグ情報｣を以下の形式のJSONで出力してください。JSON以外は出力しないでください。

{
  "genre": "ジャンル文字列",
  "tags": ["タグ情報列"]
}

====
${page.body}`);

  return PageSummary.parse(JSON.parse(res.text.match(/{[^}]+}/)?.[0] || "{}"));
}

async function generateComment(page: PageInfo, attr: string[]): Promise<z.infer<typeof CommentInfo> & { attr: string[] }> {
  try {
    const res = await api.sendMessage(`
    あなたは以下のゲーム記事のコメンテーターです。あなたの性格は${attr.map(a => `｢${a}｣`).join("")}です。必ず守ってください。
    以下の記事の内容について、｢ゲームの説明｣｢感情豊かな感想｣｢評価点(1から100の数値)｣を以下の形式のJSONで出力してください。JSON以外は出力しないでください。

    {
      "description": "ゲーム内容の説明",
      "comment": "記事の内容の感想文(50文字~80文字)",
      "rate": 123
    }

    ====
    ${page.body}`);
    const parsed = CommentInfo.parse(JSON.parse(res.text.match(/{[^}]+}/)?.[0] || "{}"));
    return {
      ...parsed,
      attr
    };
  } catch(_) {
    return {
      description: "",
      comment: "",
      rate: 0,
      attr,
    };
  }
}

async function evaluatePage(url: string) {
  const page = await getPageInfo(url);

  const [ summary, comments ] = await Promise.all([
    summarize(page),
    Promise.all([
      generateComment(page, ["女性", "ライトゲーマー", "可愛いものが好き", "かわいい言葉遣い", "ですます口調"]),
      generateComment(page, ["おじさん", "コアゲーマー", "FPSプレイヤー", "堅物", "辛口"]),
      generateComment(page, ["高校生", "コアゲーマー", "インディーゲー好き", "オタク", "表現豊か"]),
      generateComment(page, ["20台", "にわかゲーマー", "お調子者"]),
    ])
  ]);

  return {
    ...page,
    ...summary,
    comments: comments.filter(c => c.rate > 0),
  };
}

async function main() {
  const url = process.argv[2];
  const result = await evaluatePage(url);
  await writeFile(`out/${url.replace(/https?:\/\//, "").replace(/\//g, "_")}.json`, JSON.stringify(result, null, 2));
  console.log(result);
}

main().catch(e => console.error(e));
