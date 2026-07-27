# 開発ルール

## 開発フロー

必ずこの順番で進める。`main` に直接コミットしない。

```
Issue作成 → ブランチ作成 → 実装 → PR作成 → CI通過 → Codexレビュー → マージ
```

1. **Issue を立てる**（テンプレートを使う。受け入れ条件を必ず書く）
2. **`main` から派生してブランチを作る**
3. 実装する
4. **PR を作る**（`Closes #<Issue番号>` を書く）
5. **CI が通るのを待つ**（赤いままレビューに出さない）
6. **Codex レビュー**を実施して指摘に対応する
7. **Squash and merge** でマージする

## ブランチ命名規則

```
<種別>/<Issue番号>-<内容の短い英語>
```

| 種別 | 用途 | 例 |
| --- | --- | --- |
| `feat` | 機能追加 | `feat/12-alarm-notification` |
| `fix` | バグ修正 | `fix/15-timer-drift-on-background` |
| `refactor` | 挙動を変えない内部改善 | `refactor/18-extract-alarm-logic` |
| `chore` | 設定・依存更新・雑務 | `chore/20-add-ci-workflow` |
| `docs` | ドキュメント | `docs/22-update-readme` |
| `test` | テスト追加 | `test/24-alarm-unit-test` |

## コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従う。

```
<種別>: <日本語で内容>

例）
feat: 予定時間経過時にアラームを鳴らす機能を追加
fix: バックグラウンド復帰時にタイマーがズレる問題を修正
refactor: 締切計算ロジックを src/lib/alarm.ts に切り出し
chore: GitHub Actions の CI ワークフローを追加
docs: 環境変数の設定手順を README に追記
test: calcDeadline の休憩あり/なしパターンのテストを追加
```

## マージ戦略

**Squash and merge** を使う。理由は、1つのPRが `main` 上で1コミットになり、履歴が Issue 単位で読めるようになるため。

GitHub の設定（Settings → General → Pull Requests）で以下を推奨：

- [x] Allow squash merging
- [ ] Allow merge commits（オフ）
- [ ] Allow rebase merging（オフ）
- [x] Automatically delete head branches（マージ済みブランチを自動削除）

## ブランチ保護

`main` を保護する。Settings → Branches → Add branch ruleset で以下を設定：

- Require a pull request before merging
- Require status checks to pass before merging
  - `Lint / Typecheck / Test / Build`
  - `Drizzle schema / migration drift`
- Block force pushes

> ⚠️ ステータスチェックは **一度 CI が実行されるまで選択肢に出てきません**。最初に CI を含む PR を1本作ってから設定してください。

## ローカル開発

```bash
npm install
cp .env.example .env.local   # 値を埋める
npm run db:push              # スキーマをDBに反映（開発時）
npm run db:seed              # 初期データ投入
npm run dev
```

## npm scripts

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |
| `npm run db:generate` | schema.ts からマイグレーションSQLを生成 |
| `npm run db:migrate` | マイグレーションを適用 |
| `npm run db:push` | スキーマを直接DBに反映（**開発専用**） |
| `npm run db:studio` | Drizzle Studio でDBを閲覧 |
| `npm run db:seed` | 初期データ投入 |

## DBスキーマ変更の手順

`db:push` と `db:generate` を混ぜると履歴が壊れる。**このプロジェクトでは `db:generate` を正とする。**

1. `src/lib/db/schema.ts` を編集する
2. `npm run db:generate` を実行する
3. **生成された `drizzle/XXXX_*.sql` を必ず目で読む**（意図しない `DROP COLUMN` が入っていないか）
4. `npm run db:migrate` で適用する
5. 生成された SQL と `drizzle/meta/` を**コミットに含める**

> ⚠️ 手順5を忘れると CI の `Drizzle schema / migration drift` ジョブが落ちます。これは意図的な検知です。

## 環境変数

| 変数名 | 用途 | 必須 |
| --- | --- | --- |
| `POSTGRES_URL` | Neon の接続文字列 | ✅ |
| `AUTH_SECRET` | Auth.js のセッション署名用（`npx auth secret` で生成） | ✅ |
| `NEXTAUTH_URL` | 本番URL（Vercelでは自動設定される場合あり） | ✅ |
| `AUTH_GOOGLE_ID` | Googleログイン用クライアントID（Google Cloud Console） | ✅ |
| `AUTH_GOOGLE_SECRET` | Googleログイン用クライアントシークレット | ✅ |
| `VAPID_PUBLIC_KEY` | Web Push 公開鍵（`npx web-push generate-vapid-keys`） | Push実装後 |
| `VAPID_PRIVATE_KEY` | Web Push 秘密鍵 | Push実装後 |
| `CRON_SECRET` | cron エンドポイントの認証用 | Push実装後 |

`.env.local` は**絶対にコミットしない**（`.gitignore` 済み）。
