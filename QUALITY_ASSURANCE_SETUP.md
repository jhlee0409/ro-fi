# GitHub Actions Quality Assurance Setup Guide

## 🔧 Required Setup Steps

### 1. Configure API Key Secret

**Step 1**: Go to your GitHub repository
**Step 2**: Navigate to Settings > Secrets and variables > Actions
**Step 3**: Click "New repository secret"
**Step 4**: Add the following secret:

```
Name: ANTHROPIC_API_KEY
Value: sk-ant-api03-[your-actual-api-key]
```

### 2. Verify Workflow Permissions

Ensure your repository has the following permissions:
- Actions: Read and write permissions
- Contents: Write permissions  
- Pull requests: Write permissions
- Issues: Write permissions

Navigate to: Settings > Actions > General > Workflow permissions

### 3. Test the Workflow

You can test the workflow in three ways:

#### A. Manual Trigger
1. Go to Actions tab in your repository
2. Select "Quality Assurance Check"
3. Click "Run workflow"
4. Choose the main branch and click "Run workflow"

#### B. Push Content Changes
1. Make changes to any `.md` files in:
   - `src/content/chapters/`
   - `src/content/novels/`
2. Commit and push to main branch
3. Workflow will trigger automatically

#### C. Pull Request
1. Create a branch with content changes
2. Open a pull request to main branch
3. Workflow will run on the PR

## 🚨 Common Issues & Solutions

### Issue 1: "ANTHROPIC_API_KEY secret not found"
**Solution**: Follow Step 1 above to configure the API key secret

### Issue 2: "Action 'anthropics/claude-code-action@v1' not found"
**Fallback**: The workflow includes a fallback quality check that will run basic validation if the Claude Code action fails

### Issue 3: "No content files found"
**Solution**: Ensure you have `.md` files in the correct directories:
- Novels: `src/content/novels/*.md` 
- Chapters: `src/content/chapters/*.md`

### Issue 4: Korean text encoding issues
**Solution**: Ensure your files are saved with UTF-8 encoding

## 📊 Quality Criteria

The system evaluates content on 6 criteria (0-10 points each):

1. **마크다운 포맷 준수** (8.0+ required)
   - Dialogue: `> "content"`
   - Monologue: `> _'content'_`
   - Actions: `> [description]`
   - Bold formatting for keywords

2. **로맨스 몰입도** (Romance immersion)
3. **판타지 세계관 일관성** (Fantasy consistency)  
4. **캐릭터 매력도** (Character appeal)
5. **문장 가독성** (Readability)
6. **다음화 기대감** (Anticipation for next chapter)

**Pass threshold**: 7.5/10 average score

## 🔄 Workflow Behavior

### On Success (≥7.5 points):
- ✅ Adds approval comment
- Allows content to be published

### On Failure (<7.5 points):
- ❌ Creates issue with improvement suggestions
- Blocks publication until fixed

### On Partial Score (7.0-7.4 points):
- 🔄 Attempts automatic improvements
- Updates files with corrections

## 📝 Example Workflow Run

```bash
✅ API 키 확인됨
✅ 컨텐츠 폴더 확인됨 - 소설: 1편, 챕터: 1화
🤖 Claude Code AI 품질 검증 시작...
📊 평가 결과:
  - 마크다운 포맷: 8.5/10
  - 로맨스 몰입도: 7.8/10  
  - 판타지 일관성: 8.2/10
  - 캐릭터 매력도: 7.6/10
  - 문장 가독성: 8.0/10
  - 다음화 기대감: 7.9/10
  평균: 8.0/10 ✅ 합격
📊 품질 검증 완료
```

## 🛠️ Troubleshooting Commands

If you need to debug the workflow:

```bash
# Check content files locally
find src/content -name "*.md" -type f

# Validate markdown format
head -10 src/content/chapters/*.md

# Check file sizes
wc -m src/content/chapters/*.md
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Claude Code Action Documentation](https://github.com/anthropics/claude-code-action)
- [NOVEL_MARKDOWN_FORMAT.md](./NOVEL_MARKDOWN_FORMAT.md) - Formatting guidelines