# GoDaddy DNS 設定指南（0988145875.com.tw）

## 步驟一：移除 GoDaddy 轉址

1. 登入 GoDaddy → 我的產品 → 找到 0988145875.com.tw
2. 點「DNS」管理
3. 找到目前的「轉址」設定，刪除它

## 步驟二：設定 A Record

新增 4 筆 A Record，指向 GitHub Pages：

| 類型 | 名稱 | 值 | TTL |
|------|------|-----|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

## 步驟三：設定 CNAME

| 類型 | 名稱 | 值 | TTL |
|------|------|-----|-----|
| CNAME | www | campcool.github.io | 600 |

## 步驟四：GitHub Pages 設定

1. 到 GitHub repo（campcool/0988145875）→ Settings → Pages
2. Custom domain 填入：`0988145875.com.tw`
3. 勾選「Enforce HTTPS」
4. 等待 DNS 生效（通常 10 分鐘 ~ 24 小時）

## 步驟五：驗證

DNS 生效後，打開以下網址確認：
- https://0988145875.com.tw → 應該正常顯示網站
- http://0988145875.com.tw → 應該自動跳轉到 https

## 注意事項

- DNS 生效需要時間，最快 10 分鐘，最慢 48 小時
- 設定完成後，CNAME 檔案已經放在 repo 裡了，不用再手動建立
- 如果 GitHub Pages 顯示「DNS check in progress」，等一下就好
