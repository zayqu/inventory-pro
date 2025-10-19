import './App.css'
import  {BrowserRouter as Router, Route, Routes} from 'react-router'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
      </Routes>
    </Router>
  )
}

export default App
