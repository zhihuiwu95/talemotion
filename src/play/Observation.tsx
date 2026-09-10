import { useState } from 'react'

import { readObservations, storageKey, type RecordEntry } from './observations'
export function ObservationForm({
  story,
  attempts,
  completed,
  mode,
}: {
  story: string
  attempts: number[]
  completed: number
  mode?: 'story'
}) {
  const [id] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
  const [saved, setSaved] = useState('')
  return (
    <form
      className="observation-form"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const entry: RecordEntry = {
          id,
          date: new Date().toISOString(),
          story,
          attempts: [...attempts],
          completed,
          understanding: String(data.get('understanding')),
          replay: String(data.get('replay')),
          reuse: String(data.get('reuse')),
          note: String(data.get('note')).slice(0, 300),
          ...(mode ? { mode } : {}),
        }
        try {
          const entries = readObservations().filter(
            (record) => record.id !== id,
          )
          localStorage.setItem(
            storageKey,
            JSON.stringify([...entries, entry].slice(-100)),
          )
          setSaved('已保存在这台设备，可在故事首页查看或导出。')
        } catch {
          setSaved('这台设备无法保存。请复制或自行记下观察结果。')
        }
      }}
    >
      <h3>陪玩后，记一小笔</h3>
      <p>记录这一次的真实表现，没有标准答案。不填写孩子姓名。</p>
      <label>
        孩子理解了玩法吗？
        <select name="understanding" required defaultValue="">
          <option value="" disabled>
            请选择
          </option>
          <option>听完后自己操作</option>
          <option>大人提示或示范后完成</option>
          <option>暂时没理解</option>
          <option>没观察到</option>
        </select>
      </label>
      <label>
        孩子想再玩吗？
        <select name="replay" required defaultValue="">
          <option value="" disabled>
            请选择
          </option>
          <option>主动要求再玩</option>
          <option>询问后愿意</option>
          <option>不想继续</option>
          <option>还没问</option>
        </select>
      </label>
      <label>
        你愿意下次继续陪玩吗？
        <select name="reuse" required defaultValue="">
          <option value="" disabled>
            请选择
          </option>
          <option>愿意，并想试生活里的活动</option>
          <option>愿意再试一次</option>
          <option>暂时不愿意</option>
          <option>还不确定</option>
        </select>
      </label>
      <label>
        发生了什么？（选填）
        <textarea
          name="note"
          maxLength={300}
          placeholder="例如：没听懂“下面”，演示一次就会了。"
        />
      </label>
      <small>
        仅点击保存时写入本机浏览器，不上传。最多保留 100
        条，可导出或清除。次数不是能力评分。
      </small>
      <button className="parent-button" type="submit">
        保存这次观察
      </button>
      {saved && <p role="status">{saved}</p>}
    </form>
  )
}
export function ObservationHistory() {
  const [records, setRecords] = useState(readObservations)
  const [notice, setNotice] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  return (
    <details
      className="observation-history"
      onToggle={(event) => {
        if (event.currentTarget.open) setRecords(readObservations())
      }}
    >
      <summary>
        家长的试玩记录 <span>{records.length} 条</span>
      </summary>
      <p>
        每次先选一个故事即可。先等孩子自己反应，再提示；结束后观察是否主动重玩。次日再玩一次，更容易看出真实兴趣。
      </p>
      <p>记录保存在当前设备、当前网址。换手机或换网址不会自动同步。</p>
      {records.length === 0 ? (
        <p>还没有保存记录。玩完后，在“家长陪玩”里填写。</p>
      ) : (
        <>
          <button
            className="parent-button"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(records, null, 2)], {
                  type: 'application/json',
                }),
              )
              const link = document.createElement('a')
              link.href = url
              link.download = 'talemotion-observations.json'
              link.click()
              window.setTimeout(() => URL.revokeObjectURL(url), 1000)
            }}
          >
            导出记录
          </button>
          <button
            className="replay-button"
            onClick={() => setConfirmClear(true)}
          >
            清除本机记录
          </button>
          {confirmClear && (
            <p>
              确定清除这些记录？
              <button
                className="parent-button"
                onClick={() => {
                  try {
                    localStorage.removeItem(storageKey)
                    setRecords([])
                    setConfirmClear(false)
                    setNotice('本机记录已清除。')
                  } catch {
                    setNotice('清除失败，请检查浏览器存储权限。')
                  }
                }}
              >
                确认清除
              </button>
              <button
                className="parent-button"
                onClick={() => setConfirmClear(false)}
              >
                保留记录
              </button>
            </p>
          )}
          <ul>
            {records
              .slice()
              .reverse()
              .map((record) => (
                <li key={record.id}>
                  <strong>{record.story}</strong> ·{' '}
                  {new Date(record.date).toLocaleDateString('zh-CN')}
                  <br />
                  {record.understanding} · {record.replay} · {record.reuse}
                  <br />
                  <small>
                    {record.mode === 'story'
                      ? `${record.completed ? '已到达结尾' : '中途记录'}；主动操作 ${record.attempts.reduce((sum, count) => sum + count, 0)} 次`
                      : `完成 ${record.completed} 轮；尝试 ${record.attempts.join(' / ')} 次`}
                  </small>
                  {record.note && <p>{record.note}</p>}
                </li>
              ))}
          </ul>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
    </details>
  )
}
