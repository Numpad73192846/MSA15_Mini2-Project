/**
 * 튜터 캘린더 공통 JS 라이브러리
 * 용도: register3, mypage(인라인), schedule-edit, tutors/detail(읽기)
 */

class TutorCalendar {
    constructor(options = {}) {
        this.options = {
            containerId: 'tutorScheduleCalendar',
            prevBtnId: 'btnPrevWeek',
            nextBtnId: 'btnNextWeek',
            rangeLabelId: 'weekRangeLabel',
            mode: 'edit', // 'edit' | 'readonly'
            maxWeeks: 9,
            timeStepMinutes: 30,
            renderOnlyInRange: false,
            singleSlotPerDay: false,
            onSlotClick: null,
            onWeekChange: null,
            onBookedSlotHover: null,
            initialData: null, // {date: 'yyyy-MM-dd', slots: ['HH:mm', ...]}[]
            availableSlots: null, // {date: 'yyyy-MM-dd', slots: ['HH:mm', ...]}[]
            availableSlotsOnly: false,
            focusFirstDataWeek: false,
            baseTimeRanges: {
                0: [{ start: '09:00', end: '22:00' }],
                1: [{ start: '09:00', end: '22:00' }],
                2: [{ start: '09:00', end: '22:00' }],
                3: [{ start: '09:00', end: '22:00' }],
                4: [{ start: '09:00', end: '22:00' }],
                5: [{ start: '09:00', end: '22:00' }],
                6: [{ start: '09:00', end: '22:00' }]
            },
            ...options
        };

        this.state = {
            weekStart: null,
            selectedSlots: new Map(),
            bookedSlots: new Map(), // 예약된 슬롯 (읽기 전용)
            bookedSlotMeta: new Map(), // key: yyyy-MM-dd|HH:mm
            availableSlots: new Map()
        };

        this.init();
    }

    init() {
        this.initWeekStart();
        this.loadInitialData();
        this.loadAvailableSlots();
        this.focusWeekWithDataIfNeeded();
        this.render();
        this.updateNavigationButtons();
        this.bindEvents();
    }

