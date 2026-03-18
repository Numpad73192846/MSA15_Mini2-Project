import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import MessageThreadModal from '../common/MessageThreadModal'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import '../../styles/tutor-dashboard.css'

const EMPTY_LIST = []

const parseDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value, options) => {
  const date = parseDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat('ko-KR', options).format(date)
}

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return `${amount.toLocaleString('ko-KR')}원`
}

const formatDurationText = (startAt, endAt) => {
  const start = parseDate(startAt)
  const end = parseDate(endAt)
  if (!start || !end) return '-'

  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
  if (minutes === 0) return '-'
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`
  return `${minutes}m`
}

const toTimeValue = (value) => {
  const date = parseDate(value)
  return date ? date.getTime() : 0
}

const getInitial = (value) => String(value || '학').trim().charAt(0) || '학'

const normalizeStudent = (student) => ({
  ...student,
  id: student?.id ?? student?.studentId ?? student?.name ?? '',
  name: student?.name || '학생',
  email: student?.email || '',
  phone: student?.phone || '',
  subjects: Array.isArray(student?.subjects) ? student.subjects.filter(Boolean) : EMPTY_LIST,
  totalSessions: Number(student?.totalSessions || 0),
  progress: student?.progress || '',
  notes: student?.notes || '',
})

const getBookingPrice = (booking) => booking?.price ?? booking?.totalPrice ?? 0

const getBookingActionState = (booking) => {
  const status = String(booking?.status || '').toUpperCase()
  const isPaid = Boolean(booking?.paidAt)
  const endAt = parseDate(booking?.endAt)
  const isPast = endAt ? endAt.getTime() <= Date.now() : false

  if (status === 'PENDING') return 'PENDING'
  if (status === 'CANCELLED') return 'CANCELLED'
  if (status === 'COMPLETED') return 'COMPLETED'
  if (status === 'CONFIRMED' && isPaid && isPast) return 'COMPLETE_AVAILABLE'
  if (status === 'CONFIRMED' && isPaid) return 'PAID'
  if (status === 'CONFIRMED') return 'WAITING_PAYMENT'
  return 'UNKNOWN'
}

const getStatusBadge = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return { label: '대기', className: 'bg-amber-100 text-amber-700' }
    case 'CONFIRMED':
      return { label: '확정', className: 'bg-emerald-100 text-emerald-700' }
    case 'COMPLETED':
      return { label: '완료', className: 'bg-slate-200 text-slate-700' }
    case 'CANCELLED':
      return { label: '취소', className: 'bg-rose-100 text-rose-700' }
    default:
      return { label: status || '확인 중', className: 'bg-slate-100 text-slate-600' }
  }
}

const getActionModalMeta = (action) => {
  switch (action) {
    case 'accept':
      return {
        title: '예약 수락',
        highlightClassName: 'border-sky-200 bg-sky-50 text-sky-900',
        icon: '✔️',
        heading: '예약을 수락하시겠습니까?',
        description: '학생에게 수락 알림이 전송됩니다.',
        confirmLabel: '수락하기',
        confirmClassName: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white',
      }
    case 'reject':
      return {
        title: '예약 거절',
        highlightClassName: 'border-amber-200 bg-amber-50 text-amber-900',
        icon: '❌',
        heading: '예약을 거절하시겠습니까?',
        description: '거절 사유를 입력해주세요.',
        confirmLabel: '거절하기',
        confirmClassName: 'bg-rose-500 hover:bg-rose-600 text-white',
      }
    case 'complete':
      return {
        title: '수업 완료',
        highlightClassName: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        icon: '🏁',
        heading: '수업 완료 처리하시겠습니까?',
        description: '완료 시 학생의 진도에 반영됩니다.',
        confirmLabel: '완료 처리',
        confirmClassName: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white',
      }
    default:
      return null
  }
}

const BookingCard = ({ booking, actionLoadingId, onAction, onMessage }) => {
  const actionState = getBookingActionState(booking)
  const statusMeta = getStatusBadge(booking?.status)
  const isBusy = actionLoadingId === booking?.bookingId || actionLoadingId === '__all__'

  return (
    <div className='dashboard-booking-card dashboard-card-surface h-full rounded-md border border-[#dee2e6] bg-[#f8f9fa] p-4'>
      <div className='mb-2 flex items-start justify-between gap-2'>
        <div>
          <div className='font-bold text-slate-900'>{booking?.studentName || '학생'}</div>
          <div className='text-sm text-slate-500'>{booking?.subject || '수업'}</div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta.className}`}>{statusMeta.label}</span>
      </div>

      <div className='mb-3 text-sm text-slate-600'>
        <div>날짜 {formatDate(booking?.startAt, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
        <div>
          시간 {formatDate(booking?.startAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
          {' '}
          ({formatDurationText(booking?.startAt, booking?.endAt)})
        </div>
      </div>

      <div className='mb-3 text-base font-bold text-[#4f46e5]'>{formatCurrency(getBookingPrice(booking))}</div>

      <div className='grid gap-2'>
        {(actionState === 'PAID' || actionState === 'COMPLETE_AVAILABLE') && (
          <button
            type='button'
            onClick={() => onMessage(booking)}
            className='inline-flex h-[31px] items-center justify-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'
          >
            메시지
          </button>
        )}

        {actionState === 'PENDING' && (
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => onAction(booking, 'accept')}
              disabled={isBusy}
              className='flex-1 rounded-md border border-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60'
            >
              수락
            </button>
            <button
              type='button'
              onClick={() => onAction(booking, 'reject')}
              disabled={isBusy}
              className='flex-1 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60'
            >
              거절
            </button>
          </div>
        )}

        {actionState === 'COMPLETE_AVAILABLE' && (
          <button
            type='button'
            onClick={() => onAction(booking, 'complete')}
            disabled={isBusy}
            className='rounded-md bg-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
          >
            수업 완료
          </button>
        )}

        {actionState === 'WAITING_PAYMENT' && (
          <button type='button' disabled className='rounded-md bg-slate-400 px-3 py-1.5 text-xs font-semibold text-white opacity-80'>결제 대기</button>
        )}

        {actionState === 'PAID' && (
          <button type='button' disabled className='rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white opacity-90'>결제 완료</button>
        )}

        {actionState === 'COMPLETED' && (
          <button type='button' disabled className='rounded-md bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white opacity-85'>수업 완료</button>
        )}

        {actionState === 'CANCELLED' && (
          <button type='button' disabled className='rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white opacity-85'>예약 취소됨</button>
        )}
      </div>
    </div>
  )
}
const BookingActionModal = ({ action, booking, loading, onClose, onConfirm }) => {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setReason('')
    setNotes('')
  }, [action, booking])

  if (!action || !booking) return null

  const meta = getActionModalMeta(action)
  if (!meta) return null

  const handleConfirm = () => {
    if (action === 'reject' && !reason.trim()) return
    onConfirm({ reason: reason.trim(), notes: notes.trim() })
  }

  return (
    <div className='tutor-dashboard-modal fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-3 py-6'>
      <div className='dashboard-dialog dashboard-action-dialog w-full max-w-[520px] bg-white'>
        <div className='flex items-center justify-between px-6 pb-0 pt-5'>
          <h3 className='text-lg font-bold text-slate-900'>{meta.title}</h3>
          <button type='button' onClick={onClose} className='rounded-md px-2 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700'>닫기</button>
        </div>

        <div className='px-6 py-5'>
          <div className={['mb-3 rounded-xl border px-4 py-3', meta.highlightClassName].join(' ')}>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>{meta.icon}</span>
              <div>
                <div className='font-semibold'>{meta.heading}</div>
                <div className='mt-1 text-sm opacity-80'>{meta.description}</div>
              </div>
            </div>
          </div>

          <div className='dashboard-summary-box rounded-xl bg-[#f8f9fa] p-4 text-sm text-slate-700'>
            <div className='mb-2'><strong>학생:</strong> {booking?.studentName || '학생'}</div>
            <div className='mb-2'>
              <strong>일시:</strong>
              {' '}
              {formatDate(booking?.startAt, { year: 'numeric', month: '2-digit', day: '2-digit' })}
              {' '}
              {formatDate(booking?.startAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
              {' '}
              ({formatDurationText(booking?.startAt, booking?.endAt)})
            </div>
            <div className='mb-2'><strong>과목:</strong> {booking?.subject || '수업'}</div>
            {action !== 'reject' && <div><strong>금액:</strong> {formatCurrency(getBookingPrice(booking))}</div>}
          </div>

          {action === 'reject' && (
            <div className='mt-3'>
              <label className='mb-2 block text-sm font-semibold text-slate-700'>거절 사유 <span className='text-rose-500'>*</span></label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className='w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5]'
                placeholder='학생에게 전달할 거절 사유를 입력해주세요.'
              />
              {!reason.trim() && <div className='mt-2 text-xs text-rose-500'>거절 사유를 입력해주세요.</div>}
            </div>
          )}

          {action === 'complete' && (
            <div className='mt-3'>
              <label className='mb-2 block text-sm font-semibold text-slate-700'>수업 메모 (선택)</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className='w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5]'
                placeholder='수업 내용이나 학생에게 전달할 메시지를 입력하세요.'
              />
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 px-6 pb-5 pt-0'>
          <button type='button' onClick={onClose} className='inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>취소</button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={loading || (action === 'reject' && !reason.trim())}
            className={['inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60', meta.confirmClassName].join(' ')}
          >
            {loading ? '처리중...' : meta.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const StudentDetailModal = ({ isOpen, student, tutorName, onClose, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [progress, setProgress] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!isOpen || !student) return
    setIsEditing(false)
    setProgress(student.progress || '')
    setNotes(student.notes || '')
    setSaving(false)
    setAiLoading('')
    setError('')
    setNotice('')
  }, [isOpen, student])

  if (!isOpen || !student) return null

  const subjects = Array.isArray(student.subjects) ? student.subjects : EMPTY_LIST

  const buildLessonContext = () => {
    return [
      progress.trim() ? `진도: ${progress.trim()}` : '',
      notes.trim() ? `메모: ${notes.trim()}` : '',
    ].filter(Boolean).join('\n').trim()
  }

  const handleAiGenerate = async (type) => {
    const lessonContext = buildLessonContext()
    if (!lessonContext) {
      setError('수업 요약 또는 과제를 생성하려면 진도나 메모를 먼저 입력해 주세요.')
      return
    }

    setError('')
    setNotice('')
    setIsEditing(true)
    setAiLoading(type)

    try {
      const endpoint = type === 'homework' ? '/ai/homework' : '/ai/lesson-summary'
      const response = await api.post(endpoint, {
        tutorName: tutorName || '튜터',
        studentName: student.name || '학생',
        subject: subjects[0] || '맞춤 수업',
        lessonContext,
      })

      const generatedText = String(response.data?.data?.text || '').trim()
      if (!generatedText) {
        setError('생성된 내용이 없습니다.')
        return
      }

      if (type === 'homework') {
        setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${generatedText}` : generatedText))
        setNotice('AI 과제를 메모에 반영했습니다.')
      } else {
        setProgress(generatedText)
        setNotice('AI 수업 요약을 진도 현황에 반영했습니다.')
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'AI 생성에 실패했습니다.')
    } finally {
      setAiLoading('')
    }
  }

  const handleSave = async () => {
    if (!student.id) {
      setError('학생 정보를 찾을 수 없습니다.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.put('/tutor/students/note', {
        studentId: student.id,
        progress: progress.trim(),
        notes: notes.trim(),
      })

      const updatedStudent = {
        ...student,
        progress: progress.trim(),
        notes: notes.trim(),
      }

      onSaved(updatedStudent)
      setNotice('학생 정보가 저장되었습니다.')
      setIsEditing(false)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || '학생 정보 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setProgress(student.progress || '')
    setNotes(student.notes || '')
    setIsEditing(false)
    setError('')
    setNotice('')
  }

  return (
    <div className='tutor-dashboard-modal fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-3 py-6'>
      <div className='dashboard-dialog dashboard-student-dialog w-full max-w-[520px] bg-white'>
        <div className='flex items-center justify-between px-6 pb-0 pt-5'>
          <h3 className='text-lg font-bold text-slate-900'>학생 상세 정보</h3>
          <div className='flex items-center gap-2'>
            {!isEditing && (
              <button type='button' onClick={() => setIsEditing(true)} className='inline-flex h-8 items-center rounded-lg border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>수정</button>
            )}
            <button type='button' onClick={onClose} className='rounded-md px-2 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700'>닫기</button>
          </div>
        </div>

        <div className='dashboard-student-body px-6 py-5'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-[50px] w-[50px] items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-[#4f46e5]'>{getInitial(student.name)}</div>
            <div>
              <h4 className='text-lg font-bold text-slate-900'>{student.name || '학생'}</h4>
              <div className='text-sm text-slate-500'>{student.email || '-'}</div>
            </div>
          </div>

          <div className='mb-4 grid gap-3 sm:grid-cols-2'>
            <div className='dashboard-student-stat rounded-xl bg-[#f8f9fa] p-4 text-center'>
              <div className='mb-1 text-xs text-slate-500'>총 수업</div>
              <div className='font-bold text-slate-900'>{student.totalSessions || 0}회</div>
            </div>
            <div className='rounded-xl bg-[#f8f9fa] p-4 text-center'>
              <div className='mb-1 text-xs text-slate-500'>연락처</div>
              <div className='font-bold text-sm text-slate-900'>{student.phone || '-'}</div>
            </div>
          </div>
          <div className='mb-4'>
            <div className='mb-2 flex items-center justify-between gap-2'>
              <h5 className='text-sm font-bold text-slate-500'>진도 현황</h5>
              <button
                type='button'
                onClick={() => handleAiGenerate('summary')}
                disabled={aiLoading === 'summary'}
                className='inline-flex h-8 items-center rounded-lg border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {aiLoading === 'summary' ? '생성중...' : 'AI 수업 요약'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={progress}
                onChange={(event) => setProgress(event.target.value)}
                rows={4}
                className='w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#4f46e5]'
                placeholder='진도 현황을 입력하세요.'
              />
            ) : (
              <div className='dashboard-detail-box whitespace-pre-wrap rounded-xl bg-[#f8f9fa] p-4 text-sm leading-6 text-slate-700'>
                {student.progress || '진도 현황 내용이 없습니다.'}
              </div>
            )}
          </div>

          <div className='mb-3'>
            <div className='mb-2 flex items-center justify-between gap-2'>
              <h5 className='text-sm font-bold text-slate-500'>특이사항 메모</h5>
              <button
                type='button'
                onClick={() => handleAiGenerate('homework')}
                disabled={aiLoading === 'homework'}
                className='inline-flex h-8 items-center rounded-lg border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {aiLoading === 'homework' ? '생성중...' : 'AI 과제 작성'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className='w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#4f46e5]'
                placeholder='특이사항 메모를 입력하세요.'
              />
            ) : (
              <div className='whitespace-pre-wrap rounded-xl bg-[#f8f9fa] p-4 text-sm leading-6 text-slate-700'>
                {student.notes || '메모 내용이 없습니다.'}
              </div>
            )}
          </div>

          {subjects.length > 0 && (
            <div className='mb-3 flex flex-wrap gap-1'>
              {subjects.map((subject) => (
                <span key={subject} className='dashboard-subject-chip rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700'>{subject}</span>
              ))}
            </div>
          )}

          {error && <div className='mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</div>}
          {notice && <div className='mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600'>{notice}</div>}
        </div>

        <div className='flex items-center justify-end gap-2 px-6 pb-5 pt-0'>
          {isEditing ? (
            <>
              <button type='button' onClick={handleCancelEdit} className='inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>취소</button>
              <button
                type='button'
                onClick={handleSave}
                disabled={saving}
                className='inline-flex h-10 items-center rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {saving ? '저장중...' : '저장'}
              </button>
            </>
          ) : (
            <button type='button' onClick={onClose} className='inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca]'>확인</button>
          )}
        </div>
      </div>
    </div>
  )
}

const TutorDashboardContent = () => {
  const { isLoading: authLoading, isLogin, hasRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mypage, setMypage] = useState(null)
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [threadTarget, setThreadTarget] = useState(null)
  const [studentDetailTarget, setStudentDetailTarget] = useState(null)
  const [actionModal, setActionModal] = useState({ action: '', booking: null })

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/tutors/me')
      setMypage(response.data?.data || null)
    } catch {
      setError('대시보드 데이터를 불러오지 못했습니다.')
      setMypage(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isLogin) {
      setLoading(false)
      return
    }
    loadDashboard()
  }, [authLoading, isLogin, loadDashboard])

  const upcomingLessons = mypage?.upcomingLessons ?? EMPTY_LIST
  const pastLessons = mypage?.pastLessons ?? EMPTY_LIST

  const bookings = useMemo(() => {
    return [...upcomingLessons, ...pastLessons].sort((left, right) => toTimeValue(right?.startAt) - toTimeValue(left?.startAt))
  }, [upcomingLessons, pastLessons])

  const pendingBookings = useMemo(() => bookings.filter((booking) => getBookingActionState(booking) === 'PENDING'), [bookings])

  const derivedStudents = useMemo(() => {
    const map = new Map()

    bookings.forEach((booking) => {
      const key = String(booking?.studentId || booking?.studentName || booking?.bookingId || '')
      if (!key) return

      const current = map.get(key) || {
        id: booking?.studentId || key,
        name: booking?.studentName || '학생',
        email: booking?.studentEmail || '',
        phone: booking?.studentPhone || '',
        subjects: new Set(),
        totalSessions: 0,
        lastSession: null,
        progress: '',
        notes: '',
      }

      current.totalSessions += 1
      if (booking?.subject) current.subjects.add(booking.subject)

      const startAt = parseDate(booking?.startAt)
      if (startAt && (!current.lastSession || startAt > current.lastSession)) {
        current.lastSession = startAt
      }

      map.set(key, current)
    })

    return Array.from(map.values()).map((student) => ({
      ...student,
      subjects: Array.from(student.subjects),
    })).sort((left, right) => toTimeValue(right.lastSession) - toTimeValue(left.lastSession))
  }, [bookings])

  const students = useMemo(() => {
    const source = Array.isArray(mypage?.students) && mypage.students.length > 0 ? mypage.students : derivedStudents
    return source.map(normalizeStudent)
  }, [derivedStudents, mypage?.students])

  const openBookingActionModal = (booking, action) => {
    if (!booking?.bookingId || !getActionModalMeta(action)) return
    setActionModal({ action, booking })
  }

  const closeBookingActionModal = () => {
    if (actionLoadingId) return
    setActionModal({ action: '', booking: null })
  }

  const executeBookingAction = async (booking, action) => {
    const bookingId = booking?.bookingId
    if (!bookingId) return false

    const endpointMap = {
      accept: `/bookings/${bookingId}/confirm`,
      reject: `/bookings/${bookingId}/cancel`,
      complete: `/bookings/${bookingId}/complete`,
    }

    const successMessageMap = {
      accept: '예약이 수락되었습니다.',
      reject: '예약이 거절되었습니다.',
      complete: '수업이 완료 처리되었습니다.',
    }

    if (!endpointMap[action]) return false

    setNotice('')
    setNoticeError('')
    setActionLoadingId(bookingId)

    try {
      const response = await api.put(endpointMap[action])
      if (response.data?.success === false) {
        throw new Error(response.data?.message || '처리에 실패했습니다.')
      }

      setNotice(successMessageMap[action])
      await loadDashboard()
      return true
    } catch (actionError) {
      setNoticeError(actionError?.response?.data?.message || actionError?.message || '처리에 실패했습니다.')
      return false
    } finally {
      setActionLoadingId('')
    }
  }

  const confirmBookingAction = async () => {
    if (!actionModal.booking || !actionModal.action) return
    const succeeded = await executeBookingAction(actionModal.booking, actionModal.action)
    if (succeeded) setActionModal({ action: '', booking: null })
  }
  const acceptAllBookings = async () => {
    if (pendingBookings.length === 0) {
      setNotice('수락할 예약이 없습니다.')
      setNoticeError('')
      return
    }

    if (!window.confirm(`대기 중 예약 ${pendingBookings.length}건을 모두 수락하시겠습니까?`)) return

    setNotice('')
    setNoticeError('')
    setActionLoadingId('__all__')

    try {
      for (const booking of pendingBookings) {
        await api.put(`/bookings/${booking.bookingId}/confirm`)
      }
      setNotice(`대기 중 예약 ${pendingBookings.length}건을 수락했습니다.`)
      await loadDashboard()
    } catch (actionError) {
      setNoticeError(actionError?.response?.data?.message || '전체 수락 처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoadingId('')
    }
  }

  const openThread = (booking) => {
    if (!booking?.bookingId || !booking?.studentId) return
    setThreadTarget({
      bookingId: booking.bookingId,
      studentId: booking.studentId,
      studentName: booking.studentName,
      subject: booking.subject,
    })
  }

  const closeThread = () => {
    setThreadTarget(null)
  }

  const openStudentDetail = (student) => {
    setStudentDetailTarget(normalizeStudent(student))
  }

  const closeStudentDetail = () => {
    setStudentDetailTarget(null)
  }

  const handleStudentSaved = (updatedStudent) => {
    const normalized = normalizeStudent(updatedStudent)
    setStudentDetailTarget(normalized)
    setMypage((prev) => {
      if (!prev || !Array.isArray(prev.students)) return prev
      return {
        ...prev,
        students: prev.students.map((item) => {
          const itemId = item?.id ?? item?.studentId ?? item?.name
          return itemId === normalized.id ? { ...item, progress: normalized.progress, notes: normalized.notes } : item
        }),
      }
    })
  }

  const isTutor = hasRole('ROLE_TUTOR') || hasRole('ROLE_TUTOR_PENDING') || hasRole('TUTOR')

  if (authLoading || loading) {
    return (
      <Layout>
        <section className='bg-white py-12'>
          <div className='mx-auto flex min-h-[50vh] w-full max-w-[1140px] items-center justify-center px-3'>
            <div className='h-10 w-10 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent' />
          </div>
        </section>
      </Layout>
    )
  }

  if (!isLogin) {
    return (
      <Layout>
        <section className='bg-white py-12'>
          <div className='mx-auto w-full max-w-[1140px] px-3'>
            <div className='dashboard-panel rounded-md border border-[#dee2e6] bg-white px-6 py-16 text-center shadow-sm'>
              <h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
              <p className='mt-2 text-slate-500'>튜터 대시보드를 보려면 로그인해 주세요.</p>
              <Link to='/login' className='mt-6 inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]'>로그인하기</Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  if (!isTutor) {
    return (
      <Layout>
        <section className='bg-white py-12'>
          <div className='mx-auto w-full max-w-[1140px] px-3'>
            <div className='dashboard-panel rounded-md border border-[#dee2e6] bg-white px-6 py-16 text-center shadow-sm'>
              <h2 className='text-2xl font-bold text-slate-900'>접근 권한이 없습니다</h2>
              <p className='mt-2 text-slate-500'>튜터 계정에서만 접근할 수 있습니다.</p>
              <Link to='/member/mypage' className='mt-6 inline-flex h-[38px] items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50'>회원 마이페이지</Link>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <section className='bg-white py-12'>
          <div className='mx-auto w-full max-w-[1140px] px-3'>
            <div className='dashboard-panel rounded-md border border-[#dee2e6] bg-white px-6 py-16 text-center shadow-sm'>
              <h2 className='text-2xl font-bold text-slate-900'>오류가 발생했습니다</h2>
              <p className='mt-2 text-slate-500'>{error}</p>
              <button type='button' onClick={loadDashboard} className='mt-6 inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]'>다시 시도</button>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  const tutorName = mypage?.tutorProfile?.name || mypage?.tutorProfile?.nickname || '튜터'

  return (
    <Layout>
      <section className='tutor-dashboard-page bg-white py-5'>
        <div className='mx-auto w-full max-w-[1140px] px-3'>
          <div className='mb-4'>
            <h2 className='mb-1 text-[1.75rem] font-bold text-slate-900'>튜터 대시보드</h2>
            <p className='mb-0 text-sm text-slate-500'>Mock 데이터 화면입니다.</p>
          </div>

          {notice && <div className='mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700'>{notice}</div>}
          {noticeError && <div className='mb-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{noticeError}</div>}

          <div className='space-y-4'>
            <div className='dashboard-panel rounded-md border border-[#dee2e6] bg-white shadow-sm'>
              <div className='dashboard-panel-body p-6'>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                  <h3 className='text-lg font-bold text-slate-900'>예약 목록</h3>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={acceptAllBookings}
                      disabled={actionLoadingId === '__all__' || pendingBookings.length === 0}
                      className='inline-flex h-[31px] items-center rounded-md bg-[#4f46e5] px-3 text-xs font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {actionLoadingId === '__all__' ? '처리중...' : (pendingBookings.length > 0 ? `전체 수락 (${pendingBookings.length}건)` : '전체 수락')}
                    </button>
                    <Link to='/tutor/mypage' className='inline-flex h-[31px] items-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>전체 보기</Link>
                  </div>
                </div>

                <div className='dashboard-booking-grid grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                  {bookings.length === 0 ? (
                    <div className='col-span-full rounded-md border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500'>예약 내역이 없습니다.</div>
                  ) : bookings.map((booking) => (
                    <BookingCard
                      key={booking.bookingId || `${booking.studentId}-${booking.startAt}`}
                      booking={booking}
                      actionLoadingId={actionLoadingId}
                      onAction={openBookingActionModal}
                      onMessage={openThread}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='dashboard-panel rounded-md border border-[#dee2e6] bg-white shadow-sm'>
              <div className='dashboard-panel-body p-6'>
                <h3 className='mb-3 text-lg font-bold text-slate-900'>학생 목록</h3>
                <div className='dashboard-student-grid grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                  {students.length === 0 ? (
                    <div className='col-span-full rounded-md border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500'>등록된 학생이 없습니다.</div>
                  ) : students.map((student) => (
                    <div key={student.id || student.name} className='dashboard-student-card dashboard-card-surface h-full rounded-md border border-[#dee2e6] bg-white p-4'>
                      <div className='mb-3 flex items-center gap-3'>
                        <div className='dashboard-student-avatar flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#4f46e5] text-[1.5rem] font-bold text-white'>{getInitial(student.name)}</div>
                        <div>
                          <h4 className='text-base font-bold text-slate-900'>{student.name}</h4>
                          <div className='text-xs text-slate-500'>{student.email || '-'}</div>
                          <div className='text-xs text-slate-500'>{student.phone || '-'}</div>
                        </div>
                      </div>

                      <div className='mb-3 flex flex-wrap gap-1'>
                        {student.subjects.length === 0 ? (
                          <span className='dashboard-subject-chip rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'>과목 없음</span>
                        ) : student.subjects.map((subject) => (
                          <span key={subject} className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700'>{subject}</span>
                        ))}
                      </div>

                      <div className='mb-3 flex items-start justify-between text-xs text-slate-500'>
                        <div>총 수업 <span className='font-bold text-slate-800'>{student.totalSessions}</span>회</div>
                        <div className='text-right'>
                          <div>마지막 수업</div>
                          <div>{formatDate(student.lastSession, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                        </div>
                      </div>

                      <button type='button' onClick={() => openStudentDetail(student)} className='dashboard-secondary-action inline-flex h-[31px] w-full items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50'>상세보기</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingActionModal
        action={actionModal.action}
        booking={actionModal.booking}
        loading={Boolean(actionLoadingId && actionLoadingId !== '__all__')}
        onClose={closeBookingActionModal}
        onConfirm={confirmBookingAction}
      />
      <MessageThreadModal
        isOpen={Boolean(threadTarget)}
        onClose={closeThread}
        viewer='tutor'
        bookingId={threadTarget?.bookingId}
        studentId={threadTarget?.studentId}
        studentName={threadTarget?.studentName}
        tutorName={tutorName}
        subject={threadTarget?.subject}
      />
      <StudentDetailModal
        isOpen={Boolean(studentDetailTarget)}
        student={studentDetailTarget}
        tutorName={tutorName}
        onClose={closeStudentDetail}
        onSaved={handleStudentSaved}
      />
    </Layout>
  )
}

export default TutorDashboardContent