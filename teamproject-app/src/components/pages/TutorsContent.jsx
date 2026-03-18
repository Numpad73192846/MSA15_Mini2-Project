import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import moneyIcon from '../../assets/image/tutors/money.svg'
import starIcon from '../../assets/image/tutors/star.svg'
import timeIcon from '../../assets/image/tutors/time.svg'

const languageOptions = ['all', '한국어', '영어', '중국어', '일본어', '불어', '스페인어', '독일어', '러시아어']

const priceOptions = [
	{ value: 'all', label: '전체' },
	{ value: 'low', label: '~35,000원' },
	{ value: 'mid', label: '35,000~40,000원' },
	{ value: 'high', label: '40,000원~' },
]

const priceMap = {
	low: { min: 0, max: 35000 },
	mid: { min: 35000, max: 40000 },
	high: { min: 40000, max: 1000000 },
}

const generalFieldOptions = ['회화', '문법', '읽기', '작문', '발음']
const domainFieldOptions = ['학교', '비즈니스', '여행', '노래', '영화', '드라마', '문화']

const baseChipClass = 'rounded-[20px] border border-[#ddd] px-3 py-[5px] text-xs transition-all duration-200'

const TutorsContent = () => {
	const [searchInput, setSearchInput] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedLanguage, setSelectedLanguage] = useState('all')
	const [selectedPrice, setSelectedPrice] = useState('all')
	const [selectedFields, setSelectedFields] = useState([])
	const [tutors, setTutors] = useState([])
	const [loading, setLoading] = useState(true)
	const [openMenu, setOpenMenu] = useState('')
	const dropdownRef = useRef(null)

	const selectedLanguageLabel = selectedLanguage === 'all' ? '전체 언어' : selectedLanguage
	const selectedPriceLabel = selectedPrice === 'all' ? '전체 가격' : (priceOptions.find((item) => item.value === selectedPrice)?.label || '전체 가격')
	const selectedCategoryLabel = selectedFields.length === 0 ? '수업 분야 선택' : `${selectedFields.length}개 선택됨`

	const query = useMemo(() => {
		const params = new URLSearchParams()

		if (searchTerm) {
			params.set('searchTerm', searchTerm)
		}

		if (selectedLanguage !== 'all') {
			params.set('language', selectedLanguage)
		}

		if (selectedFields.length > 0) {
			params.set('subjects', selectedFields.join(','))
		}

		if (selectedPrice !== 'all') {
			const range = priceMap[selectedPrice]
			if (range) {
				params.set('minPrice', String(range.min))
				params.set('maxPrice', String(range.max))
			}
		}

		return params.toString()
	}, [searchTerm, selectedLanguage, selectedFields, selectedPrice])

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearchTerm(searchInput.trim())
		}, 300)

		return () => window.clearTimeout(timer)
	}, [searchInput])

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpenMenu('')
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [])

	useEffect(() => {
		let active = true

		const fetchTutors = async () => {
			setLoading(true)
			try {
				const response = await api.get(`/tutors${query ? `?${query}` : ''}`)
				const result = response.data
				if (!active) return
				setTutors(result?.success ? (result.data || []) : [])
			} catch {
				if (!active) return
				setTutors([])
			} finally {
				if (active) {
					setLoading(false)
				}
			}
		}

		fetchTutors()
		return () => {
			active = false
		}
	}, [query])

	const toggleMenu = (key) => {
		setOpenMenu((prev) => (prev === key ? '' : key))
	}

	const toggleField = (field) => {
		setSelectedFields((prev) => (prev.includes(field) ? prev.filter((item) => item !== field) : [...prev, field]))
	}

	const getProfileImageUrl = (img) => {
		if (!img) return ''
		const trimmed = String(img).trim()
		if (!trimmed) return ''
		if (trimmed.startsWith('http') || trimmed.startsWith('/')) return trimmed
		return `/${trimmed}`
	}

	return (
		<Layout>
			<section className='py-12'>
				<div className='mx-auto w-full max-w-[1140px] px-3' ref={dropdownRef}>
					<div className='mb-4'>
						<h2 className='mb-1 text-[1.75rem] font-bold leading-tight text-[#212529]'>튜터 찾기</h2>
						<p className='mb-0 text-base text-[#6c757d]'>나에게 맞는 전문 튜터를 찾아보세요</p>
					</div>

					<div className='mb-4 rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
						<div className='p-4'>
							<div className='grid grid-cols-1 items-end gap-3 md:grid-cols-4'>
								<div>
									<label className='mb-2 block text-base text-[#212529]'>검색</label>
									<input
										id='tutorSearch'
										type='text'
										value={searchInput}
										onChange={(event) => setSearchInput(event.target.value)}
										placeholder='튜터 이름 또는 과목 검색...'
										className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:text-[#212529] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]'
									/>
								</div>

								<div className='relative'>
									<label className='mb-2 block text-base text-[#212529]'>언어</label>
									<button
										type='button'
										onClick={() => toggleMenu('language')}
										className='relative h-[38px] w-full rounded-md border border-[#ced4da] bg-white px-3 pr-8 text-left text-base text-[#212529]'
									>
										{selectedLanguageLabel}
										<span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#6c757d]'>▼</span>
									</button>
									<div className={`absolute left-0 right-0 top-full z-[1000] mt-1 max-h-[200px] overflow-y-auto rounded border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 ${openMenu === 'language' ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-[10px] opacity-0'}`}>
										<div className='border-b border-[#e9ecef] bg-[#f8f9fa] px-[14px] py-[10px] text-xs font-semibold text-[#212529]'>
											언어 선택
										</div>
										<div className='flex flex-wrap gap-[6px] px-[14px] py-[10px]'>
											{languageOptions.map((option) => {
												const selected = selectedLanguage === option
												return (
													<button
														key={option}
														type='button'
														onClick={() => setSelectedLanguage(option)}
														className={`${baseChipClass} ${selected ? 'bg-[#0066cc] text-white' : 'bg-[#f0f0f0] text-black'}`}
													>
														{option === 'all' ? '전체' : option}
													</button>
												)
											})}
										</div>
									</div>
								</div>

								<div className='relative'>
									<label className='mb-2 block text-base text-[#212529]'>카테고리</label>
									<button
										type='button'
										onClick={() => toggleMenu('category')}
										className='relative h-[38px] w-full rounded-md border border-[#ced4da] bg-white px-3 pr-8 text-left text-base text-[#212529]'
									>
										{selectedCategoryLabel}
										<span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#6c757d]'>▼</span>
									</button>
									<div className={`absolute left-0 right-0 top-full z-[1000] mt-1 max-h-[250px] overflow-y-auto rounded border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 ${openMenu === 'category' ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-[10px] opacity-0'}`}>
										<div className='border-b border-[#e9ecef] bg-[#f8f9fa] px-[14px] py-[10px] text-xs font-semibold text-[#212529]'>
											일반
										</div>
										<div className='flex flex-wrap gap-[6px] px-[14px] py-[10px]'>
											{generalFieldOptions.map((field) => {
												const selected = selectedFields.includes(field)
												return (
													<button
														key={field}
														type='button'
														onClick={() => toggleField(field)}
														className={`${baseChipClass} ${selected ? 'bg-[#0066cc] text-white' : 'bg-[#f0f0f0] text-black'}`}
													>
														{field}
													</button>
												)
											})}
										</div>
										<div className='border-y border-[#e9ecef] bg-[#f8f9fa] px-[14px] py-[10px] text-xs font-semibold text-[#212529]'>
											분야별
										</div>
										<div className='flex flex-wrap gap-[6px] px-[14px] py-[10px]'>
											{domainFieldOptions.map((field) => {
												const selected = selectedFields.includes(field)
												return (
													<button
														key={field}
														type='button'
														onClick={() => toggleField(field)}
														className={`${baseChipClass} ${selected ? 'bg-[#0066cc] text-white' : 'bg-[#f0f0f0] text-black'}`}
													>
														{field}
													</button>
												)
											})}
										</div>
									</div>
								</div>

								<div className='relative'>
									<label className='mb-2 block text-base text-[#212529]'>가격대</label>
									<button
										type='button'
										onClick={() => toggleMenu('price')}
										className='relative h-[38px] w-full rounded-md border border-[#ced4da] bg-white px-3 pr-8 text-left text-base text-[#212529]'
									>
										{selectedPriceLabel}
										<span className='pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#6c757d]'>▼</span>
									</button>
									<div className={`absolute left-0 right-0 top-full z-[1000] mt-1 max-h-[200px] overflow-y-auto rounded border border-[#ddd] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 ${openMenu === 'price' ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-[10px] opacity-0'}`}>
										<div className='border-b border-[#e9ecef] bg-[#f8f9fa] px-[14px] py-[10px] text-xs font-semibold text-[#212529]'>
											가격대 선택
										</div>
										<div className='flex flex-wrap gap-[6px] px-[14px] py-[10px]'>
											{priceOptions.map((item) => {
												const selected = selectedPrice === item.value
												return (
													<button
														key={item.value}
														type='button'
														onClick={() => setSelectedPrice(item.value)}
														className={`${baseChipClass} ${selected ? 'bg-[#0066cc] text-white' : 'bg-[#f0f0f0] text-black'}`}
													>
														{item.label}
													</button>
												)
											})}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{!loading && tutors.length === 0 && (
						<div className='py-12 text-center'>
								<p className='mb-0 text-[1.25rem] text-[#6c757d]'>검색 결과가 없습니다.</p>
						</div>
					)}

					{tutors.length > 0 && (
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
							{tutors.map((tutor) => {
								const subjectList = (tutor.subjects || '').split(',').map((item) => item.trim()).filter(Boolean)
								const profileImage = getProfileImageUrl(tutor.profileImg)

								return (
									<div key={tutor.id} className='h-full rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
										<div className='p-4'>
											<div className='flex gap-3'>
												<div className={`flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full text-2xl text-white ${profileImage ? '' : 'bg-[#0d6efd]'}`}>
													{profileImage ? (
														<img src={profileImage} alt='프로필 이미지' className='h-full w-full object-cover' />
													) : (
														(tutor.name || '튜터').charAt(0)
													)}
												</div>
												<div className='flex-1'>
													<div className='text-[1.25rem] font-bold text-[#212529]'>{tutor.nickname || '튜터'}</div>
													<div className='mb-2 flex items-center text-sm text-[#6c757d]'>
														<img src={starIcon} alt='별점' className='mr-1 h-4 w-4' />
														<span className='font-semibold text-[#212529]'>{tutor.ratingAvg || '-'}</span>
														<span className='ml-1'>({tutor.reviewCount || 0})</span>
													</div>
													<div className='flex flex-wrap gap-1'>
														{subjectList.map((subject) => (
															<span key={`${tutor.id}-${subject}`} className='inline-flex rounded-md bg-[#f8f9fa] px-[0.65em] py-[0.35em] text-[0.75em] font-bold text-black'>
																{subject}
															</span>
														))}
													</div>
												</div>
											</div>

											<p className='mb-3 mt-3 text-[#6c757d]'>{tutor.bio || ''}</p>

											<div className='mb-1 flex items-center text-sm text-[#6c757d]'>
												<img src={timeIcon} alt='경력' className='mr-1 h-4 w-4' />
												경력 <span className='ml-1'>{tutor.experience || '정보 없음'}</span>
											</div>
											<div className='mb-3 flex items-center text-sm'>
												<img src={moneyIcon} alt='가격' className='mr-1 h-4 w-4' />
												<span className='font-semibold text-[#0d6efd]'>수업당 <span>{tutor.price ? Number(tutor.price).toLocaleString() : '가격 미정'}</span>원</span>
											</div>

											<Link
												to={`/tutors/${tutor.id}`}
												className='mt-[21px] inline-flex w-full items-center justify-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-5 py-[10px] text-base font-normal leading-6 !text-white transition-colors duration-150 hover:border-[#4338ca] hover:bg-[#4338ca] hover:!text-white active:border-[#3730a3] active:bg-[#3730a3] active:!text-white'
											>
												프로필 보기
											</Link>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</div>
			</section>
		</Layout>
	)
}

export default TutorsContent
