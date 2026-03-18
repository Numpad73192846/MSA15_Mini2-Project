import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginContextProvider from './utils/context/LoginContextProvider'
import Auth from './pages/Auth'
import Tutors from './pages/Tutors'
import TutorDetail from './pages/TutorDetail'
import MemberMyPage from './pages/MemberMyPage'
import TutorMyPage from './pages/TutorMyPage'
import TutorDashboard from './pages/TutorDashboard'
import TutorProfileEdit from './pages/TutorProfileEdit'
import MemberProfileEdit from './pages/MemberProfileEdit'
import About from './pages/About'
import Guide from './pages/Guide'
import LanguageGuide from './pages/LanguageGuide'
import KoreanGame from './pages/KoreanGame'
import Faq from './pages/Faq'
import Contact from './pages/Contact'
import Jobs from './pages/Jobs'
import Partner from './pages/Partner'
import Policies from './pages/Policies'
import TutorGuide from './pages/TutorGuide'
import TutorRegister from './pages/TutorRegister'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFail from './pages/PaymentFail'
import Admin from './pages/Admin'
import TutorScheduleEdit from './pages/TutorScheduleEdit'
import AdminPartialRedirect from './pages/AdminPartialRedirect'

function App() {

  return (
    <BrowserRouter>
      <LoginContextProvider>
        <Routes>
          <Route path='/' element={ <Home /> } />
          <Route path='/login' element={ <Auth initialTab='login' /> } />
          <Route path='/join' element={ <Auth initialTab='signup' /> } />
          <Route path='/about' element={ <About /> } />
          <Route path='/guide' element={ <TutorGuide /> } />
          <Route path='/guide/overview' element={ <Guide /> } />
          <Route path='/guide/tutor-guide' element={ <TutorGuide /> } />
          <Route path='/guide/language' element={ <LanguageGuide /> } />
          <Route path='/guide/policies' element={ <Policies /> } />
          <Route path='/faq' element={ <Faq /> } />
          <Route path='/contact' element={ <Contact /> } />
          <Route path='/jobs' element={ <Jobs /> } />
          <Route path='/partnership' element={ <Partner /> } />
          <Route path='/guide/jobs' element={ <Jobs /> } />
          <Route path='/guide/partner' element={ <Partner /> } />
          <Route path='/payments/toss/success' element={ <PaymentSuccess /> } />
          <Route path='/payments/toss/fail' element={ <PaymentFail /> } />
          <Route path='/admin' element={ <Admin /> } />
          <Route path='/admin/partial/:tab' element={ <AdminPartialRedirect /> } />
          <Route path='/tutors' element={ <Tutors /> } />
          <Route path='/tutors/:id' element={ <TutorDetail /> } />
          <Route path='/member/mypage' element={ <MemberMyPage /> } />
          <Route path='/mypage' element={ <MemberMyPage /> } />
          <Route path='/member/profile-edit' element={ <MemberProfileEdit /> } />
          <Route path='/tutor/mypage' element={ <TutorMyPage /> } />
          <Route path='/tutor/register' element={ <TutorRegister /> } />
          <Route path='/tutor/register1' element={ <TutorRegister /> } />
          <Route path='/tutor/register2' element={ <TutorRegister /> } />
          <Route path='/tutor/register3' element={ <TutorRegister /> } />
          <Route path='/tutor/profile-edit' element={ <TutorProfileEdit /> } />
          <Route path='/tutor/schedule-edit' element={ <TutorScheduleEdit /> } />
          <Route path='/tutor/dashboard' element={ <TutorDashboard /> } />
          <Route path='/game/korean' element={ <KoreanGame /> } />
        </Routes>
      </LoginContextProvider>
    </BrowserRouter>
  )
}

export default App