    initWeekStart() {
        const today = new Date();
        const day = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - day);
        this.state.weekStart = sunday;
    }

    loadInitialData() {
        if (!this.options.initialData) return;
        
        this.options.initialData.forEach(({ date, slots, booked, metaByTime }) => {
            if (!date || !Array.isArray(slots)) return;
            if (booked) {
                this.state.bookedSlots.set(date, new Set(slots));
                if (metaByTime && typeof metaByTime === 'object') {
                    slots.forEach((time) => {
                        if (metaByTime[time]) {
                            this.state.bookedSlotMeta.set(`${date}|${time}`, metaByTime[time]);
                        }
                    });
                }
            } else {
                this.state.selectedSlots.set(date, new Set(slots));
            }
        });
    }

    setInitialData(initialData = []) {
        this.options.initialData = initialData;
        this.state.selectedSlots.clear();
        this.state.bookedSlots.clear();
        this.state.bookedSlotMeta.clear();
        this.loadInitialData();
        this.render();
    }

    loadAvailableSlots() {
        if (!this.options.availableSlots) return;

        this.options.availableSlots.forEach(({ date, slots }) => {
            this.state.availableSlots.set(date, new Set(slots));
        });
    }

    focusWeekWithDataIfNeeded() {
        if (!this.options.focusFirstDataWeek) return;

        const currentWeekKeys = this.getWeekDates(this.state.weekStart).map((d) => this.formatDate(d));
        const hasCurrentWeekData = currentWeekKeys.some((key) => (
            (this.state.selectedSlots.get(key)?.size || 0) > 0
            || (this.state.bookedSlots.get(key)?.size || 0) > 0
            || (this.state.availableSlots.get(key)?.size || 0) > 0
        ));
        if (hasCurrentWeekData) return;

        const allDateKeys = new Set([
            ...this.state.selectedSlots.keys(),
            ...this.state.bookedSlots.keys(),
            ...this.state.availableSlots.keys()
        ]);
        if (allDateKeys.size === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySunday = new Date(today);
        todaySunday.setDate(today.getDate() - today.getDay());

        const candidates = Array.from(allDateKeys)
            .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(String(key)))
            .map((key) => new Date(`${key}T00:00:00`))
            .filter((d) => !Number.isNaN(d.getTime()) && d >= todaySunday)
            .sort((a, b) => a.getTime() - b.getTime());

        if (candidates.length === 0) return;

        const firstDate = candidates[0];
        const sunday = new Date(firstDate);
        sunday.setDate(firstDate.getDate() - firstDate.getDay());
        this.state.weekStart = sunday;
    }

    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    formatLabel(date) {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${m}.${d}`;
    }

    getWeekDates(weekStart) {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            dates.push(d);
        }
        return dates;
    }

    isTimeInRange(time, dayOfWeek) {
        const ranges = this.options.baseTimeRanges[dayOfWeek];
        if (!ranges || ranges.length === 0) return false;
        
        for (const range of ranges) {
            if (time >= range.start && time < range.end) {
                return true;
            }
        }
        return false;
    }

    isPartTime(dateKey, time) {
        const now = new Date();
        const [hour, minute] = time.split(':').map(Number);
        const slotDate = new Date(dateKey);
        slotDate.setHours(hour, minute, 0, 0);
        return slotDate < now;
    }

    buildTimeSlots(container, dateKey, dayOfWeek) {
        container.innerHTML = '';
        const step = Math.max(15, Number(this.options.timeStepMinutes) || 30);
        const totalMinutes = 24 * 60;
        const timeSlots = [];

        for (let minutes = 0; minutes < totalMinutes; minutes += step) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const inRange = this.isTimeInRange(time, dayOfWeek);
            const isBooked = this.state.bookedSlots.get(dateKey)?.has(time);
            const isSelected = this.state.selectedSlots.get(dateKey)?.has(time);

            // Keep persisted slots visible even when base time ranges are changed or empty.
            if (this.options.renderOnlyInRange && !inRange && !isBooked && !isSelected) continue;

            if (this.options.availableSlotsOnly) {
                const availableSet = this.state.availableSlots.get(dateKey);
                if ((!availableSet || !availableSet.has(time)) && !isBooked && !isSelected) {
                    continue;
                }
            }

            const isPast = this.isPartTime(dateKey, time);
            
            timeSlots.push({
                time,
                inRange,
                isBooked,
                isSelected,
                isPast,
                minutes
            });
        }

        timeSlots.sort((a, b) => a.minutes - b.minutes);

        timeSlots.forEach(slot => {
            const wrap = document.createElement('div');
            let className = 'sch_time';
            if (this.options.renderOnlyInRange && !slot.inRange && !slot.isBooked && !slot.isSelected) className += ' off';
            if (slot.isPast) className += ' past disabled';
            if (slot.isBooked) className += ' booked disabled';
            else if (slot.isSelected) className += ' selected';
            wrap.className = className;

            const a = document.createElement('a');
            a.className = 'time_in en';
            a.dataset.time = slot.time;
            a.dataset.date = dateKey;
            a.dataset.inRange = slot.inRange ? 'true' : 'false';
            a.innerHTML = `${slot.time}<p class="sch_dsttime ${slot.inRange ? 'on' : 'off'}"></p>`;

            if (slot.isBooked) {
                const meta = this.state.bookedSlotMeta.get(`${dateKey}|${slot.time}`);
                if (meta) {
                    a.classList.add('booked-hover-enabled');
                    const preview = [meta.studentName, meta.subject].filter(Boolean).join(' | ');
                    if (preview) {
                        a.title = preview;
                    }
                }
            }

            wrap.appendChild(a);
            container.appendChild(wrap);
        });
    }

    updateWeekHeader() {
        const dates = this.getWeekDates(this.state.weekStart);
        const head = document.querySelector(`#${this.options.containerId} .dayHead`);
        const label = document.getElementById(this.options.rangeLabelId);

        if (label) {
            const startLabel = this.formatLabel(dates[0]);
            const endLabel = this.formatLabel(dates[6]);
            const startYear = dates[0].getFullYear();
            const endYear = dates[6].getFullYear();
            if (startYear === endYear) {
                label.textContent = `${startYear}.${startLabel} ~ ${endLabel}`;
            } else {
                label.textContent = `${startYear}.${startLabel} ~ ${endYear}.${endLabel}`;
            }
        }

        const dayTitles = ['일', '월', '화', '수', '목', '금', '토'];
        head.querySelectorAll('li').forEach((li, idx) => {
            const title = li.querySelector('.dayTit');
            const date = li.querySelector('.dayDate');
            if (title && date) {
                title.textContent = dayTitles[idx];
                date.textContent = this.formatLabel(dates[idx]);
            }
        });
    }

    render() {
        this.updateWeekHeader();
        const dates = this.getWeekDates(this.state.weekStart);
        const body = document.querySelector(`#${this.options.containerId} .dayCon`);
        const columns = body.querySelectorAll('li .con_in');
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        columns.forEach((col, idx) => {
            const dateKey = this.formatDate(dates[idx]);
            const dayOfWeek = dates[idx].getDay();
            // 모바일용 날짜 레이블 설정
            const dateLabel = `${this.formatLabel(dates[idx])} (${dayNames[dayOfWeek]})`;
            col.setAttribute('data-date-label', dateLabel);
            this.buildTimeSlots(col, dateKey, dayOfWeek);
        });

        if (this.options.mode === 'readonly') {
            document.getElementById(this.options.containerId).classList.add('readonly');
        }

        this.syncHeaderPadding();
        this.updateNavigationButtons();
    }

    syncHeaderPadding() {
        const body = document.querySelector(`#${this.options.containerId} .dayCon`);
        const wrap = document.getElementById(this.options.containerId);
        if (!body || !wrap) return;
        const scrollbarWidth = Math.max(0, body.offsetWidth - body.clientWidth);
        wrap.style.setProperty('--tc-scrollbar-width', `${scrollbarWidth}px`);
    }

    toggleSlot(dateKey, time) {
        if (this.options.mode === 'readonly') return;

        if (!this.state.selectedSlots.has(dateKey)) {
            this.state.selectedSlots.set(dateKey, new Set());
        }
        const set = this.state.selectedSlots.get(dateKey);
        if (set.has(time)) {
            set.delete(time);
            if (set.size === 0) this.state.selectedSlots.delete(dateKey);
            return;
        }

        if (this.options.singleSlotPerDay) {
            this.state.selectedSlots.set(dateKey, new Set([time]));
        } else {
            set.add(time);
        }
    }

    getSelectedData() {
        const payload = [];
        this.state.selectedSlots.forEach((times, date) => {
            times.forEach((time) => payload.push({ date, time }));
        });
        return payload;
    }

    applyWeekPattern(weeks = 8) {
        const currentWeekDates = this.getWeekDates(this.state.weekStart);
        const weekPattern = [];
        
        currentWeekDates.forEach((date, idx) => {
            const dateKey = this.formatDate(date);
            const times = this.state.selectedSlots.get(dateKey);
            weekPattern.push({
                dayOfWeek: idx,
                times: times ? new Set(times) : new Set()
            });
        });

        for (let weekOffset = 1; weekOffset <= weeks; weekOffset++) {
            const targetWeekStart = new Date(this.state.weekStart);
            targetWeekStart.setDate(this.state.weekStart.getDate() + (weekOffset * 7));
            
            const targetWeekDates = this.getWeekDates(targetWeekStart);
            
            targetWeekDates.forEach((date, idx) => {
                const dateKey = this.formatDate(date);
                const pattern = weekPattern[idx];
                
                if (pattern.times.size > 0) {
                    this.state.selectedSlots.set(dateKey, new Set(pattern.times));
                } else {
                    this.state.selectedSlots.delete(dateKey);
                }
            });
        }

        this.render();
    }

    updateNavigationButtons() {
        const btnPrev = document.getElementById(this.options.prevBtnId);
        const btnNext = document.getElementById(this.options.nextBtnId);

        if (btnPrev) {
            btnPrev.disabled = !this.canMoveWeek(-1);
        }
        if (btnNext) {
            btnNext.disabled = !this.canMoveWeek(1);
        }
    }

    canMoveWeek(offsetWeeks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 오늘이 속한 주의 일요일 계산
        const todayDay = today.getDay();
        const todaySunday = new Date(today);
        todaySunday.setDate(today.getDate() - todayDay);
        
        // 이동하려는 주의 일요일 계산
        const target = new Date(this.state.weekStart);
        target.setDate(target.getDate() + offsetWeeks * 7);
        
        // 이전 주 제한: 오늘이 속한 주까지만
        if (offsetWeeks < 0) {
            return target >= todaySunday;
        }
        
        // 다음 주 제한: 오늘 기준 +9주까지
        const maxWeekStart = new Date(todaySunday);
        maxWeekStart.setDate(maxWeekStart.getDate() + (this.options.maxWeeks * 7));
        return target <= maxWeekStart;
    }

    bindEvents() {
        const btnPrev = document.getElementById(this.options.prevBtnId);
        const btnNext = document.getElementById(this.options.nextBtnId);
        const body = document.querySelector(`#${this.options.containerId} .dayCon`);
        window.addEventListener('resize', () => this.syncHeaderPadding());

        if (body) {
            body.addEventListener('mouseover', (e) => {
                if (typeof this.options.onBookedSlotHover !== 'function') return;
                const target = e.target.closest('a.time_in');
                if (!target || !body.contains(target)) {
                    this.options.onBookedSlotHover(null);
                    return;
                }

                const dateKey = target.dataset.date;
                const time = target.dataset.time;
                if (!dateKey || !time) {
                    this.options.onBookedSlotHover(null);
                    return;
                }

                const meta = this.state.bookedSlotMeta.get(`${dateKey}|${time}`);
                if (!meta) {
                    this.options.onBookedSlotHover(null);
                    return;
                }

                this.options.onBookedSlotHover({
                    ...meta,
                    date: dateKey,
                    time
                });
            });

            body.addEventListener('mouseout', (e) => {
                if (typeof this.options.onBookedSlotHover !== 'function') return;
                const from = e.target.closest('a.time_in');
                if (!from || !body.contains(from)) return;
                const to = e.relatedTarget && e.relatedTarget.closest
                    ? e.relatedTarget.closest('a.time_in')
                    : null;
                if (to && body.contains(to)) return;
                this.options.onBookedSlotHover(null);
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (!this.canMoveWeek(-1)) return;
                this.state.weekStart.setDate(this.state.weekStart.getDate() - 7);
                this.render();
                if (this.options.onWeekChange) this.options.onWeekChange(this.state.weekStart);
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (!this.canMoveWeek(1)) return;
                this.state.weekStart.setDate(this.state.weekStart.getDate() + 7);
                this.render();
                if (this.options.onWeekChange) this.options.onWeekChange(this.state.weekStart);
            });
        }

        if (body && this.options.mode !== 'readonly') {
            body.addEventListener('click', (e) => {
                const target = e.target.closest('a.time_in');
                if (!target) return;
                const dateKey = target.dataset.date;
                const time = target.dataset.time;
                const inRange = target.dataset.inRange === 'true';
                if (!dateKey || !time) return;

                // 예약된 슬롯은 클릭 불가
                if (this.state.bookedSlots.get(dateKey)?.has(time)) {
                    alert('이미 예약된 시간입니다.');
                    return;
                }

                if (this.isPartTime(dateKey, time)) {
                    alert('지나간 시간은 선택할 수 없습니다.');
                    return;
                }

                if (!inRange && this.options.renderOnlyInRange) {
                    alert('기본 수업 가능 시간대가 아닙니다.');
                    return;
                }

                this.toggleSlot(dateKey, time);
                this.render();
                
                if (this.options.onSlotClick) {
                    this.options.onSlotClick(dateKey, time, this.getSelectedData());
                }
            });
        }
    }
}
