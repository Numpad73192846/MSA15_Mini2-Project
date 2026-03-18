import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'

const TOTAL_QUESTIONS = 10

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const toGameQuestion = (item) => ({
	no: item.no,
	question: item.question,
	answer: item.answer,
	meaning: item.meaning,
	difficulty: item.difficulty,
	shuffledOptions: shuffle(item.options || []),
})

const KoreanGame = () => {
	const [questions, setQuestions] = useState([])
	const [index, setIndex] = useState(0)
	const [selected, setSelected] = useState(null)
	const [correct, setCorrect] = useState(0)
	const [wrong, setWrong] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const current = questions[index]
	const isFinished = index >= questions.length
	const score = useMemo(() => {
		if (questions.length === 0) return 0
		return Math.round((correct / questions.length) * 100)
	}, [correct, questions.length])

	const loadQuestions = async () => {
		setLoading(true)
		setError('')
		try {
			const response = await api.get(`game/korean-proverbs/random?count=${TOTAL_QUESTIONS}`)
			const loaded = (response.data?.data || []).map(toGameQuestion)
			setQuestions(loaded)
			setIndex(0)
			setSelected(null)
			setCorrect(0)
			setWrong(0)
		} catch {
			setQuestions([])
			setError('속담 문제를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadQuestions()
	}, [])

	const onSelect = (option) => {
		if (selected || !current) return
		setSelected(option)
		if (option === current.answer) {
			setCorrect((v) => v + 1)
		} else {
			setWrong((v) => v + 1)
		}
	}

	const onNext = () => {
		setSelected(null)
		setIndex((v) => v + 1)
	}

	const restart = () => {
		loadQuestions()
	}

	return (
		<Layout>
			<section className='bg-slate-100 px-4 py-10'>
				<div className='mx-auto max-w-4xl'>
					<div className='mb-6 text-center'>
						<h1 className='text-4xl font-extrabold text-[#4f46e5]'>한국어 속담 맞추기</h1>
						<p className='mt-2 text-slate-500'>빈칸에 들어갈 알맞은 단어를 선택해 보세요.</p>
					</div>

					<div className='mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
						<div className='grid grid-cols-3 text-center'>
							<div>
								<div className='text-xs text-slate-400'>문제</div>
								<div className='text-2xl font-bold text-[#4f46e5]'>{Math.min(index + 1, questions.length)} / {questions.length}</div>
							</div>
							<div>
								<div className='text-xs text-slate-400'>정답</div>
								<div className='text-2xl font-bold text-emerald-600'>{correct}</div>
							</div>
							<div>
								<div className='text-xs text-slate-400'>오답</div>
								<div className='text-2xl font-bold text-rose-600'>{wrong}</div>
							</div>
						</div>
					</div>

					{loading ? (
						<div className='rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
							<p className='text-slate-500'>문제를 불러오는 중입니다...</p>
						</div>
					) : error ? (
						<div className='rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm'>
							<p className='font-semibold text-rose-600'>{error}</p>
							<div className='mt-4'>
								<button type='button' onClick={loadQuestions} className='rounded-full bg-[#4f46e5] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4338ca]'>다시 불러오기</button>
							</div>
						</div>
					) : !isFinished ? (
						<div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
							<div className='mb-6 text-center'>
								<div className='inline-block rounded-xl bg-slate-50 px-5 py-4 text-2xl font-bold text-slate-800'>
									{current.question}
								</div>
							</div>

							<div className='grid gap-3 sm:grid-cols-2'>
								{current.shuffledOptions.map((option) => {
									const isCorrectOption = option === current.answer
									const isSelectedOption = option === selected
									let className = 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
									if (selected && isCorrectOption) className = 'border-emerald-500 bg-emerald-50 text-emerald-700'
									if (selected && isSelectedOption && !isCorrectOption) className = 'border-rose-500 bg-rose-50 text-rose-700'

									return (
										<button
											key={option}
											type='button'
											onClick={() => onSelect(option)}
											disabled={Boolean(selected)}
											className={`rounded-xl border px-4 py-3 text-lg font-semibold transition ${className}`}
										>
											{option}
										</button>
									)
								})}
							</div>

							{selected && (
								<div className={`mt-5 rounded-xl border p-4 text-center ${selected === current.answer ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
									<div className='text-lg font-bold'>
										{selected === current.answer ? '정답입니다!' : '틀렸습니다'}
									</div>
									{selected !== current.answer && (
										<div className='mt-1 text-sm'>정답: <span className='font-bold'>{current.answer}</span></div>
									)}
									<div className='mt-1 text-sm text-slate-600'>{current.meaning}</div>
								</div>
							)}

							<div className='mt-5 text-center'>
								<button
									type='button'
									onClick={onNext}
									disabled={!selected}
									className='rounded-full bg-[#4f46e5] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#4338ca]'
								>
									{index + 1 === questions.length ? '결과 보기' : '다음 문제'}
								</button>
							</div>
						</div>
					) : (
						<div className='rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
							<h2 className='text-3xl font-extrabold text-slate-900'>게임 종료!</h2>
							<p className='mt-2 text-slate-500'>수고하셨습니다. 결과를 확인해 보세요.</p>
							<div className='mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-5'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<div className='text-xs text-slate-400'>총 문제</div>
										<div className='text-3xl font-bold text-slate-800'>{questions.length}</div>
									</div>
									<div>
										<div className='text-xs text-slate-400'>정답</div>
										<div className='text-3xl font-bold text-emerald-600'>{correct}</div>
									</div>
								</div>
								<div className='mt-4 border-t border-slate-200 pt-4'>
									<div className='text-xs text-slate-400'>정답률</div>
									<div className='text-4xl font-extrabold text-[#4f46e5]'>{score}%</div>
								</div>
							</div>
							<div className='mt-6 flex flex-wrap justify-center gap-3'>
								<button type='button' onClick={restart} className='rounded-full bg-[#4f46e5] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4338ca]'>다시 시작</button>
								<Link to='/' className='rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'>홈으로</Link>
							</div>
						</div>
					)}

					<div className='mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
						<h3 className='font-bold text-slate-900'>게임 방법</h3>
						<ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600'>
							<li>속담의 빈칸에 들어갈 알맞은 단어를 선택하세요.</li>
							<li>4개의 보기 중 정답을 고르면 바로 결과가 표시됩니다.</li>
							<li>총 10문제가 랜덤 출제됩니다.</li>
						</ul>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default KoreanGame


