# FocusEnglish Dictionary Core · 数据来源与许可

本目录的 `dictionary-core.js` 是为 FocusEnglish 离线查询构建的基础词典包；它不是用户学习数据。用户的收藏、Encounter、掌握状态、训练记录仍只保存在浏览器本地存储中。

## 数据来源

- **ECDICT**：用于大范围的英汉释义、词形变化与发音字段。许可证：MIT License。来源：<https://github.com/skywind3000/ECDICT>
- **Kaikki / Simple English Wiktionary**：用于优先展示的简明英文释义、例句与部分词族信息。数据来自 Simple English Wiktionary，遵循 **CC BY-SA / GFDL**。
- **Kaikki / Chinese Wiktionary**：用于补充中文释义、IPA 与词形信息。数据来自中文 Wiktionary，遵循 **CC BY-SA / GFDL**。
- **Kaikki / English Wiktionary**：构建器预留用于后续 IPA、词形和词族补充。数据来自 English Wiktionary，遵循 **CC BY-SA / GFDL**。

Kaikki 的数据页与当前抽取版本信息：<https://kaikki.org/dictionary/rawdata.html>

ECDICT 的 MIT 许可证副本位于 `dictionary/licenses/ECDICT-MIT-LICENSE.txt`。Wiktionary/Kaikki 数据的 CC BY-SA 许可说明见 <https://creativecommons.org/licenses/by-sa/4.0/>，GFDL 文本见 <https://www.gnu.org/licenses/fdl-1.3.html>。

## 使用与分发注意事项

1. 分发包含 Wiktionary/Kaikki 派生数据的版本时，必须保留本文件、来源链接和 CC BY-SA / GFDL 许可说明。
2. 分发 ECDICT 派生数据时，必须保留 ECDICT 的 MIT 许可证与署名信息。
3. 当前版本不下载或捆绑全量音频文件；词条显示的音标来自基础数据。后续如添加音频，需要为音频来源单独记录许可。
4. 词典释义为开放数据的清洗与组合结果，不应被表述为人工编辑的权威考试释义。
