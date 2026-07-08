# Google Ads 第一波搜尋廣告建立包

更新日期：2026-07-08

這份文件用來建立第一波 Google 搜尋廣告。活動建立後請先維持「暫停」，確認追蹤碼與付款設定都正確後再手動啟用。

## 活動設定

| 欄位 | 設定 |
| --- | --- |
| 活動名稱 | `GOOG_Search_Keelung-Taipei-NewTaipei_Cleaning_2026Q3` |
| 活動類型 | Search / 搜尋廣告 |
| 活動狀態 | Paused / 暫停 |
| 每日預算 | NT$30 |
| 出價策略 | Maximize clicks / 盡量爭取點擊 |
| CPC 上限 | 若介面可設定，先抓 NT$8-12 |
| 地區 | 基隆市、台北市、新北市 |
| 語言 | 中文 |
| 網路 | 只投 Google 搜尋；關閉 Display / 多媒體 |
| 廣泛比對 | 關閉，不使用 Broad match |

## 到達頁與 UTM

| 廣告群組 | Final URL |
| --- | --- |
| 基隆清潔 | `https://0988145875.com.tw/keelung.html?utm_source=google&utm_medium=cpc&utm_campaign=search_cleaning_north&utm_content=keelung&utm_term={keyword}` |
| 台北清潔 | `https://0988145875.com.tw/taipei.html?utm_source=google&utm_medium=cpc&utm_campaign=search_cleaning_north&utm_content=taipei&utm_term={keyword}` |
| 新北清潔 | `https://0988145875.com.tw/new-taipei.html?utm_source=google&utm_medium=cpc&utm_campaign=search_cleaning_north&utm_content=new_taipei&utm_term={keyword}` |
| 費用試算 | `https://0988145875.com.tw/calculator.html?utm_source=google&utm_medium=cpc&utm_campaign=search_cleaning_north&utm_content=calculator&utm_term={keyword}` |

## 轉換動作

在 Google Ads 建立以下 Website conversion actions。建立完成後，複製每個動作的 `send_to`，回填到 `analytics.js`。

| 轉換動作名稱 | 類別 | Count | 建議價值 | 回填欄位 |
| --- | --- | --- | --- | --- |
| JMJ 電話點擊 | Contact / 聯絡 | One | NT$50 | `CONV_PHONE` |
| JMJ LINE 點擊 | Contact / 聯絡 | One | NT$80 | `CONV_LINE` |
| JMJ 預約表單送出 | Submit lead form / 潛在客戶表單 | One | NT$150 | `CONV_FORM` |
| JMJ 費用試算完成 | Lead / 潛在客戶 | One | NT$60 | `CONV_CALCULATOR` |

`ADS_ID` 格式為 `AW-xxxxxxxxxx`。各轉換欄位格式通常為 `AW-xxxxxxxxxx/label`。

## 建立後檢查

- 活動狀態仍為 Paused / 暫停。
- 每日預算為 NT$30。
- 地區只有基隆市、台北市、新北市。
- 已取消服務地區沒有出現在活動、關鍵字、文案、到達頁。
- 廣泛比對未啟用。
- Display network / 多媒體聯播網未啟用。
- 轉換動作建立後，至少先把 `ADS_ID` 回填到 `analytics.js`。

## 網站回填位置

```js
ADS_ID: 'AW-xxxxxxxxxx',
CONV_PHONE: 'AW-xxxxxxxxxx/phone_label',
CONV_LINE: 'AW-xxxxxxxxxx/line_label',
CONV_FORM: 'AW-xxxxxxxxxx/form_label',
CONV_CALCULATOR: 'AW-xxxxxxxxxx/calculator_label',
```
