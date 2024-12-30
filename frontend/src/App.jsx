import './App.css'
import Home from './components/Home'
import Header from './components/Header'
import Form from './components/Form';
import Assessment from './components/Assessment'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import LearningMaterial from './components/LearningMaterial';
import Content from './components/Content'
import Login from './components/Login'
import Upload from './components/Upload'
import Chat from './components/Chat'
import Roadmap from './components/Roadmap'

function App() {

  return (
    <div>
      <Header />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/form' element={<Form/>}/>
        <Route path='/assessment' element={<Assessment />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/road-map' element={<Roadmap />} />
        <Route path='/learning' element={<LearningMaterial />}/>
        <Route path='/content' element={<Content />} />
        <Route path='/login' element={<Login />}/>
        <Route path='/resume-upload' element={<Upload />}/>
        <Route path='/chat' element={<Chat />}/>
      </Routes>
    </div>
  )
}

export default App